-- Supabase pg_cron scheduled job for DailyNest delivery generation
-- Runs generate_next_day_deliveries() every day at 4 PM IST (10:30 AM UTC)

-- Schedule the cron job
SELECT cron.schedule(
  'generate-next-day-deliveries',  -- Job name
  '30 10 * * *',                   -- Cron expression: 10:30 AM UTC daily
  'SELECT generate_next_day_deliveries();'  -- SQL command to execute
);

-- To unschedule the job (if needed):
-- SELECT cron.unschedule('generate-next-day-deliveries');

-- To view scheduled jobs:
-- SELECT * FROM cron.job;

-- To view job run history:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- Note: 4 PM IST = 10:30 AM UTC (IST is UTC+5:30)
-- The function includes RAISE NOTICE logging for monitoring