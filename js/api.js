// ════════════════════════════════════════════════════════
//  api.js — All backend API calls live here
//  Every other JS file imports functions from this file
//  If you change port or URL, change it here ONLY
// ════════════════════════════════════════════════════════

const BASE_URL = 'http://localhost:8080';

// ── PRODUCT APIs ──────────────────────────────────────

async function getAllProducts(category = '') {
    const url = category
        ? `${BASE_URL}/api/products?category=${encodeURIComponent(category)}`
        : `${BASE_URL}/api/products`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load products');
    return res.json();
}

async function searchProducts(keyword) {
    const res = await fetch(
        `${BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) throw new Error('Search failed');
    return res.json();
}

async function getProductById(id) {
    const res = await fetch(`${BASE_URL}/api/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
}

async function getRecommendations(productId) {
    const res = await fetch(
        `${BASE_URL}/api/products/${productId}/recommendations`
    );
    if (!res.ok) return [];
    return res.json();
}

async function addProduct(data) {
    const res = await fetch(`${BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to add product');
    return res.json();
}

async function updateProduct(id, data) {
    const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
}

async function deleteProduct(id) {
    const res = await fetch(`${BASE_URL}/api/products/${id}`, {
        method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete product');
    return res.text();
}

// ── USER APIs ─────────────────────────────────────────

async function registerUser(data) {
    const res = await fetch(`${BASE_URL}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    return { status: res.status, data: await res.json() };
}

// ── Replace this function in js/api.js ──

async function loginUser(email, password) {
    try {
        const res = await fetch(`${BASE_URL}/api/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        // Try to read as text first — safer than direct .json()
        const text = await res.text();

        // Try to parse as JSON — if it fails use the raw text
        let data;
        try {
            data = JSON.parse(text);
        } catch {
            data = text;
        }

        return { status: res.status, data: data };

    } catch (err) {
        // err.message tells us exactly what went wrong
        console.error('Login fetch error:', err.message);
        return {
            status: 0,
            data: 'Cannot connect to server. Is Spring Boot running on port 8080?'
        };
    }
}
// ── CART APIs ─────────────────────────────────────────

async function getCart(userId) {
    const res = await fetch(`${BASE_URL}/api/cart/${userId}`);
    if (!res.ok) return [];
    return res.json();
}

async function addToCart(userId, productId, quantity = 1) {
    const res = await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId, quantity })
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    return res.json();
}

async function removeFromCart(cartItemId) {
    const res = await fetch(`${BASE_URL}/api/cart/${cartItemId}`, {
        method: 'DELETE'
    });
    return res.text();
}

async function clearCart(userId) {
    const res = await fetch(`${BASE_URL}/api/cart/clear/${userId}`, {
        method: 'DELETE'
    });
    return res.text();
}

// ── ORDER APIs ────────────────────────────────────────

async function placeOrder(userId) {
    const res = await fetch(`${BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to place order');
    return res.json();
}

async function getOrders(userId) {
    const res = await fetch(`${BASE_URL}/api/orders/${userId}`);
    if (!res.ok) return [];
    return res.json();
}

// ── SESSION HELPERS ───────────────────────────────────

function saveUser(user) {
    localStorage.setItem('smartshop_user', JSON.stringify(user));
}

function getUser() {
    const u = localStorage.getItem('smartshop_user');
    return u ? JSON.parse(u) : null;
}

function logoutUser() {
    localStorage.removeItem('smartshop_user');
    window.location.href = 'login.html';
}

function requireLogin() {
    const user = getUser();
    if (!user) window.location.href = 'login.html';
    return user;
}

function isAdmin() {
    const user = getUser();
    return user && user.role === 'ADMIN';
}

// ── SHARED UI HELPERS ─────────────────────────────────

// Format price as Indian Rupees  e.g. ₹74,999
function formatPrice(price) {
    return '₹' + Number(price).toLocaleString('en-IN');
}

// Show floating toast notification
function showToast(message, type = 'success') {
    document.querySelectorAll('.ss-toast').forEach(t => t.remove());
    const toast = document.createElement('div');
    toast.className = 'ss-toast';
    toast.style.cssText = `
        position:fixed; bottom:28px; right:28px; z-index:9999;
        padding:14px 22px; border-radius:10px; font-size:.92rem;
        font-weight:600; max-width:320px;
        background:${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color:#fff; box-shadow:0 8px 24px rgba(0,0,0,.4);
        animation: slideIn .3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.style.opacity = '0', 2200);
    setTimeout(() => toast.remove(), 2500);
}

// Build the navbar HTML — same across all pages
// ── Replace buildNavbar function in js/api.js ──

function buildNavbar(activePage = '') {
    const user = getUser();

    const admin = user && (
        user.role === 'ADMIN'      ||
        user.role === 'ROLE_ADMIN' ||
        (user.role && user.role.toUpperCase().includes('ADMIN'))
    );

    return `
    <nav class="navbar">
        <a href="index.html" class="navbar-brand">
            ⚡ Smart<span>Shop</span>
        </a>

        <div class="nav-center">
            <a href="index.html"
               class="${activePage === 'home' ? 'active' : ''}">
               Home
            </a>
            <a href="index.html?cat=Mobile">📱 Mobile</a>
            <a href="index.html?cat=Laptop">💻 Laptop</a>
            <a href="index.html?cat=Audio">🎧 Audio</a>
            <a href="index.html?cat=Wearables">⌚ Wearables</a>
            <a href="index.html?cat=Accessories">🔌 Accessories</a>
        </div>

        <div class="nav-right">
            <a href="cart.html"
               class="nav-icon-btn ${activePage === 'cart' ? 'active' : ''}">
                🛒 Cart
                <span class="cart-badge" id="cartBadge">0</span>
            </a>

            ${user ? `

                ${admin ? `
                    <a href="admin.html" class="nav-icon-btn admin-btn">
                        ⚙️ Admin
                    </a>
                ` : ''}

                <!-- Profile button — click toggles dropdown -->
                <div class="nav-user" id="navUserMenu">
                    <button class="nav-user-btn" id="navUserBtn"
                            onclick="toggleUserMenu(event)">
                        <span class="nav-user-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </span>
                        <span class="nav-user-name">
                            ${user.name.split(' ')[0]}
                        </span>
                        <span class="nav-user-arrow" id="navUserArrow">
                            ▾
                        </span>
                    </button>

                    <!-- Dropdown — hidden by default -->
                    <div class="nav-dropdown" id="navDropdown">
                        <div class="nav-dropdown-header">
                            <div class="nav-dropdown-name">
                                ${user.name}
                            </div>
                            <div class="nav-dropdown-email">
                                ${user.email}
                            </div>
                        </div>
                        <div class="nav-dropdown-divider"></div>
                        <a href="orders.html" class="nav-dropdown-item"
                           onclick="closeUserMenu()">
                            📦 My Orders
                        </a>
                        ${admin ? `
                        <a href="admin.html" class="nav-dropdown-item"
                           onclick="closeUserMenu()">
                            ⚙️ Admin Panel
                        </a>
                        ` : ''}
                        <div class="nav-dropdown-divider"></div>
                        <a href="#" class="nav-dropdown-item logout-item"
                           onclick="logoutUser()">
                            🚪 Logout
                        </a>
                    </div>
                </div>

            ` : `
                <a href="login.html"
                   class="btn-login ${activePage === 'login' ? 'active' : ''}">
                    Login
                </a>
            `}
        </div>
    </nav>`;
}

// Update cart badge count in navbar
async function refreshCartBadge() {
    const user = getUser();
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    if (!user) { badge.textContent = '0'; return; }
    try {
        const cart = await getCart(user.id);
        badge.textContent = cart.length || '0';
        badge.style.display = cart.length ? 'inline-flex' : 'none';
    } catch { badge.textContent = '0'; }
}
// ── DROPDOWN TOGGLE FUNCTIONS ──────────────────────────

// Toggle dropdown open/closed on profile button click
function toggleUserMenu(event) {
    // Stop click from bubbling to document
    // (otherwise it would immediately close the menu)
    event.stopPropagation();

    const dropdown = document.getElementById('navDropdown');
    const arrow    = document.getElementById('navUserArrow');
    const btn      = document.getElementById('navUserBtn');

    if (!dropdown) return;

    const isOpen = dropdown.classList.contains('open');

    if (isOpen) {
        closeUserMenu();
    } else {
        openUserMenu();
    }
}

function openUserMenu() {
    const dropdown = document.getElementById('navDropdown');
    const arrow    = document.getElementById('navUserArrow');
    const btn      = document.getElementById('navUserBtn');

    if (!dropdown) return;

    dropdown.classList.add('open');
    if (arrow) arrow.style.transform = 'rotate(180deg)';
    if (btn)   btn.classList.add('active');
}

function closeUserMenu() {
    const dropdown = document.getElementById('navDropdown');
    const arrow    = document.getElementById('navUserArrow');
    const btn      = document.getElementById('navUserBtn');

    if (!dropdown) return;

    dropdown.classList.remove('open');
    if (arrow) arrow.style.transform = 'rotate(0deg)';
    if (btn)   btn.classList.remove('active');
}

// Close dropdown when user clicks anywhere outside it
document.addEventListener('click', function(event) {
    const menu = document.getElementById('navUserMenu');

    // If click is outside the nav-user menu — close it
    if (menu && !menu.contains(event.target)) {
        closeUserMenu();
    }
});