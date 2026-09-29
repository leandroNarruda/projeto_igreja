-- Normalize Bible progress after removing the temporary final level.
UPDATE "BibliaProgresso"
SET "nivel" = 10
WHERE "nivel" > 10;
