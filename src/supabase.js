import { createClient } from '@supabase/supabase-js';
import { CATALOG as INITIAL_CATALOG, INITIAL_ORDERS } from './data.js';

const STORAGE_KEY_CONFIG = 'babayo_supabase_config';
const STORAGE_KEY_ORDERS = 'babayo_local_orders';
const STORAGE_KEY_CATALOG = 'babayo_local_catalog';

// Get config from LocalStorage or Environment Variables
export function getSupabaseConfig() {
  const stored = localStorage.getItem(STORAGE_KEY_CONFIG);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse Supabase config', e);
    }
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    key: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}

let supabaseInstance = null;

export function initSupabaseClient() {
  const config = getSupabaseConfig();
  if (config.url && config.key && config.url.startsWith('https://')) {
    try {
      supabaseInstance = createClient(config.url, config.key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Supabase initialization warning:', err);
      supabaseInstance = null;
    }
  }
  supabaseInstance = null;
  return null;
}

export function isSupabaseConnected() {
  const client = initSupabaseClient();
  return client !== null;
}

export function saveSupabaseConfig(url, key) {
  const config = { url: url.trim(), key: key.trim() };
  localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  initSupabaseClient();
}

export function clearSupabaseConfig() {
  localStorage.removeItem(STORAGE_KEY_CONFIG);
  supabaseInstance = null;
}

// Local Storage Fallback Data Manager for Orders
function getLocalOrders() {
  const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(INITIAL_ORDERS));
    return INITIAL_ORDERS;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_ORDERS;
  }
}

function saveLocalOrders(orders) {
  localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
}

// Local Storage Fallback Data Manager for Catalog
function getLocalCatalog() {
  const raw = localStorage.getItem(STORAGE_KEY_CATALOG);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(INITIAL_CATALOG));
    return INITIAL_CATALOG;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_CATALOG;
  }
}

function saveLocalCatalog(catalogItems) {
  localStorage.setItem(STORAGE_KEY_CATALOG, JSON.stringify(catalogItems));
}

// --- CATALOG DATA OPERATIONS ---
export async function fetchCatalogData() {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('catalog')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        if (data.length === 0) {
          console.log('Seeding initial catalog to Supabase...');
          const formattedSeed = INITIAL_CATALOG.map(item => ({
            id: item.id,
            category: item.category,
            name: item.name,
            image: item.image,
            description: item.description || '',
            price_weapon_only: item.prices?.weapon_only || 0,
            price_bundle: item.prices?.bundle || 0,
            price_unit: item.prices?.unit || 0,
            unit_details: item.unitDetails || '',
            bundle_details: item.bundleDetails || ''
          }));

          const { data: seeded, error: seedErr } = await client
            .from('catalog')
            .insert(formattedSeed)
            .select();

          if (!seedErr && seeded) return formatCatalogFromDb(seeded);
        }
        return formatCatalogFromDb(data);
      }
    } catch (err) {
      console.warn('Supabase catalog fetch failed, falling back to localStorage:', err);
    }
  }

  return getLocalCatalog();
}

function formatCatalogFromDb(dbItems) {
  return dbItems.map(item => ({
    id: item.id,
    category: item.category,
    name: item.name,
    image: item.image,
    description: item.description,
    quantity: item.quantity !== undefined ? Number(item.quantity) : 0,
    prices: {
      weapon_only: item.price_weapon_only ? Number(item.price_weapon_only) : null,
      bundle: item.price_bundle ? Number(item.price_bundle) : null,
      unit: item.price_unit ? Number(item.price_unit) : null
    },
    bundleDetails: item.bundle_details,
    unitDetails: item.unit_details
  }));
}

