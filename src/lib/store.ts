// Local data store simulating a relational database
// All data is stored in localStorage for persistence

export interface User {
  user_id: string;
  username: string;
  password: string;
  role: string;
}

export interface Cloth {
  cloth_id: string;
  cloth_name: string;
  cloth_type: string;
}

export interface Factory {
  factory_id: string;
  factory_name: string;
  location: string;
}

export interface Customer {
  customer_id: string;
  customer_name: string;
  contact: string;
}

export interface Purchase {
  purchase_id: string;
  cloth_id: string;
  factory_id: string;
  quantity_meter: number;
  cost_per_meter: number;
  purchase_date: string;
  total_cost: number;
}

export interface Sale {
  sale_id: string;
  cloth_id: string;
  customer_id: string;
  quantity_meter: number;
  sale_price: number;
  sale_date: string;
  total_revenue: number;
}

function getItem<T>(key: string, fallback: T[]): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

const uid = () => crypto.randomUUID();

// Seed data
function seedIfEmpty() {
  if (!localStorage.getItem('_seeded')) {
    const users: User[] = [
      { user_id: uid(), username: 'admin', password: 'admin123', role: 'admin' },
    ];
    const cloths: Cloth[] = [
      { cloth_id: uid(), cloth_name: 'Cotton', cloth_type: 'Natural' },
      { cloth_id: uid(), cloth_name: 'Silk', cloth_type: 'Natural' },
      { cloth_id: uid(), cloth_name: 'Polyester', cloth_type: 'Synthetic' },
      { cloth_id: uid(), cloth_name: 'Linen', cloth_type: 'Natural' },
      { cloth_id: uid(), cloth_name: 'Chiffon', cloth_type: 'Synthetic' },
    ];
    const factories: Factory[] = [
      { factory_id: uid(), factory_name: 'Faisalabad Textiles', location: 'Faisalabad' },
      { factory_id: uid(), factory_name: 'Karachi Mills', location: 'Karachi' },
      { factory_id: uid(), factory_name: 'Lahore Weavers', location: 'Lahore' },
    ];
    const customers: Customer[] = [
      { customer_id: uid(), customer_name: 'Ahmed Traders', contact: '0300-1234567' },
      { customer_id: uid(), customer_name: 'Bilal Cloth House', contact: '0321-9876543' },
      { customer_id: uid(), customer_name: 'Kareem Fabrics', contact: '0333-5551234' },
    ];

    setItem('users', users);
    setItem('cloths', cloths);
    setItem('factories', factories);
    setItem('customers', customers);
    setItem('purchases', []);
    setItem('sales', []);
    localStorage.setItem('_seeded', 'true');
  }
}

seedIfEmpty();

