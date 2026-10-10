import confetti from 'canvas-confetti';
import { CATALOG as FALLBACK_CATALOG, formatRupiah, formatDate } from './data.js';
import {
  fetchAllOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  fetchCatalogData,
  saveCatalogItem,
  deleteCatalogItem,
  isSupabaseConnected,
  getSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  subscribeToOrders
} from './supabase.js';

// Application State
let currentOrders = [];
let catalogState = [];
let categoriesState = [];   // { id, name, icon, description }
let isAdminAuthenticated = localStorage.getItem('babayo_admin_auth') === 'true';
let activeFilter = 'all';
let currentActiveCategory = null;
let selectedAdminCategory = null; // currently selected category in admin panel
let searchQuery = '';

// DOM Elements
const navCatalogBtn = document.getElementById('navCatalogBtn');
const navMyOrdersBtn = document.getElementById('navMyOrdersBtn');
const navDbConfigBtn = document.getElementById('navDbConfigBtn');
const navAdminBtn = document.getElementById('navAdminBtn');
const btnHomeBrand = document.getElementById('btnHomeBrand');

const viewCategoryHome = document.getElementById('viewCategoryHome');
const viewCategoryDetail = document.getElementById('viewCategoryDetail');
const viewMyOrders = document.getElementById('viewMyOrders');
const viewAdminDashboard = document.getElementById('viewAdminDashboard');

const homeCategoryGrid = document.getElementById('homeCategoryGrid');
const btnBackToCategories = document.getElementById('btnBackToCategories');
const activeCategoryTitle = document.getElementById('activeCategoryTitle');
const activeCategoryCountText = document.getElementById('activeCategoryCountText');
const itemsListContainer = document.getElementById('itemsListContainer');

const dbStatusBar = document.getElementById('dbStatusBar');
const dbStatusDot = document.getElementById('dbStatusDot');
const dbStatusText = document.getElementById('dbStatusText');
const btnOpenDbSetup = document.getElementById('btnOpenDbSetup');

const orderForm = document.getElementById('orderForm');
const inputCustomerName = document.getElementById('inputCustomerName');
const selectItem = document.getElementById('selectItem');
const variantGroup = document.getElementById('variantGroup');
const selectVariant = document.getElementById('selectVariant');
const inputQuantity = document.getElementById('inputQuantity');
const inputOrderNote = document.getElementById('inputOrderNote');
const calculatedTotalText = document.getElementById('calculatedTotalText');
const priceBreakdownText = document.getElementById('priceBreakdownText');

const userOrdersTableBody = document.getElementById('userOrdersTableBody');
const adminOrdersTableBody = document.getElementById('adminOrdersTableBody');
const adminCatalogTableBody = document.getElementById('adminCatalogTableBody');

const adminLoginCard = document.getElementById('adminLoginCard');
const adminPanel = document.getElementById('adminPanel');
const adminLoginForm = document.getElementById('adminLoginForm');
const adminPinInput = document.getElementById('adminPinInput');
const btnAdminLogout = document.getElementById('btnAdminLogout');
const adminCategoryFilter = document.getElementById('adminCategoryFilter');

const tabAdminOrders = document.getElementById('tabAdminOrders');
const tabAdminCatalog = document.getElementById('tabAdminCatalog');
const adminTabOrdersSection = document.getElementById('adminTabOrdersSection');
const adminTabCatalogSection = document.getElementById('adminTabCatalogSection');
const btnOpenAddNewItemModal = document.getElementById('btnOpenAddNewItemModal');

const statTotalRevenue = document.getElementById('statTotalRevenue');
const statTotalOrders = document.getElementById('statTotalOrders');
const statPendingCount = document.getElementById('statPendingCount');
const statCompletedCount = document.getElementById('statCompletedCount');
const adminSearchInput = document.getElementById('adminSearchInput');

// Category Modal Elements
const modalCategory = document.getElementById('modalCategory');
const modalCategoryTitle = document.getElementById('modalCategoryTitle');
const btnCloseCategoryModal = document.getElementById('btnCloseCategoryModal');
const btnCancelCategoryModal = document.getElementById('btnCancelCategoryModal');
const categoryForm = document.getElementById('categoryForm');
const categoryEditOldName = document.getElementById('categoryEditOldName');
const inputCategoryName = document.getElementById('inputCategoryName');
const inputCategoryDescription = document.getElementById('inputCategoryDescription');

// Item (Catalog) Modal Elements
const modalCatalogItem = document.getElementById('modalCatalogItem');
const modalCatalogTitle = document.getElementById('modalCatalogTitle');
const btnCloseCatalogModal = document.getElementById('btnCloseCatalogModal');
const btnCancelCatalogModal = document.getElementById('btnCancelCatalogModal');
const catalogItemForm = document.getElementById('catalogItemForm');
const catalogItemId = document.getElementById('catalogItemId');
const catalogItemCategory = document.getElementById('catalogItemCategory');
const inputCatalogName = document.getElementById('inputCatalogName');
const inputItemQuantity = document.getElementById('inputItemQuantity');
const inputItemUnitPrice = document.getElementById('inputItemUnitPrice');
const inputCatalogDescription = document.getElementById('inputCatalogDescription');
const itemModalCategoryBadge = document.getElementById('itemModalCategoryBadge');

