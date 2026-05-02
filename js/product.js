// ── product.js — Product Detail Page ──

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('navbar').innerHTML = buildNavbar();
    refreshCartBadge();

    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    if (!id) {
        window.location.href = 'index.html';
        return;
    }

    const content = document.getElementById('pageContent');
    content.innerHTML = `<div class="page-loader"><div class="spinner"></div><span>Loading product...</span></div>`;

    try {
        const [product, recommendations] = await Promise.all([
            getProductById(id),
            getRecommendations(id)
        ]);
        renderProduct(product, content);
        if (recommendations.length > 0) {
            renderRecommendations(recommendations, content);
        }
    } catch (err) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">⚠️</div>
                <h3>Product not found</h3>
                <p>This product may no longer be available</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:8px">Back to Home</a>
            </div>`;
    }
});

// ── RENDER PRODUCT DETAIL ──────────────────────────────
function renderProduct(p, container) {
    container.innerHTML = `
        <div class="page-header">
            <div class="breadcrumb">
                <a href="index.html">Home</a>
                <span>›</span>
                <a href="index.html?cat=${p.category}">${p.category}</a>
                <span>›</span>
                <span style="color:var(--text-m)">${p.name}</span>
            </div>
        </div>

        <div class="detail-layout">
            <!-- Image -->
            <div>
                <div class="detail-img-wrap">
                    <img src="${p.imageUrl}"
                         alt="${p.name}"
                         onerror="this.src='https://via.placeholder.com/400x300/1a2236/3b82f6?text=${encodeURIComponent(p.name)}'"/>
                </div>
            </div>

            <!-- Info -->
            <div class="detail-info">
                <div>
                    <div class="detail-category">${p.category}</div>
                    <h1 class="detail-name">${p.name}</h1>
                </div>

                <div class="detail-price">${formatPrice(p.price)}</div>

                <p class="detail-desc">${p.description || 'No description available.'}</p>

                <div class="detail-stock">
                    ${p.stock > 10
                        ? `<span style="color:var(--green)">✅ In Stock</span> — ${p.stock} units available`
                        : p.stock > 0
                            ? `<span style="color:var(--amber)">⚠️ Only ${p.stock} left!</span>`
                            : `<span style="color:var(--red)">❌ Out of Stock</span>`
                    }
                </div>

                <!-- Quantity selector -->
                <div style="display:flex;align-items:center;gap:12px;margin-top:4px">
                    <span style="color:var(--text-s);font-size:.88rem">Quantity:</span>
                    <div class="qty-ctrl">
                        <button class="qty-btn" onclick="changeQty(-1)">−</button>
                        <span class="qty-num" id="qtyDisplay">1</span>
                        <button class="qty-btn" onclick="changeQty(1)">+</button>
                    </div>
                </div>

                <div class="detail-actions">
                    <button class="btn btn-primary btn-lg"
                        onclick="handleAddToCart(${p.id})"
                        ${p.stock === 0 ? 'disabled' : ''}>
                        🛒 Add to Cart
                    </button>
                    <a href="index.html" class="btn btn-outline btn-lg">← Continue Shopping</a>
                </div>

                <!-- Product info pills -->
                <div style="display:flex;flex-wrap:wrap;gap:8px;padding-top:8px;border-top:1px solid var(--border)">
                    <span style="font-size:.8rem;color:var(--text-s);background:var(--surface2);padding:5px 12px;border-radius:20px">
                        🏷 Product ID: ${p.id}
                    </span>
                    <span style="font-size:.8rem;color:var(--text-s);background:var(--surface2);padding:5px 12px;border-radius:20px">
                        📦 Category: ${p.category}
                    </span>
                    <span style="font-size:.8rem;color:var(--text-s);background:var(--surface2);padding:5px 12px;border-radius:20px">
                        ⚡ Free Delivery
                    </span>
                </div>
            </div>
        </div>`;

    // Set product id on page for add-to-cart
    window._currentProductId = p.id;
    window._maxStock = p.stock;
    window._currentQty = 1;
}

// ── QUANTITY CONTROL ───────────────────────────────────
window.changeQty = function(delta) {
    const max = window._maxStock || 1;
    window._currentQty = Math.max(1, Math.min(max,
        (window._currentQty || 1) + delta));
    document.getElementById('qtyDisplay').textContent = window._currentQty;
};

// ── ADD TO CART ────────────────────────────────────────
window.handleAddToCart = async function(productId) {
    const user = getUser();
    if (!user) {
        showToast('Please login first', 'info');
        setTimeout(() => window.location.href = 'login.html', 1200);
        return;
    }
    try {
        const qty = window._currentQty || 1;
        await addToCart(user.id, productId, qty);
        refreshCartBadge();
        showToast(`Added ${qty} item(s) to cart! 🛒`);
    } catch (e) {
        showToast('Could not add to cart', 'error');
    }
};

// ── AI RECOMMENDATIONS ────────────────────────────────
function renderRecommendations(products, container) {
    const section = document.createElement('div');
    section.className = 'recommendations';
    section.innerHTML = `
        <div class="rec-title">
            🤖 AI Recommended — Similar Products
        </div>
        <div class="rec-grid">
            ${products.slice(0, 4).map(p => `
                <div class="product-card"
                     onclick="window.location.href='product.html?id=${p.id}'">
                    <div class="product-img-wrap" style="height:150px">
                        <img src="${p.imageUrl}" alt="${p.name}"
                             onerror="this.src='https://via.placeholder.com/200x150/1a2236/3b82f6?text=${encodeURIComponent(p.name)}'"/>
                    </div>
                    <div class="product-body">
                        <div class="product-name">${p.name}</div>
                        <div class="product-price">${formatPrice(p.price)}</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary"
                            onclick="event.stopPropagation();
                                     handleAddToCart(${p.id})">
                            🛒 Add
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>`;
    container.appendChild(section);
}