// CRUD operations
export const store = {
  // Users
  getUsers: () => getItem<User>('users', []),
  authenticate: (username: string, password: string): User | null => {
    const users = getItem<User>('users', []);
    return users.find(u => u.username === username && u.password === password) || null;
  },

  // Cloths
  getCloths: () => getItem<Cloth>('cloths', []),
  addCloth: (cloth: Omit<Cloth, 'cloth_id'>) => {
    const cloths = getItem<Cloth>('cloths', []);
    const newCloth = { ...cloth, cloth_id: uid() };
    cloths.push(newCloth);
    setItem('cloths', cloths);
    return newCloth;
  },
  updateCloth: (id: string, data: Partial<Cloth>) => {
    const cloths = getItem<Cloth>('cloths', []);
    const idx = cloths.findIndex(c => c.cloth_id === id);
    if (idx >= 0) { cloths[idx] = { ...cloths[idx], ...data }; setItem('cloths', cloths); }
  },
  deleteCloth: (id: string) => {
    const cloths = getItem<Cloth>('cloths', []).filter(c => c.cloth_id !== id);
    setItem('cloths', cloths);
  },

  // Factories
  getFactories: () => getItem<Factory>('factories', []),
  addFactory: (f: Omit<Factory, 'factory_id'>) => {
    const factories = getItem<Factory>('factories', []);
    const newF = { ...f, factory_id: uid() };
    factories.push(newF);
    setItem('factories', factories);
    return newF;
  },
  updateFactory: (id: string, data: Partial<Factory>) => {
    const factories = getItem<Factory>('factories', []);
    const idx = factories.findIndex(f => f.factory_id === id);
    if (idx >= 0) { factories[idx] = { ...factories[idx], ...data }; setItem('factories', factories); }
  },
  deleteFactory: (id: string) => {
    setItem('factories', getItem<Factory>('factories', []).filter(f => f.factory_id !== id));
  },

  // Customers
  getCustomers: () => getItem<Customer>('customers', []),
  addCustomer: (c: Omit<Customer, 'customer_id'>) => {
    const customers = getItem<Customer>('customers', []);
    const newC = { ...c, customer_id: uid() };
    customers.push(newC);
    setItem('customers', customers);
    return newC;
  },
  updateCustomer: (id: string, data: Partial<Customer>) => {
    const customers = getItem<Customer>('customers', []);
    const idx = customers.findIndex(c => c.customer_id === id);
    if (idx >= 0) { customers[idx] = { ...customers[idx], ...data }; setItem('customers', customers); }
  },
  deleteCustomer: (id: string) => {
    setItem('customers', getItem<Customer>('customers', []).filter(c => c.customer_id !== id));
  },

  // Purchases
  getPurchases: () => getItem<Purchase>('purchases', []),
  addPurchase: (p: Omit<Purchase, 'purchase_id' | 'total_cost'>) => {
    const purchases = getItem<Purchase>('purchases', []);
    const newP: Purchase = { ...p, purchase_id: uid(), total_cost: p.quantity_meter * p.cost_per_meter };
    purchases.push(newP);
    setItem('purchases', purchases);
    return newP;
  },

  // Sales
  getSales: () => getItem<Sale>('sales', []),
  addSale: (s: Omit<Sale, 'sale_id' | 'total_revenue'>) => {
    const sales = getItem<Sale>('sales', []);
    const newS: Sale = { ...s, sale_id: uid(), total_revenue: s.quantity_meter * s.sale_price };
    sales.push(newS);
    setItem('sales', sales);
    return newS;
  },

  // Inventory (calculated)
  getInventory: () => {
    const cloths = getItem<Cloth>('cloths', []);
    const purchases = getItem<Purchase>('purchases', []);
    const sales = getItem<Sale>('sales', []);
    return cloths.map(c => {
      const totalPurchased = purchases.filter(p => p.cloth_id === c.cloth_id).reduce((sum, p) => sum + p.quantity_meter, 0);
      const totalSold = sales.filter(s => s.cloth_id === c.cloth_id).reduce((sum, s) => sum + s.quantity_meter, 0);
      return {
        cloth_id: c.cloth_id,
        cloth_name: c.cloth_name,
        cloth_type: c.cloth_type,
        total_purchased: totalPurchased,
        total_sold: totalSold,
        current_stock: totalPurchased - totalSold,
      };
    });
  },

  getStock: (cloth_id: string): number => {
    const purchases = getItem<Purchase>('purchases', []);
    const sales = getItem<Sale>('sales', []);
    const tp = purchases.filter(p => p.cloth_id === cloth_id).reduce((s, p) => s + p.quantity_meter, 0);
    const ts = sales.filter(s => s.cloth_id === cloth_id).reduce((s, sa) => s + sa.quantity_meter, 0);
    return tp - ts;
  },

  // Revenue
  getRevenue: () => {
    const purchases = getItem<Purchase>('purchases', []);
    const sales = getItem<Sale>('sales', []);
    const totalPurchaseCost = purchases.reduce((s, p) => s + p.total_cost, 0);
    const totalSalesRevenue = sales.reduce((s, sa) => s + sa.total_revenue, 0);
    return { totalPurchaseCost, totalSalesRevenue, profit: totalSalesRevenue - totalPurchaseCost };
  },
};
