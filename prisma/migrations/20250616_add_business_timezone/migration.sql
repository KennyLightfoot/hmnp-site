-- Add business_timezone setting if it doesn't exist
INSERT INTO "BusinessSettings" ("id", "key", "value", "category", "description", "updatedAt")
SELECT 
  gen_random_uuid(),  -- Generate UUID for id
  'business_timezone', -- Key
  'America/Chicago',   -- Default timezone
  'booking',           -- Category
  'The timezone where the business operates',  -- Description
  NOW()                -- Updated timestamp
WHERE NOT EXISTS (
  SELECT 1 FROM "BusinessSettings" WHERE "key" = 'business_timezone'
);
