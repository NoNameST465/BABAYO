// BABAYO Armory Catalog & Initial Data

export const CATALOG = [
  // --- SENJATA CLASS 3 ---
  {
    id: 'arp_3d',
    category: 'Senjata Class 3',
    name: '3D Printed ARP',
    image: 'assets/arp.jpg',
    description: 'Senjata taktis berbahan 3D Printed polymer tingkat tinggi, sangat presisi dan ringan.',
    max_quantity: 5,
    prices: {
      weapon_only: 1200000,
      bundle: 2800000 // Weapon + Attachment + 1000 Ammo
    },
    bundleDetails: 'Weapon + Attachment + 1000 Ammo'
  },
  {
    id: 'ar15_shield',
    category: 'Senjata Class 3',
    name: 'AR 15 SHIELD',
    image: 'assets/ar15.jpg',
    description: 'Senjata laras panjang assault rifle standar taktis dengan akurasi dan daya tahan maksimal.',
    max_quantity: 5,
    prices: {
      weapon_only: 1500000,
      bundle: 3100000 // Weapon + Attachment + 1000 Ammo
    },
    bundleDetails: 'Weapon + Attachment + 1000 Ammo'
  },
  {
    id: 'specter_carbine',
    category: 'Senjata Class 3',
    name: 'SPECTER CARBINE',
    image: 'assets/specter.jpg',
    description: 'Senjata carbine premium kelas berat dengan peredam suara bawaan dan daya rusak ekstrim.',
    max_quantity: 3,
    prices: {
      weapon_only: 2200000,
      bundle: 4800000 // Weapon + Attachment + 1000 Ammo
    },
    bundleDetails: 'Weapon + Attachment + 1000 Ammo'
  },

  // --- SENJATA CLASS 2 ---
  {
    id: 'combat_pistol',
    category: 'Senjata Class 2',
    name: 'Combat Pistol Class 2',
    image: 'assets/pistol.jpg',
    description: 'Pistol taktis seri Class 2 dengan stabilitas rekoil tinggi dan jarak tembak menengah.',
    max_quantity: 10,
    prices: {
      weapon_only: 600000,
      bundle: 1200000 // Weapon + 500 Ammo
    },
    bundleDetails: 'Weapon + Attachment + 500 Ammo'
  },
  {
    id: 'micro_smg',
    category: 'Senjata Class 2',
    name: 'Micro SMG Class 2',
    image: 'assets/smg.jpg',
    description: 'Submachine gun ringkas Class 2 dengan laju tembak tinggi untuk pertempuran jarak dekat.',
    max_quantity: 10,
    prices: {
      weapon_only: 950000,
      bundle: 1850000 // Weapon + 500 Ammo
    },
    bundleDetails: 'Weapon + Attachment + 500 Ammo'
  },

  // --- KATEGORI ARMOR ---
  {
    id: 'heavy_armor_vest',
    category: 'Armor',
    name: 'Heavy Tactical Armor Vest',
    image: 'assets/armor.jpg',
    description: 'Rompi anti-peluru militer Kevlar tingkat tinggi untuk perlindungan maksimal pertempuran.',
    max_quantity: 5,
    prices: {
      unit: 450000
    },
    unitDetails: '450.000 / Vest'
  },

  // --- AMMO & ATTACHMENT ---
  {
    id: 'ammo_556',
    category: 'Ammo & Attachment',
    name: 'AMMO 5.56x45',
    image: 'https://images.unsplash.com/photo-1595590424283-b8f17842773f?auto=format&fit=crop&w=600&q=80',
    description: 'Peluru standar militer 5.56x45mm per Clip isi 100 butir peluru.',
    max_quantity: 20,
    prices: {
      unit: 150000 // Per Clip (100 ammo)
    },
    unitDetails: '150.000 / Clip (100 ammo)'
  },
  {
    id: 'attachment_clip',
    category: 'Ammo & Attachment',
    name: 'Attachment Extended Rifle Clip',
    image: 'https://images.unsplash.com/photo-1584441405886-bc458634469d?auto=format&fit=crop&w=600&q=80',
    description: 'Magasin tambahan berkapasitas ekstra untuk pengisian ulang peluru lebih cepat.',
    max_quantity: 10,
    prices: {
      unit: 150000
    },
    unitDetails: '150.000 / Item'
  }
];

