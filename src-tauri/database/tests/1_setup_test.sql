
-- Drop existing tables if they exist (for a clean start)
DROP TABLE IF EXISTS ticket_items;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS products;

-- 1. Products table
CREATE TABLE IF NOT EXISTS products (
    sku               TEXT PRIMARY KEY,
    -- vendor_sku TEXT, -- Optional: Internal SKU may differ from vendor SKU
    product_name      TEXT NOT NULL,
    price             DECIMAL(10,2) NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME
);

-- 2. Sales table
CREATE TABLE IF NOT EXISTS sales (
    id             TEXT PRIMARY KEY,  -- Could be sha256 hash of (  total_amount + payment_method + device_date_epoch() + device_sec_random()  )
    total_amount   DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,  -- e.g., 'CASH', 'CREDIT', 'DEBIT'
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- cashier_name TEXT NOT NULL, -- Optional: To identify the cashier who made the sale
    -- pos_id TEXT NOT NULL,       -- Optional: To identify which POS terminal made the sale
);

-- 3. Ticket Items table
CREATE TABLE IF NOT EXISTS sale_items (
    id             TEXT PRIMARY KEY,  -- sha256 hash of (  sale_id + product_id + quantity + price_each  )
    sales_id       TEXT NOT NULL, -- Foreign key to sales table
    product_sku    TEXT NOT NULL,
    quantity       INTEGER NOT NULL CHECK (quantity > 0),
    product_price  DECIMAL(10,2) NOT NULL,  
    line_total     DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (sales_id) REFERENCES sales(id),
    FOREIGN KEY (product_sku) REFERENCES products(sku)
);

-- Optional: Create indexes for better performance on common lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- Insert three sample products
INSERT INTO products (sku, product_name, price)
VALUES
    ('SKU001', 'Test One', 10.00),
    ('SKU002', 'Test Two', 20.00),
    ('SKU003', 'Test Three', 30.00);

-- Verify seeded data
SELECT 'Seeded Products:' AS msg;
SELECT * FROM products;