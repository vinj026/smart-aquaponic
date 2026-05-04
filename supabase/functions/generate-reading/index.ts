import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: thresholdData } = await supabase
      .from("system_thresholds")
      .select("*");
    if (!thresholdData) throw new Error("Could not fetch thresholds");
    const thresholds = Object.fromEntries(thresholdData.map(t => [t.id, t]));

    const { data: lastReading } = await supabase
      .from("sensor_readings")
      .select("*")
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    // ── Nilai ideal tengah zona normal ──────────────────────────
    const IDEAL = { ph: 7.0, tds: 500, turbidity: 1.5, water_level: 82 };

    // ── Ambil nilai sebelumnya, fallback ke ideal ────────────────
    const prev = {
      ph:          lastReading?.ph          ?? IDEAL.ph,
      tds:         lastReading?.tds         ?? IDEAL.tds,
      turbidity:   lastReading?.turbidity   ?? IDEAL.turbidity,
      water_level: lastReading?.water_level ?? IDEAL.water_level,
    };

    // ── Mean Reversion Helper ────────────────────────────────────
    const meanRevert = (
      current: number,
      ideal: number,
      noise: number,
      pull: number = 0.08
    ) => {
      const reversion = (ideal - current) * pull;
      const randomNoise = (Math.random() - 0.5) * noise;
      return current + reversion + randomNoise;
    };

    // ── Generate nilai baru dengan mean reversion ────────────────
    const rawPh          = meanRevert(prev.ph, IDEAL.ph, 0.08);
    const rawTds         = meanRevert(prev.tds, IDEAL.tds, 12);

    const tdsDeviation   = (rawTds - IDEAL.tds) / IDEAL.tds;
    const turbidityBias  = tdsDeviation * 0.4;
    const rawTurbidity   = meanRevert(prev.turbidity, IDEAL.turbidity, 0.15) + turbidityBias;

    const waterRecoveryTarget = thresholds.water_level
      ? Number(thresholds.water_level.min_normal) + 2
      : 72;
    const previousWaterStatus = lastReading?.water_level_status;
    const isRefilling    = prev.water_level < 70
      || ((previousWaterStatus === "warning" || previousWaterStatus === "danger")
        && prev.water_level < waterRecoveryTarget);
    const waterDelta     = isRefilling
      ? Math.random() * 3
      : -Math.random() * 0.3;
    const rawWaterLevel  = prev.water_level + waterDelta;

    // ── Clamp ke batas fisik yang masuk akal ────────────────────
    const raw = {
      ph:          parseFloat(Math.min(8.2, Math.max(6.2, rawPh)).toFixed(2)),
      tds:         Math.floor(Math.min(850, Math.max(250, rawTds))),
      turbidity:   parseFloat(Math.min(8.0, Math.max(0.2, rawTurbidity)).toFixed(2)),
      water_level: Math.floor(Math.min(100, Math.max(60, rawWaterLevel))),
    };

    // ── Status ───────────────────────────────────────────────────
    const getStatus = (id: string, val: number) => {
      const t = thresholds[id];
      if (!t) return "normal";
      if (val < Number(t.min_warning) || val > Number(t.max_warning)) return "danger";
      if (val < Number(t.min_normal)  || val > Number(t.max_normal))  return "warning";
      return "normal";
    };

    const getWaterLevelStatus = (val: number, previousStatus?: string) => {
      const t = thresholds.water_level;
      if (!t) return "normal";

      const minWarning = Number(t.min_warning);
      const minNormal = Number(t.min_normal);
      const maxWarning = Number(t.max_warning);
      const maxNormal = Number(t.max_normal);
      const recoveryMin = minNormal + 2;

      if (val < minWarning || val > maxWarning) return "danger";

      if (previousStatus === "warning" || previousStatus === "danger") {
        if (val < recoveryMin || val > maxNormal) return "warning";
        return "normal";
      }

      if (val < minNormal || val > maxNormal) return "warning";
      return "normal";
    };

    const ph_status          = getStatus("ph", raw.ph);
    const tds_status         = getStatus("tds", raw.tds);
    const turbidity_status   = getStatus("turbidity", raw.turbidity);
    const water_level_status = getWaterLevelStatus(
      raw.water_level,
      lastReading?.water_level_status
    );

    const statuses = [ph_status, tds_status, turbidity_status, water_level_status];
    const overall_status = statuses.includes("danger")  ? "danger"
                         : statuses.includes("warning") ? "warning"
                         : "normal";

    const reading = {
      ...raw,
      ph_status, tds_status, turbidity_status, water_level_status,
      overall_status,
      timestamp: new Date().toISOString(),
    };

    const { error: insertError } = await supabase
      .from("sensor_readings")
      .insert(reading);
    if (insertError) throw insertError;

    // ── Event Detection ──────────────────────────────────────────
    if (lastReading) {
      type MetricKey = "ph" | "tds" | "turbidity" | "water_level";

      const metrics: Record<MetricKey, { name: string; unit: string }> = {
        ph:          { name: "pH air",        unit: ""     },
        tds:         { name: "Nutrisi (TDS)", unit: " ppm" },
        turbidity:   { name: "Kejernihan air", unit: " NTU" },
        water_level: { name: "Volume air",    unit: "%"    },
      };

      // Konteks pesan per sensor per level — tone santai & conversational
      const warningContext: Record<MetricKey, (val: number, prev: number) => string> = {
        ph: (val, prevVal) => {
          return val > prevVal
            ? `pH lagi naik nih ke ${val}, kalau makin tinggi tanaman bakal susah serap nutrisi.`
            : `pH lagi turun nih ke ${val}, tanaman mulai susah serap nutrisi kalau dibiarkan.`;
        },
        tds: (val, prevVal) => {
          return val > prevVal
            ? `Nutrisi lagi tinggi nih (${val} ppm), kalau kebanyakan bisa bakar akar tanaman.`
            : `Nutrisi lagi rendah nih (${val} ppm), tanaman butuh asupan lebih.`;
        },
        turbidity: (val, _prev) => {
          return `Air mulai keruh (${val} NTU), kayaknya filter perlu dicek.`;
        },
        water_level: (val, _prevVal) => {
          return `Volume air tinggal ${val}%, mending tambah air sekarang sebelum sirkulasi terganggu.`;
        },
      };

      const dangerContext: Record<MetricKey, (val: number) => string> = {
        ph: (val) => {
          return val > 7.5
            ? `pH udah di ${val}, ini bahaya buat ikan dan tanaman. Segera cek dan koreksi.`
            : `pH udah di ${val}, ini bahaya buat ikan dan tanaman. Segera cek dan koreksi.`;
        },
        tds: (val) => {
          return val > 700
            ? `Nutrisi udah kebanyakan (${val} ppm), perlu ganti sebagian air sekarang.`
            : `Nutrisi drop parah ke ${val} ppm, perlu ganti sebagian air sekarang.`;
        },
        turbidity: (val) => {
          return `Air keruh banget (${val} NTU), coba kurangi pakan ikan dan bersihin filter sekarang.`;
        },
        water_level: (val) => {
          return `Volume air udah kritis (${val}%), segera tambah air.`;
        },
      };

      const recoveryMsg: Record<MetricKey, (val: number) => string> = {
        ph:          (val) => `pH udah balik ke ${val}, semua oke.`,
        tds:         (val) => `Nutrisi udah balik normal (${val} ppm), aman.`,
        turbidity:   (val) => `Air udah jernih lagi (${val} NTU), nice.`,
        water_level: (val) => `Volume air udah balik normal (${val}%), aman.`,
      };

      for (const [m, info] of Object.entries(metrics) as [MetricKey, typeof metrics[MetricKey]][]) {
        const oldStatus = lastReading[`${m}_status`];
        const newStatus = (reading as Record<string, unknown>)[`${m}_status`] as string;
        if (oldStatus === newStatus) continue;

        const type = newStatus === "normal" ? "recovery" : newStatus;
        const currentVal = (raw as Record<string, number>)[m];
        const prevVal    = (lastReading as Record<string, number>)[m];

        let msg = "";
        if (newStatus === "normal") {
          msg = recoveryMsg[m](currentVal);
        } else if (newStatus === "warning") {
          msg = warningContext[m](currentVal, prevVal);
        } else {
          msg = dangerContext[m](currentVal);
        }

        await supabase.from("sensor_events").insert({
          type, metric: m, value: currentVal, message: msg,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, reading }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
