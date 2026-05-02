// ── index.js — Home Page Logic ──

document.addEventListener('DOMContentLoaded', () => {
    // Inject navbar
    document.getElementById('navbar').innerHTML = buildNavbar('home');
    refreshCartBadge();

    // Check if URL has ?cat= param (from navbar links)
    const params = new URLSearchParams(location.search);
    const cat = params.get('cat') || '';

    if (cat) {
        // Activate matching tab
        document.querySelectorAll('.cat-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cat === cat);
        });
    }

    loadProducts(cat);
    setupCategoryTabs();
    setupSearch();
});

function scrollToProducts() {
    document.getElementById('productsSection')
        .scrollIntoView({ behavior: 'smooth' });
}

// ── LOAD PRODUCTS ──────────────────────────────────────
async function loadProducts(category = '', searchTerm = '') {
    const grid  = document.getElementById('productsGrid');
    const title = document.getElementById('sectionTitle');
    const count = document.getElementById('sectionCount');

    // Show loader
    grid.innerHTML = buildSkeletons(8);

    try {
        let products;
        if (searchTerm) {
            products = await searchProducts(searchTerm);
            title.textContent = `Results for "${searchTerm}"`;
        } else {
            products = await getAllProducts(category);
            title.textContent = category ? `${category} Products` : 'All Products';
        }

        count.textContent = `${products.length} products`;
        renderProducts(products, grid);

    } catch (err) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="es-icon">⚠️</div>
                <h3>Cannot connect to server</h3>
                <p>Make sure your Spring Boot backend is running on port 8080</p>
                <button class="btn btn-outline" onclick="loadProducts()">Try Again</button>
            </div>`;
    }
}

// ── RENDER PRODUCT CARDS ───────────────────────────────
function renderProducts(products, container) {
    if (!products.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <div class="es-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try a different search term or category</p>
            </div>`;
        return;
    }

    container.innerHTML = products.map((p, i) => `
        <div class="product-card" style="animation-delay:${i * 0.05}s"
             onclick="goToProduct(${p.id})">
            <div class="product-img-wrap">
                <span class="product-badge badge-${p.category.toLowerCase()}">${p.category}</span>
                <img src="${p.imageUrl}"
                     alt="${p.name}"
                     onerror="this.src='https://via.placeholder.com/220x190/1a2236/3b82f6?text=${encodeURIComponent(p.name)}'"/>
            </div>
            <div class="product-body">
                <div class="product-name">${p.name}</div>
                <div class="product-desc">${p.description || ''}</div>
                <div class="product-price">${formatPrice(p.price)}</div>
                <div class="product-stock ${p.stock < 10 ? 'low' : ''}">
                    ${p.stock > 0
                        ? (p.stock < 10 ? `⚠️ Only ${p.stock} left` : `✅ In Stock`)
                        : '❌ Out of Stock'}
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-primary"
                    onclick="handleAddToCart(event, ${p.id})"
                    ${p.stock === 0 ? 'disabled' : ''}>
                    🛒 Add to Cart
                </button>
                <button class="btn btn-icon" onclick="goToProduct(${p.id})" title="View Details">
                    👁
                </button>
            </div>
        </div>
    `).join('');
}

// ── ADD TO CART ────────────────────────────────────────
async function handleAddToCart(event, productId) {
    event.stopPropagation(); // prevent card click
    const user = getUser();
    if (!user) {
        showToast('Please login to add items to cart', 'info');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }
    try {
        await addToCart(user.id, productId, 1);
        refreshCartBadge();
        showToast('Added to cart! 🛒');
    } catch (e) {
        showToast('Could not add to cart', 'error');
    }
}

function goToProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// ── CATEGORY TABS ──────────────────────────────────────
function setupCategoryTabs() {
    document.querySelectorAll('.cat-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-tab')
                .forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadProducts(btn.dataset.cat);
        });
    });
}

// ── SEARCH ─────────────────────────────────────────────
function setupSearch() {
    const input = document.getElementById('searchInput');
    let timer;
    input.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const kw = input.value.trim();
            if (!kw) { loadProducts(); return; }
            if (kw.length < 2) return;
            // Deactivate category tabs during search
            document.querySelectorAll('.cat-tab')
                .forEach(b => b.classList.remove('active'));
            loadProducts('', kw);
        }, 380);
    });
    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') doSearch();
    });
}

function doSearch() {
    const kw = document.getElementById('searchInput').value.trim();
    if (kw) loadProducts('', kw);
}

// ── SKELETON LOADER ────────────────────────────────────
function buildSkeletons(n) {
    return Array.from({length: n}, () => `
        <div class="product-card">
            <div class="skeleton" style="height:190px"></div>
            <div class="product-body" style="gap:10px">
                <div class="skeleton" style="height:14px;border-radius:6px"></div>
                <div class="skeleton" style="height:14px;width:70%;border-radius:6px"></div>
                <div class="skeleton" style="height:18px;width:40%;border-radius:6px;margin-top:4px"></div>
            </div>
            <div class="product-actions">
                <div class="skeleton" style="height:38px;border-radius:10px;flex:1"></div>
            </div>
        </div>
    `).join('');
}
