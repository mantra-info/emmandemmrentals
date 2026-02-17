ALTER TABLE "Listing"
ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" DESC) - 1 AS rn
  FROM "Listing"
)
UPDATE "Listing" l
SET "displayOrder" = ordered.rn
FROM ordered
WHERE l.id = ordered.id;
