-- Supabase PostgreSQL function for DailyNest delivery generation
-- This function runs daily to generate delivery records for the next day

CREATE OR REPLACE FUNCTION generate_next_day_deliveries()
RETURNS void AS $$
DECLARE
  tomorrow DATE := CURRENT_DATE + INTERVAL '1 day';
  tomorrow_weekday TEXT;
BEGIN
  -- Get tomorrow's weekday (lowercase to match array values)
  tomorrow_weekday := LOWER(TRIM(TO_CHAR(tomorrow, 'Day')));

  -- Insert delivery records for active subscriptions
  -- Only for subscriptions that are active, not paused, and selected for tomorrow's weekday
  -- Prevent duplicates by checking if delivery already exists
  INSERT INTO deliveries (
    user_id,
    subscription_id,
    delivery_date,
    quantity,
    status
  )
  SELECT
    s.user_id,
    s.id,
    tomorrow,
    s.quantity,
    'scheduled'
  FROM subscriptions s
  WHERE s.status = 'active'
    AND s.paused = false
    AND tomorrow_weekday = ANY(s.days_selected)
    AND NOT EXISTS (
      SELECT 1 FROM deliveries d
      WHERE d.subscription_id = s.id
        AND d.delivery_date = tomorrow
    );

  -- Log the operation (optional)
  RAISE NOTICE 'Generated deliveries for %: % rows inserted', tomorrow, (SELECT COUNT(*) FROM deliveries WHERE delivery_date = tomorrow);
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a cron job trigger (requires pg_cron extension)
-- SELECT cron.schedule('generate-next-day-deliveries', '0 2 * * *', 'SELECT generate_next_day_deliveries();');

-- To run manually:
-- SELECT generate_next_day_deliveries();