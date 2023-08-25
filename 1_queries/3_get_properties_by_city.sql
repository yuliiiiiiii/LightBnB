SELECT properties.id, title, cost_per_night, avg(rating) AS avergae_rating
FROM properties
LEFT JOIN property_reviews ON property_id = properties.id
-- LEFT JOIN to show the properties even thought they don't have rating
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING avg(rating) >= 4
ORDER BY cost_per_night 
LIMIT 10;