// Database Config Modal Elements
const modalDbSetup = document.getElementById('modalDbSetup');
const btnCloseDbModal = document.getElementById('btnCloseDbModal');
const dbSetupForm = document.getElementById('dbSetupForm');
const inputSupabaseUrl = document.getElementById('inputSupabaseUrl');
const inputSupabaseKey = document.getElementById('inputSupabaseKey');
const btnCopySqlSchema = document.getElementById('btnCopySqlSchema');
const btnClearDbConfig = document.getElementById('btnClearDbConfig');
const toastContainer = document.getElementById('toastContainer');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupDatabaseBanner();
  setupFormListeners();
  setupAdminPanel();
  setupCategoryModal();
  setupCatalogItemModal();
  setupModalAndConfig();

  await refreshCatalogState();
  await refreshOrdersData();

  // Subscribe to Realtime DB updates
  subscribeToOrders(() => {
    console.log('Realtime database change detected!');
    refreshCatalogState();
    refreshOrdersData();
    showToast('🔄 Realtime update: Data diperbarui dari Supabase!');
  });
});

// --- NAVIGATION CONTROLLER ---
function switchView(targetViewId) {
  [viewCategoryHome, viewCategoryDetail, viewMyOrders, viewAdminDashboard].forEach(view => {
    view.classList.remove('active');
  });

  [navCatalogBtn, navMyOrdersBtn, navAdminBtn].forEach(btn => btn.classList.remove('active'));

  if (targetViewId === 'viewCategoryHome') {
    viewCategoryHome.classList.add('active');
    navCatalogBtn.classList.add('active');
    renderHomeCategories();
  } else if (targetViewId === 'viewCategoryDetail') {
    viewCategoryDetail.classList.add('active');
    navCatalogBtn.classList.add('active');
  } else if (targetViewId === 'viewMyOrders') {
    viewMyOrders.classList.add('active');
    navMyOrdersBtn.classList.add('active');
    renderUserOrdersTable();
  } else if (targetViewId === 'viewAdminDashboard') {
    viewAdminDashboard.classList.add('active');
    navAdminBtn.classList.add('active');
    checkAdminAuthState();
  }
}

function setupNavigation() {
  btnHomeBrand.addEventListener('click', () => switchView('viewCategoryHome'));
  navCatalogBtn.addEventListener('click', () => switchView('viewCategoryHome'));
  navMyOrdersBtn.addEventListener('click', () => switchView('viewMyOrders'));
  navDbConfigBtn.addEventListener('click', () => openDbModal());
  navAdminBtn.addEventListener('click', () => switchView('viewAdminDashboard'));
  btnBackToCategories.addEventListener('click', () => switchView('viewCategoryHome'));
}

// --- CATALOG DATA MANAGER ---
async function refreshCatalogState() {
  catalogState = await fetchCatalogData();
  if (!catalogState || catalogState.length === 0) {
    catalogState = FALLBACK_CATALOG;
  }
  // Sync categoriesState from catalogState
  syncCategoriesFromCatalog();
  renderHomeCategories();
  renderAdminCategoryList();
  if (selectedAdminCategory) {
    renderAdminItemsForCategory(selectedAdminCategory);
  }
}

// Sync categories from catalogState (derive unique categories)
function syncCategoriesFromCatalog() {
  const storedCats = JSON.parse(localStorage.getItem('babayo_categories') || '[]');
  // Get all unique categories from catalog items
  const catalogCatNames = [...new Set(catalogState.map(i => i.category))];
  
  // Merge: keep existing with metadata, add new ones
  catalogCatNames.forEach(catName => {
    if (!storedCats.find(c => c.name === catName)) {
      storedCats.push({
        id: 'cat-' + Date.now() + '-' + Math.random().toString(36).slice(2,6),
        name: catName,
        icon: guessIcon(catName),
        description: ''
      });
    }
  });
  
  // Filter out categories that have no items (unless manually created and stored)
  categoriesState = storedCats;
  localStorage.setItem('babayo_categories', JSON.stringify(categoriesState));
}

function guessIcon(catName) {
  const n = catName.toLowerCase();
  if (n.includes('class 3') || n.includes('senjata') || n.includes('rifle') || n.includes('gun')) return '🔫';
  if (n.includes('class 2') || n.includes('pistol') || n.includes('smg')) return '⚔️';
  if (n.includes('ammo') || n.includes('peluru')) return '⚡';
  if (n.includes('armor') || n.includes('vest') || n.includes('rompi')) return '🛡️';
  if (n.includes('knife') || n.includes('pisau')) return '🗡️';
  if (n.includes('grenade') || n.includes('bom')) return '💣';
  return '📦';
}

// Save categories to localStorage
function saveCategoriesLocal() {
  localStorage.setItem('babayo_categories', JSON.stringify(categoriesState));
}

