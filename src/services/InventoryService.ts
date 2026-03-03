import { supabase } from '../supabase/client';

export interface Product {
  id?: string;
  code: string;
  name: string;
  category: string;
  spec?: string;
  unit: string;
  min_stock?: number;
  max_stock?: number;
  description?: string;
}

export interface InboundRecord {
  id?: string;
  transaction_no: string;
  type: 'inbound';
  subtype: 'purchase' | 'production' | 'other';
  product_id: string;
  quantity: number;
  related_party?: string;
  operator?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  remarks?: string;
  product?: Product;
}

export interface OutboundRecord {
  id?: string;
  transaction_no: string;
  type: 'outbound';
  subtype: 'sales' | 'picking' | 'other';
  product_id: string;
  quantity: number;
  related_party?: string;
  operator?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  remarks?: string;
  product?: Product;
}

export interface OperationRecord {
  id?: string;
  transaction_no: string;
  type: 'adjust' | 'transfer' | 'count';
  subtype: 'loss' | 'overflow' | 'damage' | 'expired' | 'other';
  product_id: string;
  quantity: number; // For adjust: positive means add, negative means reduce
  related_party?: string; // For transfer: target location
  operator?: string;
  transaction_date: string;
  status: 'pending' | 'completed' | 'cancelled';
  remarks?: string;
  product?: Product;
}

export const inventoryService = {
  // --- Products ---
  async getProducts() {
    const { data, error } = await supabase
      .from('inventory_products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getProduct(id: string) {
    const { data, error } = await supabase
      .from('inventory_products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Product) {
    const { data, error } = await supabase
      .from('inventory_products')
      .insert([product])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('inventory_products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string) {
    const { error } = await supabase
      .from('inventory_products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // --- Inbound ---
  async getInboundRecords(subtype?: string) {
    let query = supabase
      .from('inventory_transactions')
      .select(`
        *,
        product:inventory_products(name, code, unit)
      `)
      .eq('type', 'inbound')
      .order('created_at', { ascending: false });

    if (subtype) {
      query = query.eq('subtype', subtype);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createInboundRecord(record: InboundRecord) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert([record])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Outbound ---
  async getOutboundRecords(subtype?: string) {
    let query = supabase
      .from('inventory_transactions')
      .select(`
        *,
        product:inventory_products(name, code, unit)
      `)
      .eq('type', 'outbound')
      .order('created_at', { ascending: false });

    if (subtype) {
      query = query.eq('subtype', subtype);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createOutboundRecord(record: OutboundRecord) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert([record])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Operations (Transfer, Count, Adjust) ---
  async getOperationRecords(type?: string) {
    let query = supabase
      .from('inventory_transactions')
      .select(`
        *,
        product:inventory_products(name, code, unit)
      `)
      .in('type', ['adjust', 'transfer', 'count'])
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async createOperationRecord(record: OperationRecord) {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .insert([record])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // --- Reports ---
  async getStockLevels() {
    const { data, error } = await supabase
      .from('inventory_stocks')
      .select(`
        *,
        product:inventory_products(name, code, spec, unit, category)
      `)
      .order('quantity', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getAllTransactions() {
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        product:inventory_products(name, code, unit)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
};
