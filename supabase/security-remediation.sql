-- Security and retention remediation for Smart Aquaponic.
-- Run this in the Supabase SQL editor with an owner/service role connection.

-- SEC-02: Enable RLS on public data tables.
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lifecycle_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_thresholds ENABLE ROW LEVEL SECURITY;

-- Replace read policies idempotently.
DROP POLICY IF EXISTS "Allow public read sensor readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Allow public read sensor events" ON public.sensor_events;
DROP POLICY IF EXISTS "Allow public read lifecycle config" ON public.lifecycle_config;
DROP POLICY IF EXISTS "Allow public read system thresholds" ON public.system_thresholds;

CREATE POLICY "Allow public read sensor readings"
ON public.sensor_readings
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read sensor events"
ON public.sensor_events
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read lifecycle config"
ON public.lifecycle_config
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow public read system thresholds"
ON public.system_thresholds
FOR SELECT
TO anon, authenticated
USING (true);

-- SEC-04: Allow config writes only for authenticated users.
-- The service_role bypasses RLS and can still write from Edge Functions.
DROP POLICY IF EXISTS "Allow authenticated lifecycle config writes" ON public.lifecycle_config;
DROP POLICY IF EXISTS "Allow authenticated system threshold writes" ON public.system_thresholds;

CREATE POLICY "Allow authenticated lifecycle config writes"
ON public.lifecycle_config
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated system threshold writes"
ON public.system_thresholds
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- SEC-06: Lock down the SECURITY DEFINER helper flagged by Supabase advisor.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated;

-- PERF-01/02: Retain 30 days of sensor data and events.
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

SELECT cron.schedule(
  'cleanup-old-sensor-readings',
  '0 0 * * *',
  $$DELETE FROM public.sensor_readings WHERE timestamp < NOW() - INTERVAL '30 days'$$
);

SELECT cron.schedule(
  'cleanup-old-sensor-events',
  '5 0 * * *',
  $$DELETE FROM public.sensor_events WHERE timestamp < NOW() - INTERVAL '30 days'$$
);

-- SEC-03 must be completed in Supabase function config:
-- set generate-reading verify_jwt = true, then invoke it from cron with
-- an Authorization header using a service role token or a private secret check.
