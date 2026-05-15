// Data layer backed by Lovable Cloud (PostgreSQL via Supabase)
import { supabase } from '@/integrations/supabase/client';

export interface Cloth { cloth_id: string; cloth_name: string; cloth_type: string; }
export interface Factory { factory_id: string; factory_name: string; location: string; }
export interface Customer { customer_id: string; customer_name: string; contact: string; }
export interface Purchase {
  purchase_id: string; cloth_id: string; factory_id: string;
  quantity_meter: number; cost_per_meter: number; purchase_date: string; total_cost: number;
}
export interface Sale {
  sale_id: string; cloth_id: string; customer_id: string;
  quantity_meter: number; sale_price: number; sale_date: string; total_revenue: number;
}

export const store = {
  // Cloths
  async getCloths(): Promise<Cloth[]> {
    const { data, error } = await supabase.from('cloths').select('*').order('cloth_name');
    if (error) throw error;
    return data as Cloth[];
  },
  async addCloth(c: Omit<Cloth, 'cloth_id'>) {
    const { error } = await supabase.from('cloths').insert(c);
    if (error) throw error;
  },
  async updateCloth(id: string, data: Partial<Cloth>) {
    const { error } = await supabase.from('cloths').update(data).eq('cloth_id', id);
    if (error) throw error;
  },
  async deleteCloth(id: string) {
    const { error } = await supabase.from('cloths').delete().eq('cloth_id', id);
    if (error) throw error;
  },

  // Factories
  async getFactories(): Promise<Factory[]> {
    const { data, error } = await supabase.from('factories').select('*').order('factory_name');
    if (error) throw error;
    return data as Factory[];
  },
  async addFactory(f: Omit<Factory, 'factory_id'>) {
    const { error } = await supabase.from('factories').insert(f);
    if (error) throw error;
  },
  async updateFactory(id: string, data: Partial<Factory>) {
    const { error } = await supabase.from('factories').update(data).eq('factory_id', id);
    if (error) throw error;
  },
  async deleteFactory(id: string) {
    const { error } = await supabase.from('factories').delete().eq('factory_id', id);
    if (error) throw error;
  },

  // Customers
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('customer_name');
    if (error) throw error;
    return data as Customer[];
  },
  async addCustomer(c: Omit<Customer, 'customer_id'>) {
    const { error } = await supabase.from('customers').insert(c);
    if (error) throw error;
  },
  async updateCustomer(id: string, data: Partial<Customer>) {
    const { error } = await supabase.from('customers').update(data).eq('customer_id', id);
    if (error) throw error;
  },
  async deleteCustomer(id: string) {
    const { error } = await supabase.from('customers').delete().eq('customer_id', id);
    if (error) throw error;
  },

  // Purchases
  async getPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase.from('purchases').select('*').order('purchase_date', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(p => ({ ...p, quantity_meter: Number(p.quantity_meter), cost_per_meter: Number(p.cost_per_meter), total_cost: Number(p.total_cost) }));
  },
  async addPurchase(p: Omit<Purchase, 'purchase_id' | 'total_cost'>) {
    const { error } = await supabase.from('purchases').insert(p);
    if (error) throw error;
  },

  // Sales
  async getSales(): Promise<Sale[]> {
    const { data, error } = await supabase.from('sales').select('*').order('sale_date', { ascending: false });
    if (error) throw error;
    return (data as any[]).map(s => ({ ...s, quantity_meter: Number(s.quantity_meter), sale_price: Number(s.sale_price), total_revenue: Number(s.total_revenue) }));
  },
  async addSale(s: Omit<Sale, 'sale_id' | 'total_revenue'>) {
    const { error } = await supabase.from('sales').insert(s);
    if (error) throw error;
  },

  // Inventory (computed)
  async getInventory() {
    const [cloths, purchases, sales] = await Promise.all([
      store.getCloths(), store.getPurchases(), store.getSales(),
    ]);
    return cloths.map(c => {
      const total_purchased = purchases.filter(p => p.cloth_id === c.cloth_id).reduce((s, p) => s + p.quantity_meter, 0);
      const total_sold = sales.filter(s => s.cloth_id === c.cloth_id).reduce((s, sa) => s + sa.quantity_meter, 0);
      return { ...c, total_purchased, total_sold, current_stock: total_purchased - total_sold };
    });
  },

  async getStock(cloth_id: string): Promise<number> {
    const [{ data: ps }, { data: ss }] = await Promise.all([
      supabase.from('purchases').select('quantity_meter').eq('cloth_id', cloth_id),
      supabase.from('sales').select('quantity_meter').eq('cloth_id', cloth_id),
    ]);
    const tp = (ps || []).reduce((s, r: any) => s + Number(r.quantity_meter), 0);
    const ts = (ss || []).reduce((s, r: any) => s + Number(r.quantity_meter), 0);
    return tp - ts;
  },

  async getRevenue() {
    const [purchases, sales] = await Promise.all([store.getPurchases(), store.getSales()]);
    const totalPurchaseCost = purchases.reduce((s, p) => s + p.total_cost, 0);
    const totalSalesRevenue = sales.reduce((s, sa) => s + sa.total_revenue, 0);
    const rawProfit = totalSalesRevenue - totalPurchaseCost;
    // Business rule: never display negative profit. Show 0 with loss flag instead.
    const profit = Math.max(0, rawProfit);
    const loss = rawProfit < 0 ? Math.abs(rawProfit) : 0;
    return { totalPurchaseCost, totalSalesRevenue, profit, loss, isLoss: rawProfit < 0 };
  },

};