export async function saveCatalogItem(itemPayload) {
  const client = initSupabaseClient();
  const dbRecord = {
    id: itemPayload.id || 'item-' + Date.now(),
    category: itemPayload.category,
    name: itemPayload.name,
    image: itemPayload.image,
    description: itemPayload.description || '',
    price_weapon_only: itemPayload.prices?.weapon_only || 0,
    price_bundle: itemPayload.prices?.bundle || 0,
    price_unit: itemPayload.prices?.unit || 0,
    unit_details: itemPayload.unitDetails || '',
    bundle_details: itemPayload.bundleDetails || '',
    quantity: itemPayload.quantity !== undefined ? itemPayload.quantity : 0
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('catalog')
        .upsert([dbRecord])
        .select();

      if (!error) {
        return { success: true, mode: 'supabase' };
      } else {
        console.error('Supabase catalog upsert error:', error);
      }
    } catch (err) {
      console.error('Supabase catalog upsert exception:', err);
    }
  }

  // Fallback to LocalStorage
  const catalog = getLocalCatalog();
  const existingIdx = catalog.findIndex(c => c.id === itemPayload.id);
  if (existingIdx >= 0) {
    catalog[existingIdx] = itemPayload;
  } else {
    catalog.push(itemPayload);
  }
  saveLocalCatalog(catalog);
  return { success: true, mode: 'local' };
}

export async function deleteCatalogItem(id) {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('catalog')
        .delete()
        .eq('id', id);

      if (!error) {
        return { success: true, mode: 'supabase' };
      }
    } catch (err) {
      console.error('Supabase catalog delete failed:', err);
    }
  }

  // Fallback
  const catalog = getLocalCatalog();
  const filtered = catalog.filter(c => c.id !== id);
  saveLocalCatalog(filtered);
  return { success: true, mode: 'local' };
}

// --- ORDER DATA OPERATIONS ---
export async function fetchAllOrders() {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        if (data.length === 0) {
          console.log('Seeding initial orders to Supabase...');
          const seedData = INITIAL_ORDERS.map(({ id, ...rest }) => rest);
          const { data: seeded, error: seedErr } = await client
            .from('orders')
            .insert(seedData)
            .select();
          if (!seedErr && seeded) return seeded;
        }
        return data;
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to localStorage:', err);
    }
  }

  return getLocalOrders();
}

export async function createOrder(orderPayload) {
  const client = initSupabaseClient();
  const newOrder = {
    ...orderPayload,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .insert([newOrder])
        .select();

      if (!error && data && data.length > 0) {
        return { success: true, data: data[0], mode: 'supabase' };
      } else if (error) {
        console.error('Supabase insert error:', error);
      }
    } catch (err) {
      console.error('Supabase order creation exception:', err);
    }
  }

  // Fallback to LocalStorage
  const orders = getLocalOrders();
  const orderWithId = {
    ...newOrder,
    id: 'order-' + Date.now()
  };
  orders.unshift(orderWithId);
  saveLocalOrders(orders);
  return { success: true, data: orderWithId, mode: 'local' };
}

export async function updateOrderStatus(id, newStatus) {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (!error) {
        return { success: true, mode: 'supabase' };
      }
    } catch (err) {
      console.error('Supabase update status failed:', err);
    }
  }

  const orders = getLocalOrders();
  const updated = orders.map(item => item.id === id ? { ...item, status: newStatus } : item);
  saveLocalOrders(updated);
  return { success: true, mode: 'local' };
}

export async function deleteOrder(id) {
  const client = initSupabaseClient();
  if (client) {
    try {
      const { error } = await client
        .from('orders')
        .delete()
        .eq('id', id);

      if (!error) {
        return { success: true, mode: 'supabase' };
      }
    } catch (err) {
      console.error('Supabase delete failed:', err);
    }
  }

  const orders = getLocalOrders();
  const filtered = orders.filter(item => item.id !== id);
  saveLocalOrders(filtered);
  return { success: true, mode: 'local' };
}

// Realtime Listener for Supabase
export function subscribeToOrders(onUpdate) {
  const client = initSupabaseClient();
  if (!client) return null;

  try {
    const channel = client
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'catalog' },
        (payload) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    return channel;
  } catch (e) {
    console.warn('Realtime subscription error:', e);
    return null;
  }
}
