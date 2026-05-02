// ── admin.js — Admin Panel Logic ──

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('navbar').innerHTML = buildNavbar();

    // Only allow admin users
    const user = requireLogin();
    if (!user) return;
    const isAdminUser = user.role === 'ADMIN' || user.role === 'ROLE_ADMIN';
if (!isAdminUser) {
        alert('Access denied. Admins only.');
        window.location.href = 'index.html';
        return;
    }

    showSection('products');
});

// ── SECTION SWITCHER ───────────────────────────────────
function showSection(name) {
    document.querySelectorAll('.admin-nav-item').forEach((el, i) => {
        el.classList.toggle('active',
            el.textContent.toLowerCase().includes(name));
    });

    if (name === 'products') loadProductsTable();
    else if (name === 'add')  { openModal(); }
    else if (name === 'stats') loadStats();
}

// ── PRODUCTS TABLE ─────────────────────────────────────
async function loadProductsTable() {
    const section = document.getElementById('adminSection');
    section.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

    try {
        allProducts = await getAllProducts();
        section.innerHTML = `
            <div class="admin-header">
                <div class="admin-title">All Products (${allProducts.length})</div>
                <button class="btn btn-primary" onclick="openModal()">
                    ➕ Add Product
                </button>
            </div>
            <div class="admin-table-wrap">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>#ID</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${allProducts.map(p => `
                            <tr>
                                <td>#${p.id}</td>
                                <td>${p.name}</td>
                                <td>
                                    <span class="product-badge badge-${p.category.toLowerCase()}"
                                          style="position:static">
                                        ${p.category}
                                    </span>
                                </td>
                                <td>${formatPrice(p.price)}</td>
                                <td>
                                    <span style="color:${p.stock < 10 ? 'var(--amber)' : 'var(--green)'}">
                                        ${p.stock}
                                    </span>
                                </td>
                                <td>
                                    <div style="display:flex;gap:6px">
                                        <button class="btn btn-outline"
                                            style="padding:6px 12px;font-size:.8rem"
                                            onclick="openEditModal(${p.id})">
                                            ✏️ Edit
                                        </button>
                                        <button class="btn btn-danger"
                                            style="padding:6px 12px;font-size:.8rem"
                                            onclick="handleDelete(${p.id}, '${p.name}')">
                                            🗑 Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
    } catch (err) {
        section.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">⚠️</div>
                <h3>Could not load products</h3>
                <button class="btn btn-outline" onclick="loadProductsTable()">Retry</button>
            </div>`;
    }
}

// ── STATS SECTION ──────────────────────────────────────
async function loadStats() {
    const section = document.getElementById('adminSection');
    section.innerHTML = `<div class="page-loader"><div class="spinner"></div></div>`;

    const products = await getAllProducts();

    // Group by category
    const catCounts = {};
    products.forEach(p => {
        catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    });

    const totalValue = products.reduce((s, p) => s + p.price * p.stock, 0);
    const lowStock   = products.filter(p => p.stock < 10).length;

    section.innerHTML = `
        <div class="admin-header">
            <div class="admin-title">Dashboard Stats</div>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Total Products</div>
                <div class="stat-value">${products.length}</div>
                <div class="stat-sub">Active listings</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Inventory Value</div>
                <div class="stat-value" style="font-size:1.4rem">${formatPrice(totalValue)}</div>
                <div class="stat-sub">Price × Stock</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Low Stock Alert</div>
                <div class="stat-value" style="color:var(--amber)">${lowStock}</div>
                <div class="stat-sub">Items below 10 units</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Categories</div>
                <div class="stat-value">${Object.keys(catCounts).length}</div>
                <div class="stat-sub">${Object.keys(catCounts).join(', ')}</div>
            </div>
        </div>

        <div class="admin-title" style="margin-bottom:16px">Products by Category</div>
        <div class="admin-table-wrap">
            <table class="admin-table">
                <thead><tr><th>Category</th><th>Count</th><th>% of Total</th></tr></thead>
                <tbody>
                    ${Object.entries(catCounts).map(([cat, count]) => `
                        <tr>
                            <td><span class="product-badge badge-${cat.toLowerCase()}" style="position:static">${cat}</span></td>
                            <td>${count} products</td>
                            <td>${Math.round(count / products.length * 100)}%</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>`;
}

// ── MODAL OPEN / CLOSE ─────────────────────────────────
function openModal(product = null) {
    document.getElementById('productModal').style.display = 'flex';
    document.getElementById('modalTitle').textContent =
        product ? 'Edit Product' : 'Add New Product';
    document.getElementById('editProductId').value = product?.id || '';
    document.getElementById('pName').value        = product?.name || '';
    document.getElementById('pCategory').value    = product?.category || '';
    document.getElementById('pPrice').value       = product?.price || '';
    document.getElementById('pStock').value       = product?.stock || '';
    document.getElementById('pDescription').value = product?.description || '';
    document.getElementById('pImageUrl').value    = product?.imageUrl || '';
    hideModalAlert();
    // Switch sidebar to 'add' only if no product
    if (!product) showSection('add');
}

function openEditModal(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (product) openModal(product);
}

function closeModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Close modal on overlay click
document.getElementById('productModal')?.addEventListener('click', function(e) {
    if (e.target === this) closeModal();
});

// ── SAVE PRODUCT ───────────────────────────────────────
async function saveProduct() {
    const id          = document.getElementById('editProductId').value;
    const name        = document.getElementById('pName').value.trim();
    const category    = document.getElementById('pCategory').value;
    const price       = parseFloat(document.getElementById('pPrice').value);
    const stock       = parseInt(document.getElementById('pStock').value);
    const description = document.getElementById('pDescription').value.trim();
    const imageUrl    = document.getElementById('pImageUrl').value.trim();

    if (!name || !category || !price || isNaN(stock)) {
        showModalAlert('Please fill in all required fields', 'error');
        return;
    }

    const data = { name, category, price, stock, description, imageUrl, active: true };
    const btn  = document.querySelector('#productModal .btn-primary');
    btn.disabled = true; btn.textContent = '⏳ Saving...';

    try {
        if (id) {
            await updateProduct(id, data);
            showToast('Product updated! ✅');
        } else {
            await addProduct(data);
            showToast('Product added! ✅');
        }
        closeModal();
        loadProductsTable();
    } catch (err) {
        showModalAlert('Failed to save product. Try again.', 'error');
    } finally {
        btn.disabled = false; btn.textContent = '💾 Save Product';
    }
}

// ── DELETE PRODUCT ─────────────────────────────────────
async function handleDelete(id, name) {
    if (!confirm(`Delete "${name}"?\n\nThis will hide it from the store.`)) return;
    try {
        await deleteProduct(id);
        showToast(`"${name}" deleted`);
        loadProductsTable();
    } catch (err) {
        showToast('Could not delete product', 'error');
    }
}

// ── MODAL ALERT ────────────────────────────────────────
function showModalAlert(msg, type) {
    const el = document.getElementById('modalAlert');
    el.style.display = 'flex';
    el.className = `alert alert-${type}`;
    el.textContent = msg;
}
function hideModalAlert() {
    document.getElementById('modalAlert').style.display = 'none';
}
