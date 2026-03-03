-- Create inventory_products table
CREATE TABLE IF NOT EXISTS inventory_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    spec TEXT,
    unit TEXT NOT NULL,
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create inventory_transactions table for inbound/outbound records
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_no TEXT NOT NULL UNIQUE, -- e.g., IN20231001001
    type TEXT NOT NULL, -- 'inbound' or 'outbound' or 'adjust' or 'transfer'
    subtype TEXT NOT NULL, -- 'purchase', 'production', 'sales', 'picking', etc.
    product_id UUID REFERENCES inventory_products(id),
    quantity INTEGER NOT NULL,
    related_party TEXT, -- Supplier or Customer name
    operator TEXT, -- Person responsible
    transaction_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled'
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create view or function to calculate current stock (simplified approach)
-- In a real system, you might have a dedicated inventory_stocks table updated by triggers.
-- For simplicity, we can aggregate transactions or use a separate table. Let's use a separate table for performance.
CREATE TABLE IF NOT EXISTS inventory_stocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES inventory_products(id) UNIQUE,
    quantity INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to update stock on transaction
CREATE OR REPLACE FUNCTION update_stock() RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.type = 'inbound') THEN
            INSERT INTO inventory_stocks (product_id, quantity) 
            VALUES (NEW.product_id, NEW.quantity)
            ON CONFLICT (product_id) DO UPDATE SET quantity = inventory_stocks.quantity + NEW.quantity, updated_at = NOW();
        ELSIF (NEW.type = 'outbound') THEN
             INSERT INTO inventory_stocks (product_id, quantity) 
            VALUES (NEW.product_id, -NEW.quantity)
            ON CONFLICT (product_id) DO UPDATE SET quantity = inventory_stocks.quantity - NEW.quantity, updated_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION update_stock();