// Render Dynamic Category Cards on Homepage
function renderHomeCategories() {
  homeCategoryGrid.innerHTML = '';

  // Aggregate unique categories
  const categoryMap = {};
  catalogState.forEach(item => {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = [];
    }
    categoryMap[item.category].push(item);
  });

  const categories = Object.keys(categoryMap);

  if (categories.length === 0) {
    homeCategoryGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 3rem;">
        Belum ada kategori barang. Silakan tambah di Admin Dashboard.
      </div>
    `;
    return;
  }

  categories.forEach(catName => {
    const items = categoryMap[catName];
    const card = document.createElement('div');
    card.className = 'main-cat-card';

    // Get icon from categoriesState metadata, fallback to guessIcon
    const catMeta = categoriesState.find(c => c.name === catName);
    const catIcon = catMeta?.icon || guessIcon(catName);

    const itemNamesText = items.map(i => i.name).slice(0, 3).join(', ');

    card.innerHTML = `
      <div class="main-cat-icon">${catIcon}</div>
      <div class="main-cat-title">${catName}</div>
      <div class="main-cat-desc">
        ${catMeta?.description ? escapeHtml(catMeta.description) + '<br>' : ''}
        Daftar item: <b>${escapeHtml(itemNamesText)}</b>. ${items.length} item tersedia dalam kategori ini.
      </div>
      <div class="main-cat-action">
        Masuk Ke Kategori ${escapeHtml(catName)} &rarr;
      </div>
    `;

    card.addEventListener('click', () => openCategoryDetail(catName));
    homeCategoryGrid.appendChild(card);
  });
}

// Open Category Detail View & Render Items + Form Dropdown
function openCategoryDetail(categoryName) {
  currentActiveCategory = categoryName;
  activeCategoryTitle.textContent = categoryName;

  const categoryItems = catalogState.filter(item => item.category === categoryName);
  activeCategoryCountText.textContent = `${categoryItems.length} Item Tersedia`;

  // Render Left Column Items List
  renderLeftItemsList(categoryItems);

  // Populate Right Form Select Dropdown
  selectItem.innerHTML = '';
  categoryItems.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.id;
    opt.textContent = item.name;
    selectItem.appendChild(opt);
  });

  if (categoryItems.length > 0) {
    selectItem.value = categoryItems[0].id;
  }

  onItemChange();
  switchView('viewCategoryDetail');
}

// Render Left Column Product Cards
function renderLeftItemsList(categoryItems) {
  itemsListContainer.innerHTML = '';

  categoryItems.forEach(item => {
    const card = document.createElement('div');
    card.className = 'item-list-card';
    card.dataset.itemId = item.id;

    let priceHTML = '';
    if (item.prices.weapon_only) {
      priceHTML = `
        <div style="font-size: 0.85rem;"><span style="color: var(--text-secondary);">Weapon Only:</span> <b class="font-mono" style="color: var(--accent-gold);">${formatRupiah(item.prices.weapon_only)}</b></div>
        <div style="font-size: 0.85rem;"><span style="color: var(--text-secondary);">Bundle (+Ammo+Att):</span> <b class="font-mono" style="color: var(--primary);">${formatRupiah(item.prices.bundle)}</b></div>
      `;
    } else {
      priceHTML = `
        <div style="font-size: 0.85rem;"><span style="color: var(--text-secondary);">Harga per Unit:</span> <b class="font-mono" style="color: var(--accent-gold);">${formatRupiah(item.prices.unit || 0)}</b></div>
      `;
    }

    const noteHTML = item.description ? `<div style="font-size: 0.8rem; color: var(--accent-gold); margin-top: 0.3rem;">ℹ️ ${escapeHtml(item.description)}</div>` : '';
    const imageUrl = /^https?:\/\//i.test(item.image)
      ? item.image
      : `/${item.image.replace(/^\/?(?:BABAYO\/)?/, 'BABAYO/')}`;

    card.innerHTML = `
      <div class="item-list-thumb">
        <img src="${imageUrl}" alt="${escapeHtml(item.name)}" loading="lazy" />
      </div>
      <div class="item-list-info">
        <div class="item-list-title">${escapeHtml(item.name)}</div>
        <div class="item-list-desc">${escapeHtml(item.description || '')}</div>
        <div class="item-prices-box">${priceHTML}</div>
        ${noteHTML}
      </div>
      <button class="btn-select-this-item" data-select-id="${item.id}">
        🎯 Pilih Item
      </button>
    `;

    itemsListContainer.appendChild(card);
  });

  // Attach click listener for "Pilih Item" buttons
  document.querySelectorAll('[data-select-id]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedId = e.currentTarget.dataset.selectId;
      selectItem.value = selectedId;
      onItemChange();
      highlightSelectedItemCard(selectedId);
    });
  });
}

function highlightSelectedItemCard(selectedId) {
  document.querySelectorAll('.item-list-card').forEach(c => {
    if (c.dataset.itemId === selectedId) {
      c.classList.add('selected-item');
    } else {
      c.classList.remove('selected-item');
    }
  });
}

// --- DATABASE STATUS BANNER ---
function setupDatabaseBanner() {
  const connected = isSupabaseConnected();
  if (connected) {
    dbStatusDot.className = 'status-dot connected';
    dbStatusText.textContent = 'Mode Supabase Cloud Active (Realtime DB Live)';
  } else {
    dbStatusDot.className = 'status-dot local';
    dbStatusText.textContent = 'Mode Local Storage Active (Klik untuk Hubungkan Supabase)';
  }

  btnOpenDbSetup.addEventListener('click', openDbModal);
}

// --- DATA FETCH & REFRESH ---
async function refreshOrdersData() {
  currentOrders = await fetchAllOrders();
  renderUserOrdersTable();
  renderAdminOrdersTable();
  updateAdminStats();
}

// --- DYNAMIC ORDER FORM CALCULATION ---
function setupFormListeners() {
  selectItem.addEventListener('change', onItemChange);
  selectVariant.addEventListener('change', calculateTotal);
  inputQuantity.addEventListener('input', calculateTotal);

  orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleOrderSubmit();
  });
}

function onItemChange() {
  const selectedId = selectItem.value;
  const product = catalogState.find(p => p.id === selectedId);

  highlightSelectedItemCard(selectedId);

  if (product && product.prices.weapon_only) {
    variantGroup.style.display = 'flex';
  } else {
    variantGroup.style.display = 'none';
  }

  calculateTotal();
}

function calculateTotal() {
  const selectedId = selectItem.value;
  const product = catalogState.find(p => p.id === selectedId);

  if (!product) {
    calculatedTotalText.textContent = 'Rp 0';
    priceBreakdownText.textContent = 'Pilih item untuk melihat rincian harga';
    return 0;
  }

  let basePrice = 0;
  let variantName = '-';

  if (product.prices.weapon_only) {
    const variantVal = selectVariant.value;
    if (variantVal === 'Bundle') {
      basePrice = product.prices.bundle;
      variantName = 'Bundle (Weapon + Attachment + Ammo)';
    } else {
      basePrice = product.prices.weapon_only;
      variantName = 'Weapon Only';
    }
  } else {
    basePrice = product.prices.unit || 0;
    variantName = product.unitDetails || 'Unit Standar';
  }

  const qty = parseInt(inputQuantity.value) || 1;
  const grandTotal = basePrice * qty;

  calculatedTotalText.textContent = formatRupiah(grandTotal);
  priceBreakdownText.textContent = `${formatRupiah(basePrice)} x ${qty} Qty`;

  return { grandTotal, basePrice, variantName, product };
}

async function handleOrderSubmit() {
  const customerName = inputCustomerName.value.trim();
  const selectedId = selectItem.value;
  const product = catalogState.find(p => p.id === selectedId);

  if (!customerName || !product) {
    showToast('⚠️ Harap lengkapi Nama dan Item yang dipesan!', 'error');
    return;
  }

  const calc = calculateTotal();

  const payload = {
    customer_name: customerName,
    item_category: product.category,
    item_name: product.name,
    variant: calc.variantName,
    quantity: parseInt(inputQuantity.value) || 1,
    unit_price: calc.basePrice,
    note: inputOrderNote.value.trim(),
    total_price: calc.grandTotal,
    status: 'Pending'
  };

  const res = await createOrder(payload);

  if (res.success) {
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    showToast(`✅ Pesanan a.n. ${customerName} berhasil dikirim! Status: Pending`, 'success');

    inputCustomerName.value = '';
    inputOrderNote.value = '';

    await refreshOrdersData();
    switchView('viewMyOrders');
  } else {
    showToast('❌ Gagal mengirim pesanan, silakan coba lagi.', 'error');
  }
}

// --- USER ORDERS TABLE ---
function renderUserOrdersTable() {
  userOrdersTableBody.innerHTML = '';

  if (currentOrders.length === 0) {
    userOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Belum ada pengajuan pesanan. Silakan ajukan di menu Pilih Kategori.
        </td>
      </tr>
    `;
    return;
  }

  currentOrders.forEach(order => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono" style="font-size: 0.8rem; color: var(--text-muted);">${formatDate(order.created_at)}</td>
      <td><b style="color: #fff;">${escapeHtml(order.customer_name)}</b></td>
      <td>
        <div><b>${escapeHtml(order.item_name)}</b></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(order.variant)} (${order.quantity}x)</div>
      </td>
      <td style="font-size: 0.85rem; color: var(--text-secondary);">${escapeHtml(order.note || '-')}</td>
      <td class="font-mono" style="font-weight: 700; color: var(--accent-gold);">${formatRupiah(order.total_price)}</td>
      <td>${getStatusBadge(order.status)}</td>
    `;
    userOrdersTableBody.appendChild(tr);
  });
}

// --- ADMIN AUTH & CONTROLLER ---
function setupAdminPanel() {
  adminLoginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pin = adminPinInput.value;
    if (pin === 'admin123') {
      isAdminAuthenticated = true;
      localStorage.setItem('babayo_admin_auth', 'true');
      showToast('🔓 Admin Authenticated Successfully!', 'success');
      checkAdminAuthState();
    } else {
      showToast('🔒 PIN Admin Salah! Sandi default: admin123', 'error');
    }
  });

  btnAdminLogout.addEventListener('click', () => {
    isAdminAuthenticated = false;
    localStorage.removeItem('babayo_admin_auth');
    checkAdminAuthState();
    showToast('🚪 Logged out from Admin Dashboard');
  });

  // Admin Sub-Tab Switching
  tabAdminOrders.addEventListener('click', () => {
    tabAdminOrders.classList.add('active');
    tabAdminCatalog.classList.remove('active');
    adminTabOrdersSection.style.display = 'block';
    adminTabCatalogSection.style.display = 'none';
  });

  tabAdminCatalog.addEventListener('click', () => {
    tabAdminCatalog.classList.add('active');
    tabAdminOrders.classList.remove('active');
    adminTabCatalogSection.style.display = 'block';
    adminTabOrdersSection.style.display = 'none';
    renderAdminCategoryList();
    if (selectedAdminCategory) renderAdminItemsForCategory(selectedAdminCategory);
  });

  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('[data-status-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.statusFilter;
      renderAdminOrdersTable();
    });
  });

  adminSearchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderAdminOrdersTable();
  });

  adminCategoryFilter.addEventListener('change', renderAdminOrdersTable);
}

function checkAdminAuthState() {
  if (isAdminAuthenticated) {
    adminLoginCard.style.display = 'none';
    adminPanel.style.display = 'block';
    renderAdminOrdersTable();
    renderAdminCategoryList();
    updateAdminStats();
  } else {
    adminLoginCard.style.display = 'block';
    adminPanel.style.display = 'none';
  }
}

function updateAdminStats() {
  let revenue = 0;
  let pendingCount = 0;
  let completedCount = 0;

  currentOrders.forEach(ord => {
    if (ord.status === 'Lunas' || ord.status === 'Lunas done') {
      revenue += Number(ord.total_price);
    }
    if (ord.status === 'Pending') pendingCount++;
    if (ord.status === 'Lunas done') completedCount++;
  });

  statTotalRevenue.textContent = formatRupiah(revenue);
  statTotalOrders.textContent = currentOrders.length;
  statPendingCount.textContent = pendingCount;
  statCompletedCount.textContent = completedCount;
}

// --- ADMIN CATALOG MANAGEMENT: CATEGORY LIST & ITEM LIST ---

// Render the left panel: list of categories
function renderAdminCategoryList() {
  const adminCategoryList = document.getElementById('adminCategoryList');
  if (!adminCategoryList) return;
  adminCategoryList.innerHTML = '';

  if (categoriesState.length === 0) {
    adminCategoryList.innerHTML = `
      <div class="empty-state-catalog">
        <div style="font-size: 2rem;">📂</div>
        <div>Belum ada kategori. Klik <b>+ Tambah</b> untuk membuat kategori baru.</div>
      </div>
    `;
    return;
  }

  categoriesState.forEach(cat => {
    const itemCount = catalogState.filter(i => i.category === cat.name).length;
    const isActive = selectedAdminCategory === cat.name;
    const div = document.createElement('div');
    div.className = 'cat-list-item' + (isActive ? ' active' : '');
    div.innerHTML = `
      <div class="cat-list-main" data-cat-select="${escapeHtml(cat.name)}">
        <div class="cat-list-icon">${escapeHtml(cat.icon || '📦')}</div>
        <div class="cat-list-info">
          <div class="cat-list-name">${escapeHtml(cat.name)}</div>
          <div class="cat-list-count">${itemCount} item</div>
        </div>
      </div>
      <div class="cat-list-actions">
        <button class="btn-icon" data-cat-edit="${escapeHtml(cat.name)}" title="Edit Kategori">✏️</button>
        <button class="btn-icon btn-icon-danger" data-cat-delete="${escapeHtml(cat.name)}" title="Hapus Kategori">🗑️</button>
      </div>
    `;
    adminCategoryList.appendChild(div);
  });

  // Listeners
  adminCategoryList.querySelectorAll('[data-cat-select]').forEach(el => {
    el.addEventListener('click', (e) => {
      const catName = e.currentTarget.dataset.catSelect;
      selectedAdminCategory = catName;
      renderAdminCategoryList();
      renderAdminItemsForCategory(catName);
    });
  });

  adminCategoryList.querySelectorAll('[data-cat-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const catName = e.currentTarget.dataset.catEdit;
      const cat = categoriesState.find(c => c.name === catName);
      if (cat) openCategoryModal(cat);
    });
  });

  adminCategoryList.querySelectorAll('[data-cat-delete]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const catName = e.currentTarget.dataset.catDelete;
      const itemsInCat = catalogState.filter(i => i.category === catName);
      if (itemsInCat.length > 0) {
        if (!confirm(`Kategori "${catName}" masih memiliki ${itemsInCat.length} item. Hapus kategori beserta semua itemnya?`)) return;
        // Delete all items in the category
        for (const item of itemsInCat) {
          await deleteCatalogItem(item.id);
        }
      } else {
        if (!confirm(`Hapus kategori "${catName}"?`)) return;
      }
      categoriesState = categoriesState.filter(c => c.name !== catName);
      saveCategoriesLocal();
      if (selectedAdminCategory === catName) selectedAdminCategory = null;
      showToast(`🗑️ Kategori "${catName}" berhasil dihapus`);
      await refreshCatalogState();
    });
  });
}

// Render the right panel: items within a selected category
function renderAdminItemsForCategory(catName) {
  const adminItemsList = document.getElementById('adminItemsList');
  const selectedCategoryLabel = document.getElementById('selectedCategoryLabel');
  const selectedCategoryItemCount = document.getElementById('selectedCategoryItemCount');
  const btnOpenAddItemModal = document.getElementById('btnOpenAddItemModal');
  if (!adminItemsList) return;

  const cat = categoriesState.find(c => c.name === catName);
  const catIcon = cat?.icon || '📦';
  selectedCategoryLabel.textContent = `${catIcon} ${catName}`;
  btnOpenAddItemModal.style.display = 'block';

  const items = catalogState.filter(i => i.category === catName);
  selectedCategoryItemCount.textContent = `${items.length} item dalam kategori ini`;

  adminItemsList.innerHTML = '';

  if (items.length === 0) {
    adminItemsList.innerHTML = `
      <div class="empty-state-catalog">
        <div style="font-size: 2rem;">📭</div>
        <div>Belum ada item di kategori ini. Klik <b>+ Tambah Item</b>.</div>
      </div>
    `;
    return;
  }

  // Render item cards in a table-like list
  const table = document.createElement('table');
  table.className = 'orders-table';
  table.innerHTML = `
    <thead>
      <tr>
        <th style="width:40%">Nama Item</th>
        <th>Quantity / Stok</th>
        <th>Biaya Satuan</th>
        <th>Deskripsi</th>
        <th>Aksi</th>
      </tr>
    </thead>
  `;
  const tbody = document.createElement('tbody');

  items.forEach(item => {
    const qty = item.quantity !== undefined ? item.quantity : (item.max_quantity || '-');
    const unitPrice = item.prices?.unit || item.prices?.weapon_only || 0;
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <b style="color: #fff;">${escapeHtml(item.name)}</b>
      </td>
      <td>
        <span class="qty-badge">${qty}</span>
      </td>
      <td class="font-mono" style="color: var(--accent-gold); font-weight:700;">
        ${formatRupiah(unitPrice)}
      </td>
      <td style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHtml(item.description || '-')}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-sm-outline" data-item-edit="${item.id}">✏️ Edit</button>
          <button class="btn-delete" data-item-delete="${item.id}" title="Hapus">&times;</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  adminItemsList.appendChild(table);

  // Attach listeners
  adminItemsList.querySelectorAll('[data-item-edit]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.itemEdit;
      const item = catalogState.find(c => c.id === id);
      if (item) openCatalogItemModal(item);
    });
  });

  adminItemsList.querySelectorAll('[data-item-delete]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.itemDelete;
      const item = catalogState.find(c => c.id === id);
      if (!confirm(`Hapus item "${item?.name}"?`)) return;
      await deleteCatalogItem(id);
      showToast(`🗑️ Item "${item?.name}" berhasil dihapus`);
      await refreshCatalogState();
    });
  });
}

// --- CATEGORY MODAL SETUP ---
function setupCategoryModal() {
  const btnOpenAddCategoryModal = document.getElementById('btnOpenAddCategoryModal');
  btnOpenAddCategoryModal.addEventListener('click', () => openCategoryModal(null));
  btnCloseCategoryModal.addEventListener('click', closeCategoryModal);
  btnCancelCategoryModal.addEventListener('click', closeCategoryModal);
  modalCategory.addEventListener('click', (e) => { if (e.target === modalCategory) closeCategoryModal(); });

  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveCategory();
  });
}

function openCategoryModal(catToEdit = null) {
  if (catToEdit) {
    modalCategoryTitle.textContent = '✏️ Edit Kategori';
    categoryEditOldName.value = catToEdit.name;
    inputCategoryName.value = catToEdit.name;
    inputCategoryDescription.value = catToEdit.description || '';
  } else {
    modalCategoryTitle.textContent = '🗂️ Tambah Kategori Baru';
    categoryForm.reset();
    categoryEditOldName.value = '';
  }
  modalCategory.classList.add('active');
}

function closeCategoryModal() {
  modalCategory.classList.remove('active');
}

async function handleSaveCategory() {
  const name = inputCategoryName.value.trim();
  const description = inputCategoryDescription.value.trim();
  const oldName = categoryEditOldName.value;
  const icon = categoriesState.find(category => category.name === oldName)?.icon || guessIcon(name);

  if (!name) {
    showToast('⚠️ Nama kategori wajib diisi!', 'error');
    return;
  }

  if (oldName && oldName !== name) {
    // Rename: update all catalog items with old category name
    const updatedCatalog = catalogState.map(item => {
      if (item.category === oldName) {
        return { ...item, category: name };
      }
      return item;
    });
    // Save updated items
    for (const item of updatedCatalog.filter(i => i.category === name && catalogState.find(c => c.id === i.id && c.category === oldName))) {
      await saveCatalogItem(item);
    }
    // Update category entry
    const catIdx = categoriesState.findIndex(c => c.name === oldName);
    if (catIdx >= 0) {
      categoriesState[catIdx] = { ...categoriesState[catIdx], name, description };
    }
    if (selectedAdminCategory === oldName) selectedAdminCategory = name;
  } else if (!oldName) {
    // New category
    if (categoriesState.find(c => c.name === name)) {
      showToast('⚠️ Kategori dengan nama ini sudah ada!', 'error');
      return;
    }
    categoriesState.push({
      id: 'cat-' + Date.now(),
      name, icon, description
    });
  } else {
    // Update same name category (icon/desc change)
    const catIdx = categoriesState.findIndex(c => c.name === oldName);
    if (catIdx >= 0) {
      categoriesState[catIdx] = { ...categoriesState[catIdx], name, description };
    }
  }

  saveCategoriesLocal();
  showToast(`✅ Kategori "${name}" berhasil disimpan!`, 'success');
  closeCategoryModal();
  await refreshCatalogState();
  renderAdminOrdersTable();
}

// --- CATALOG ITEM MODAL SETUP ---
function setupCatalogItemModal() {
  const btnOpenAddItemModal = document.getElementById('btnOpenAddItemModal');
  btnOpenAddItemModal.addEventListener('click', () => openCatalogItemModal(null));
  btnCloseCatalogModal.addEventListener('click', closeCatalogModal);
  btnCancelCatalogModal.addEventListener('click', closeCatalogModal);
  modalCatalogItem.addEventListener('click', (e) => { if (e.target === modalCatalogItem) closeCatalogModal(); });

  catalogItemForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleSaveCatalogItem();
  });
}

function openCatalogItemModal(itemToEdit = null) {
  const category = selectedAdminCategory;
  if (!category && !itemToEdit) {
    showToast('⚠️ Pilih kategori terlebih dahulu!', 'error');
    return;
  }

  const catName = itemToEdit ? itemToEdit.category : category;
  itemModalCategoryBadge.textContent = catName;
  catalogItemCategory.value = catName;

  if (itemToEdit) {
    modalCatalogTitle.textContent = '✏️ Edit Item';
    catalogItemId.value = itemToEdit.id;
    inputCatalogName.value = itemToEdit.name;
    inputItemQuantity.value = itemToEdit.quantity !== undefined ? itemToEdit.quantity : (itemToEdit.max_quantity || 0);
    // Get unit price: prefer prices.unit, then prices.weapon_only
    inputItemUnitPrice.value = itemToEdit.prices?.unit || itemToEdit.prices?.weapon_only || '';
    inputCatalogDescription.value = itemToEdit.description || '';
  } else {
    modalCatalogTitle.textContent = '📦 Tambah Item Baru';
    catalogItemForm.reset();
    catalogItemId.value = '';
    catalogItemCategory.value = catName;
    itemModalCategoryBadge.textContent = catName;
    inputItemQuantity.value = 0;
  }

  modalCatalogItem.classList.add('active');
}

function closeCatalogModal() {
  modalCatalogItem.classList.remove('active');
}

async function handleSaveCatalogItem() {
  const name = inputCatalogName.value.trim();
  const category = catalogItemCategory.value;
  const quantity = parseInt(inputItemQuantity.value) || 0;
  const unitPrice = parseFloat(inputItemUnitPrice.value) || 0;
  const description = inputCatalogDescription.value.trim();

  if (!name || !category) {
    showToast('⚠️ Nama Item dan Kategori wajib diisi!', 'error');
    return;
  }

  if (!unitPrice) {
    showToast('⚠️ Biaya Satuan wajib diisi!', 'error');
    return;
  }

  const payload = {
    id: catalogItemId.value || 'item-' + Date.now(),
    category: category,
    name: name,
    image: 'BABAYO/assets/arp.jpg', // default image
    description: description,
    quantity: quantity,
    prices: {
      weapon_only: 0,
      bundle: 0,
      unit: unitPrice
    },
    unitDetails: `${formatRupiah(unitPrice)} / Unit`
  };

  const res = await saveCatalogItem(payload);
  if (res.success) {
    showToast(`✅ Item "${name}" berhasil disimpan!`, 'success');
    closeCatalogModal();
    await refreshCatalogState();
  } else {
    showToast('❌ Gagal menyimpan item.', 'error');
  }
}

// --- ADMIN ORDERS TABLE RENDERING & ACTIONS ---
function renderAdminOrdersTable() {
  adminOrdersTableBody.innerHTML = '';
  const categoryNames = [...new Set([
    ...categoriesState.map(category => category.name),
    ...catalogState.map(item => item.category),
    ...currentOrders.map(order => order.item_category)
  ])].filter(Boolean).sort((a, b) => a.localeCompare(b));
  const selectedCategory = adminCategoryFilter.value;
  adminCategoryFilter.innerHTML = '<option value="all">Semua Kategori</option>';
  categoryNames.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    adminCategoryFilter.appendChild(option);
  });
  adminCategoryFilter.value = categoryNames.includes(selectedCategory) ? selectedCategory : 'all';

  let filtered = currentOrders;

  if (adminCategoryFilter.value !== 'all') {
    filtered = filtered.filter(order => order.item_category === adminCategoryFilter.value);
  }

  if (activeFilter !== 'all') {
    filtered = filtered.filter(o => o.status.toLowerCase() === activeFilter.toLowerCase());
  }

  if (searchQuery) {
    filtered = filtered.filter(o =>
      o.customer_name.toLowerCase().includes(searchQuery) ||
      o.item_name.toLowerCase().includes(searchQuery) ||
      (o.note || '').toLowerCase().includes(searchQuery) ||
      o.status.toLowerCase().includes(searchQuery)
    );
  }

  if (filtered.length === 0) {
    adminOrdersTableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: var(--text-muted); padding: 2rem;">
          Tidak ada data pesanan ditemukan untuk filter ini.
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((order, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="font-mono" style="color: var(--text-muted);">${index + 1}</td>
      <td class="font-mono" style="font-size: 0.78rem;">${formatDate(order.created_at)}</td>
      <td><b style="color: #fff; font-size: 0.95rem;">${escapeHtml(order.customer_name)}</b></td>
      <td>${escapeHtml(order.item_category || '-')}</td>
      <td>
        <div><b>${escapeHtml(order.item_name)}</b></div>
        <div style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(order.variant)} (${order.quantity}x)</div>
      </td>
      <td style="font-size: 0.82rem; color: var(--text-secondary);">${escapeHtml(order.note || '-')}</td>
      <td class="font-mono" style="font-weight: 700; color: var(--accent-gold);">${formatRupiah(order.total_price)}</td>
      <td>${getStatusBadge(order.status)}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-acc" data-action="lunas" data-id="${order.id}">🟢 ACC Lunas</button>
          <button class="btn-done" data-action="done" data-id="${order.id}">✅ Done</button>
          <button class="btn-reject" data-action="reject" data-id="${order.id}">🔴 Tolak</button>
          <button class="btn-delete" data-action="delete" data-id="${order.id}" title="Hapus">&times;</button>
        </div>
      </td>
    `;
    adminOrdersTableBody.appendChild(tr);
  });

  // Attach Action Listeners
  adminOrdersTableBody.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const action = e.currentTarget.dataset.action;
      const id = e.currentTarget.dataset.id;

      if (action === 'lunas') {
        await updateOrderStatus(id, 'Lunas');
        confetti({ particleCount: 50, spread: 50 });
        showToast('🟢 Pesanan disetujui -> Status: Lunas');
      } else if (action === 'done') {
        await updateOrderStatus(id, 'Lunas done');
        confetti({ particleCount: 80, spread: 70 });
        showToast('✅ Pesanan selesai -> Status: Lunas done');
      } else if (action === 'reject') {
        await updateOrderStatus(id, 'Ditolak');
        showToast('🔴 Pesanan ditolak');
      } else if (action === 'delete') {
        if (confirm('Apakah Anda yakin ingin menghapus pesanan ini?')) {
          await deleteOrder(id);
          showToast('🗑️ Pesanan berhasil dihapus');
        }
      }

      await refreshOrdersData();
    });
  });
}

