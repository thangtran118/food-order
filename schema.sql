-- SQL Schema cho Food Order System
-- Chạy code này trong Supabase SQL Editor

-- Tạo bảng orders (đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_link TEXT,
    restaurant_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tạo bảng order_items (món ăn trong đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    food_name TEXT NOT NULL,
    food_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tạo index để query nhanh hơn
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security (RLS) - bảo mật
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Tạo policy cho phép mọi người insert (vì đây là form công khai)
CREATE POLICY "Enable insert for all users" ON orders
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON orders
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for all users" ON order_items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read for all users" ON order_items
    FOR SELECT USING (true);

-- View để xem đơn hàng với chi tiết món ăn
CREATE OR REPLACE VIEW orders_with_items AS
SELECT 
    o.id,
    o.restaurant_link,
    o.restaurant_note,
    o.created_at,
    json_agg(
        json_build_object(
            'food_name', oi.food_name,
            'food_note', oi.food_note
        ) ORDER BY oi.created_at
    ) as items
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.restaurant_link, o.restaurant_note, o.created_at
ORDER BY o.created_at DESC;

