-- Run this in Supabase SQL Editor to set up daily NF alert checks
-- Requires the pg_cron extension (available in Supabase Pro plans)

-- Enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule check-nf-alerts to run daily at 8:00 AM UTC
SELECT cron.schedule(
  'check-nf-alerts-daily',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/check-nf-alerts',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.supabase_anon_key')
      ),
      body := '{}'::jsonb
    )
  $$
);

-- To verify the schedule was created:
-- SELECT * FROM cron.job;

-- To remove the schedule:
-- SELECT cron.unschedule('check-nf-alerts-daily');