// --- SUPABASE CONFIG MODAL ---
function setupModalAndConfig() {
  const config = getSupabaseConfig();
  if (config.url) inputSupabaseUrl.value = config.url;
  if (config.key) inputSupabaseKey.value = config.key;

  btnCloseDbModal.addEventListener('click', closeDbModal);
  modalDbSetup.addEventListener('click', (e) => {
    if (e.target === modalDbSetup) closeDbModal();
  });

  dbSetupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSupabaseConfig(inputSupabaseUrl.value, inputSupabaseKey.value);
    showToast('⚡ Credentials Supabase Berhasil Disimpan!');
    setupDatabaseBanner();
    closeDbModal();
    refreshCatalogState();
    refreshOrdersData();
  });

  btnClearDbConfig.addEventListener('click', () => {
    clearSupabaseConfig();
    inputSupabaseUrl.value = '';
    inputSupabaseKey.value = '';
    setupDatabaseBanner();
    showToast('🔌 Supabase Connection Disconnected (Mode Local Storage)');
    closeDbModal();
    refreshCatalogState();
    refreshOrdersData();
  });

  btnCopySqlSchema.addEventListener('click', () => {
    const sql = `-- BABAYO SUPABASE SQL SCHEMA
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    item_category TEXT NOT NULL,
    item_name TEXT NOT NULL,
    variant TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC NOT NULL,
    note TEXT DEFAULT '',
    total_price NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS public.catalog (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    image TEXT NOT NULL,
    description TEXT DEFAULT '',
    quantity INT DEFAULT 0,
    price_weapon_only NUMERIC DEFAULT 0,
    price_bundle NUMERIC DEFAULT 0,
    price_unit NUMERIC DEFAULT 0,
    unit_details TEXT DEFAULT '',
    bundle_details TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS note TEXT DEFAULT '';
ALTER TABLE public.catalog ADD COLUMN IF NOT EXISTS quantity INT DEFAULT 0;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);
DROP POLICY IF EXISTS "Allow public select catalog" ON public.catalog;
CREATE POLICY "Allow public select catalog" ON public.catalog FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert catalog" ON public.catalog;
CREATE POLICY "Allow public insert catalog" ON public.catalog FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update catalog" ON public.catalog;
CREATE POLICY "Allow public update catalog" ON public.catalog FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete catalog" ON public.catalog;
CREATE POLICY "Allow public delete catalog" ON public.catalog FOR DELETE USING (true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'orders') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'catalog') THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.catalog;
    END IF;
  END IF;
END $$;`;

    navigator.clipboard.writeText(sql);
    showToast('📋 SQL Schema copied to Clipboard!');
  });
}

function openDbModal() {
  modalDbSetup.classList.add('active');
}

function closeDbModal() {
  modalDbSetup.classList.remove('active');
}

// --- UTILITY FUNCTIONS ---
function getStatusBadge(status) {
  const s = status ? status.toLowerCase() : '';
  if (s === 'pending') {
    return `<span class="badge badge-pending">⏳ Pending</span>`;
  } else if (s === 'lunas') {
    return `<span class="badge badge-lunas">💳 Lunas</span>`;
  } else if (s === 'lunas done' || s === 'done') {
    return `<span class="badge badge-done">✅ Lunas Done</span>`;
  } else if (s === 'ditolak') {
    return `<span class="badge badge-ditolak">🔴 Ditolak</span>`;
  }
  return `<span class="badge badge-pending">${escapeHtml(status)}</span>`;
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}