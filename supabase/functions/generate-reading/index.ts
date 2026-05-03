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

    const isRefilling    = prev.water_level < 70;
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

    const ph_status          = getStatus("ph", raw.ph);
    const tds_status         = getStatus("tds", raw.tds);
    const turbidity_status   = getStatus("turbidity", raw.turbidity);
    const water_level_status = getStatus("water_level", raw.water_level);

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

      // Konteks pesan per sensor per level
      const warningContext: Record<MetricKey, (val: number, prev: number) => string> = {
        ph: (val, prevVal) => {
          const dir = val > prevVal ? "naik" : "turun";
          const level = val > prevVal ? "tinggi" : "rendah";
          return `pH air ${dir} ke ${val} — pH ${level} dapat menghambat penyerapan nutrisi tanaman.`;
        },
        tds: (val, prevVal) => {
          const dir = val > prevVal ? "naik" : "turun";
          const level = val > prevVal ? "tinggi" : "rendah";
          return `Nutrisi (TDS) ${dir} ke ${val} ppm — Konsentrasi nutrisi terlalu ${level}, pertumbuhan tanaman bisa terganggu.`;
        },
        turbidity: (val, _prev) => {
          return `Kejernihan air turun ke ${val} NTU — Air mulai keruh, filter kemungkinan perlu dibersihkan.`;
        },
        water_level: (val, prevVal) => {
          const dir = val > prevVal ? "naik" : "turun";
          return `Volume air ${dir} ke ${val}% — Sirkulasi sistem bisa terganggu, segera tambahkan air.`;
        },
      };

      const dangerContext: Record<MetricKey, (val: number) => string> = {
        ph: (val) => {
          const cond = val > 7.5 ? "basa ekstrem" : "asam ekstrem";
          return `pH air kritis: ${val} — Kondisi ${cond} dapat merusak ekosistem dan membunuh ikan.`;
        },
        tds: (val) => {
          const cond = val > 700 ? "terlalu pekat" : "terlalu encer";
          return `Nutrisi (TDS) kritis: ${val} ppm — Larutan ${cond}, akar tanaman berisiko rusak permanen.`;
        },
        turbidity: (val) => {
          return `Kejernihan air kritis: ${val} NTU — Air sangat keruh, filter tersumbat dan ekosistem terancam.`;
        },
        water_level: (val) => {
          return `Volume air kritis: ${val}% — Level sangat rendah, pompa celup berisiko rusak akibat berjalan kering.`;
        },
      };

      const recoveryMsg: Record<MetricKey, (val: number) => string> = {
        ph:          (val) => `pH air kembali ke normal: ${val}.`,
        tds:         (val) => `Nutrisi (TDS) kembali ke normal: ${val} ppm.`,
        turbidity:   (val) => `Kejernihan air kembali ke normal: ${val} NTU.`,
        water_level: (val) => `Volume air kembali ke normal: ${val}%.`,
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
