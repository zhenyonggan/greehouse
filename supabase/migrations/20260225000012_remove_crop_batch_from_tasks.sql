
-- Remove crop_batch_id from farming_tasks table
ALTER TABLE farming_tasks DROP COLUMN IF EXISTS crop_batch_id;