// Initial Seed Orders matching user's prompt (5 Oct 2026 list)
export const INITIAL_ORDERS = [
  {
    id: 'order-1',
    customer_name: 'Abidin',
    item_category: 'Senjata Class 3',
    item_name: 'SPECTER CARBINE',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3800000,
    addons_details: '-',
    total_price: 3800000,
    status: 'Lunas done',
    created_at: '2026-10-05T09:15:00Z'
  },
  {
    id: 'order-2',
    customer_name: 'Tobe',
    item_category: 'Senjata Class 3',
    item_name: 'SPECTER CARBINE',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3800000,
    addons_details: '-',
    total_price: 3800000,
    status: 'Lunas done',
    created_at: '2026-10-05T09:30:00Z'
  },
  {
    id: 'order-3',
    customer_name: 'Enzel',
    item_category: 'Senjata Class 3',
    item_name: 'SPECTER CARBINE',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3800000,
    addons_details: '-',
    total_price: 3800000,
    status: 'Lunas',
    created_at: '2026-10-05T10:00:00Z'
  },
  {
    id: 'order-4',
    customer_name: 'Lukas',
    item_category: 'Senjata Class 3',
    item_name: 'SPECTER CARBINE',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3800000,
    addons_details: '-',
    total_price: 3800000,
    status: 'Lunas',
    created_at: '2026-10-05T10:30:00Z'
  },
  {
    id: 'order-5',
    customer_name: 'Mio',
    item_category: 'Senjata Class 3',
    item_name: 'SPECTER CARBINE',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3800000,
    addons_details: '-',
    total_price: 3800000,
    status: 'Lunas done',
    created_at: '2026-10-05T11:00:00Z'
  },
  {
    id: 'order-6',
    customer_name: 'Dadang',
    item_category: 'Senjata Class 3',
    item_name: 'AR 15 SHIELD',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3100000,
    addons_details: '-',
    total_price: 3100000,
    status: 'Lunas',
    created_at: '2026-10-05T11:45:00Z'
  },
  {
    id: 'order-7',
    customer_name: 'Uus',
    item_category: 'Senjata Class 3',
    item_name: 'AR 15 SHIELD',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3100000,
    addons_details: '+ 5 Clip Ammo (750.000)',
    total_price: 3850000,
    status: 'Pending',
    created_at: '2026-10-05T12:15:00Z'
  },
  {
    id: 'order-8',
    customer_name: 'Sunsun',
    item_category: 'Senjata Class 3',
    item_name: 'AR 15 SHIELD',
    variant: 'Weapon Only + Ammo',
    quantity: 1,
    unit_price: 3100000,
    addons_details: '+ 10 Clip Ammo AKM (1.500.000)',
    total_price: 4600000,
    status: 'Pending',
    created_at: '2026-10-05T13:00:00Z'
  },
  {
    id: 'order-9',
    customer_name: 'gabutzzz',
    item_category: 'Senjata Class 3',
    item_name: 'AR 15 SHIELD',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3100000,
    addons_details: '+ 5 Clip Ammo (750.000)',
    total_price: 3850000,
    status: 'Lunas done',
    created_at: '2026-10-05T14:20:00Z'
  },
  {
    id: 'order-10',
    customer_name: 'Bunny',
    item_category: 'Senjata Class 3',
    item_name: 'AR 15 SHIELD',
    variant: 'Bundle',
    quantity: 1,
    unit_price: 3100000,
    addons_details: '-',
    total_price: 3100000,
    status: 'Lunas done',
    created_at: '2026-10-05T15:00:00Z'
  }
];

export function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(number);
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
