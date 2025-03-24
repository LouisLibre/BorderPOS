CREATE TABLE IF NOT EXISTS products (
    sku               TEXT PRIMARY KEY,
    plu_code          TEXT, -- price lookup code
    barcode           TEXT,
    product_name      TEXT NOT NULL,
    price             DECIMAL(10,2) NOT NULL,
    created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at        DATETIME
);

CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,  -- Could be sha256 hash of (  total_amount + payment_method + device_date_epoch() + device_sec_random()  ) to avoid collisions between multiple devices syncing ticket sales later
    subtotal DECIMAL(10,2),
    taxes DECIMAL(10,2),
    total_due   DECIMAL(10,2) NOT NULL,
    dollars_paid DECIMAL(10,2), 
    pesos_paid DECIMAL(10,2),
    cards_paid DECIMAL(10,2),
    others_paid DECIMAL(10,2), 
    total_paid DECIMAL(10,2),
    change DECIMAL(10,2),
    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cashier_name TEXT, -- Optional: To identify the cashier who made the sale
    pos_id TEXT,       -- Optional: To identify which POS terminal made the sale
);

CREATE TABLE IF NOT EXISTS ticket_items (
    id                TEXT PRIMARY KEY,  -- e.g., sha256 hash of (sales_id + product_sku + quantity + product_price)
    ticket_id          TEXT NOT NULL,     -- Foreign key to tickets table
    line_item_sku       TEXT NOT NULL,     -- Historical SKU at sale time
    line_item_plu_code TEXT,              -- Historical vendor SKU at sale time
    line_item_barcode TEXT,
    line_item_product_name      TEXT NOT NULL,     -- Historical name at sale time
    line_item_price     DECIMAL(10,2) NOT NULL,  -- Historical price at sale time
    line_item_quantity  INTEGER NOT NULL CHECK (ticket_product_quantity > 0), 
    line_item_total        DECIMAL(10,2) NOT NULL,
    snapshot_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id)
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_items_ticket_id ON ticket_items(ticket_id);