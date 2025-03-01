-- test_crud.sql

-- ------------------------------------------------
-- 1. Start a transaction to create a new sale
-- ------------------------------------------------
BEGIN TRANSACTION;

INSERT INTO sales (id, total_amount, payment_method)
VALUES ('SALE-1001', 0.00, 'CASH');

-- Insert line item #1
INSERT INTO sale_items (id, sales_id, product_sku, quantity, product_price, line_total)
VALUES (
    'ITEM-1001-1',   -- Could be a sha256 or UUID in a real system
    'SALE-1001',
    'SKU001',        -- Must match an existing product in the 'products' table
    1,
    10.00,
    10.00
);

-- Insert line item #2
INSERT INTO sale_items (id, sales_id, product_sku, quantity, product_price, line_total)
VALUES (
    'ITEM-1001-2',
    'SALE-1001',
    'SKU002',
    2,
    20.00,
    2 * 20.00
);

-- Recalculate the sale total based on the new line items
UPDATE sales
SET total_amount = (
    SELECT SUM(line_total)
    FROM sale_items
    WHERE sale_items.sales_id = sales.id
)
WHERE id = 'SALE-1001';

-- Finalize this transaction
COMMIT;

-- ------------------------------------------------
-- 2. Verify the sale and line items
-- ------------------------------------------------
SELECT 'New Sale Created:' AS note;
SELECT * FROM sales WHERE id = 'SALE-1001';

SELECT 'Line Items for the New Sale:' AS note;
SELECT * FROM sale_items WHERE sales_id = 'SALE-1001';

-- ------------------------------------------------
-- 3. Demonstrate a transaction with ROLLBACK
--    Suppose we try to add another item, but something fails
-- ------------------------------------------------
BEGIN TRANSACTION;

-- Insert line item #3 (maybe you scanned one more product)
INSERT INTO sale_items (id, sales_id, product_sku, quantity, product_price, line_total)
VALUES (
    'ITEM-1001-3',
    'SALE-1001',
    'SKU003',  -- Assume SKU003 exists
    1,
    30.00,
    30.00
);

-- Oops! We realize there's a mistake (maybe the product_sku is invalid,
-- or quantity is wrong, or the customer changes their mind, etc.).
-- We ROLLBACK to undo the insert made in this transaction block.
ROLLBACK;

-- Confirm that line item #3 does NOT exist
SELECT 'After ROLLBACK, checking sale_items again:' AS note;
SELECT * FROM sale_items WHERE sales_id = 'SALE-1001';

-- ------------------------------------------------
-- 4. Demonstrate an alternate approach:
--    We try again, this time with correct data
-- ------------------------------------------------
BEGIN TRANSACTION;

-- Insert line item #3 with correct data
INSERT INTO sale_items (id, sales_id, product_sku, quantity, product_price, line_total)
VALUES (
    'ITEM-1001-3',
    'SALE-1001',
    'SKU003',
    1,
    30.00,
    30.00
);

-- Recalculate the sale total again
UPDATE sales
SET total_amount = (
    SELECT SUM(line_total)
    FROM sale_items
    WHERE sale_items.sales_id = sales.id
)
WHERE id = 'SALE-1001';

COMMIT;

-- Check the new total
SELECT 'Final Sale Record After Adding ITEM-1001-3:' AS note;
SELECT * FROM sales WHERE id = 'SALE-1001';
SELECT 'Final Line Items:' AS note;
SELECT * FROM sale_items WHERE sales_id = 'SALE-1001';
