-- 为 inventory_products 表添加策略
ALTER TABLE inventory_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有用户查询货品" 
ON inventory_products FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "允许登录用户管理货品" 
ON inventory_products FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 为 inventory_transactions 表添加策略
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有用户查询流水" 
ON inventory_transactions FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "允许登录用户管理流水" 
ON inventory_transactions FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 为 inventory_stocks 表添加策略
ALTER TABLE inventory_stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "允许所有用户查询库存" 
ON inventory_stocks FOR SELECT 
TO authenticated, anon 
USING (true);

CREATE POLICY "允许登录用户管理库存" 
ON inventory_stocks FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
