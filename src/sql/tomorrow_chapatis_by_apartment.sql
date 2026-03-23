-- PostgreSQL query for DailyNest: Total chapatis required tomorrow by apartment

SELECT
  a.name AS apartment_name,
  d.delivery_date,
  SUM(d.quantity) AS total_chapatis_required
FROM deliveries d
JOIN users u ON d.user_id = u.id
JOIN apartments a ON u.apartment_id = a.id
WHERE d.status = 'scheduled'
  AND d.delivery_date = CURRENT_DATE + INTERVAL '1 day'
GROUP BY a.name, d.delivery_date
ORDER BY a.name;

-- Alternative query with more details (optional)
-- SELECT
--   a.name AS apartment_name,
--   a.address,
--   d.delivery_date,
--   COUNT(d.id) AS total_deliveries,
--   SUM(d.quantity) AS total_chapatis_required
-- FROM deliveries d
-- JOIN users u ON d.user_id = u.id
-- JOIN apartments a ON u.apartment_id = a.id
-- WHERE d.status = 'scheduled'
--   AND d.delivery_date = CURRENT_DATE + INTERVAL '1 day'
-- GROUP BY a.name, a.address, d.delivery_date
-- ORDER BY a.name;