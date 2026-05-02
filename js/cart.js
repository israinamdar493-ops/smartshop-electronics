// ── cart.js — Cart Page Logic ──

let cartData = [];

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('navbar').innerHTML = buildNavbar('cart');

    const user = getUser();
    if (!user) {
        document.getElementById('cartContent').innerHTML = `
            <div class="empty-state">
                <div class="es-icon">🔒</div>
                <h3>Please login first</h3>
                <p>You need to be logged in to view your cart</p>
                <a href="login.html" class="btn btn-primary" style="margin-top:8px">Login</a>
            </div>`;
        return;
    }

    await loadCart(user.id);
});

// ── LOAD CART ──────────────────────────────────────────
async function loadCart(userId) {
    const content = document.getElementById('cartContent');
    content.innerHTML = `<div class="page-loader"><div class="spinner"></div><span>Loading cart...</span></div>`;

    try {
        cartData = await getCart(userId);
        renderCart();
        refreshCartBadge();
    } catch (err) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">⚠️</div>
                <h3>Could not load cart</h3>
                <button class="btn btn-outline" onclick="location.reload()">Retry</button>
            </div>`;
    }
}

// ── RENDER CART ────────────────────────────────────────
function renderCart() {
    const content = document.getElementById('cartContent');
    const user = getUser();

    if (!cartData.length) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Browse our electronics and add items to your cart</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:8px">Shop Now</a>
            </div>`;
        return;
    }

    // Calculate totals
    const subtotal = cartData.reduce(
        (sum, item) => sum + (item.product.price * item.quantity), 0
    );
    const shipping = subtotal >= 5000 ? 0 : 99;
    const total = subtotal + shipping;

    content.innerHTML = `
        <div class="cart-layout">
            <!-- Cart Items -->
            <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                    <span style="color:var(--text-s);font-size:.9rem">${cartData.length} item(s)</span>
                    <button class="btn btn-outline" style="font-size:.82rem;padding:6px 14px"
                        onclick="handleClearCart()">
                        🗑 Clear Cart
                    </button>
                </div>
                <div class="cart-list" id="cartList">
                    ${cartData.map(item => buildCartItem(item)).join('')}
                </div>
            </div>

            <!-- Summary -->
            <div>
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    <div class="sum-row">
                        <span>Subtotal (${cartData.length} items)</span>
                        <span>${formatPrice(subtotal)}</span>
                    </div>
                    <div class="sum-row">
                        <span>Shipping</span>
                        <span>${shipping === 0
                            ? '<span style="color:var(--green)">FREE</span>'
                            : formatPrice(shipping)}</span>
                    </div>
                    ${shipping > 0 ? `
                    <div style="font-size:.78rem;color:var(--text-s);
                                background:var(--surface2);padding:8px 12px;
                                border-radius:8px;margin-bottom:4px">
                        💡 Add ${formatPrice(5000 - subtotal)} more for free shipping
                    </div>` : ''}
                    <div class="sum-row total">
                        <span>Total</span>
                        <span>${formatPrice(total)}</span>
                    </div>
                    <button class="btn btn-success btn-full btn-lg"
                            onclick="handlePlaceOrder()">
                        ✅ Place Order
                    </button>
                    <a href="index.html" class="btn btn-outline btn-full"
                       style="margin-top:10px;justify-content:center">
                        ← Continue Shopping
                    </a>

                    <!-- Trust signals -->
                    <div style="margin-top:20px;padding-top:16px;
                                border-top:1px solid var(--border);
                                display:flex;flex-direction:column;gap:8px">
                        <div style="font-size:.8rem;color:var(--text-s);display:flex;gap:8px">
                            🔒 <span>Secure Checkout</span>
                        </div>
                        <div style="font-size:.8rem;color:var(--text-s);display:flex;gap:8px">
                            🔄 <span>Easy Returns within 7 days</span>
                        </div>
                        <div style="font-size:.8rem;color:var(--text-s);display:flex;gap:8px">
                            📦 <span>Fast Delivery across India</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}

// ── BUILD CART ITEM HTML ───────────────────────────────
function buildCartItem(item) {
    const p = item.product;
    const lineTotal = p.price * item.quantity;
    return `
        <div class="cart-item" id="ci-${item.id}">
            <img class="cart-item-img"
                 src="${p.imageUrl}"
                 alt="${p.name}"
                 onclick="window.location.href='product.html?id=${p.id}'"
                 style="cursor:pointer"
                 onerror="this.src='https://via.placeholder.com/80x80/1a2236/3b82f6?text=IMG'"/>
            <div class="cart-item-info">
                <div class="cart-item-name"
                     onclick="window.location.href='product.html?id=${p.id}'"
                     style="cursor:pointer">${p.name}</div>
                <div class="cart-item-cat">${p.category}</div>
                <div class="cart-item-price">${formatPrice(lineTotal)}</div>
                <div style="font-size:.78rem;color:var(--text-s)">
                    ${formatPrice(p.price)} each
                </div>
            </div>
            <div class="qty-ctrl">
                <button class="qty-btn"
                    onclick="handleQtyChange(${item.id}, ${item.quantity}, -1)">−</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn"
                    onclick="handleQtyChange(${item.id}, ${item.quantity}, 1)">+</button>
            </div>
            <button class="remove-btn"
                    onclick="handleRemoveItem(${item.id})" title="Remove">
                🗑
            </button>
        </div>`;
}

// ── QTY CHANGE ────────────────────────────────────────
async function handleQtyChange(cartItemId, currentQty, delta) {
    const newQty = currentQty + delta;
    const user = getUser();

    if (newQty <= 0) {
        await handleRemoveItem(cartItemId);
        return;
    }

    try {
        // Remove and re-add with new quantity
        await removeFromCart(cartItemId);
        // Find the product id from cartData
        const item = cartData.find(i => i.id === cartItemId);
        if (item) {
            await addToCart(user.id, item.product.id, newQty);
        }
        await loadCart(user.id);
    } catch (e) {
        showToast('Could not update quantity', 'error');
    }
}

// ── REMOVE ITEM ────────────────────────────────────────
async function handleRemoveItem(cartItemId) {
    const user = getUser();
    try {
        await removeFromCart(cartItemId);
        showToast('Item removed');
        await loadCart(user.id);
    } catch (e) {
        showToast('Could not remove item', 'error');
    }
}

// ── CLEAR CART ─────────────────────────────────────────
async function handleClearCart() {
    if (!confirm('Clear all items from cart?')) return;
    const user = getUser();
    try {
        await clearCart(user.id);
        showToast('Cart cleared');
        await loadCart(user.id);
    } catch (e) {
        showToast('Could not clear cart', 'error');
    }
}

// ── PLACE ORDER ────────────────────────────────────────
async function handlePlaceOrder() {
    const user = getUser();
    try {
        const btn = document.querySelector('.btn-success');
        btn.disabled = true;
        btn.textContent = '⏳ Placing order...';

        const order = await placeOrder(user.id);

        showToast('Order placed successfully! 🎉');
        setTimeout(() => {
            window.location.href = `orders.html`;
        }, 1500);

    } catch (e) {
        showToast(e.message || 'Could not place order', 'error');
        const btn = document.querySelector('.btn-success');
        if (btn) { btn.disabled = false; btn.textContent = '✅ Place Order'; }
    }
}
