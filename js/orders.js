// ── orders.js — Order History Page ──

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('navbar').innerHTML = buildNavbar();
    refreshCartBadge();

    const user = requireLogin();
    if (!user) return;

    const content = document.getElementById('ordersContent');
    content.innerHTML = `<div class="page-loader"><div class="spinner"></div><span>Loading orders...</span></div>`;

    try {
        const orders = await getOrders(user.id);
        renderOrders(orders, content);
    } catch (err) {
        content.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">⚠️</div>
                <h3>Could not load orders</h3>
                <button class="btn btn-outline" onclick="location.reload()">Retry</button>
            </div>`;
    }
});

function renderOrders(orders, container) {
    if (!orders.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="es-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Place your first order and it will appear here</p>
                <a href="index.html" class="btn btn-primary" style="margin-top:8px">Shop Now</a>
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="orders-wrap">
            <div style="color:var(--text-s);font-size:.9rem;margin-bottom:20px">
                ${orders.length} order(s) found
            </div>
            ${orders.map(order => buildOrderCard(order)).join('')}
        </div>`;
}

function buildOrderCard(order) {
    const date = new Date(order.createdAt).toLocaleDateString('en-IN', {
        day:'numeric', month:'long', year:'numeric',
        hour:'2-digit', minute:'2-digit'
    });
    return `
        <div class="order-card">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id}</div>
                    <div class="order-date">${date}</div>
                </div>
                <span class="order-status">${order.status}</span>
            </div>
            <div class="order-items-list">
                ${(order.items || []).map(item => `
                    <div class="order-item-row">
                        <div class="order-item-name">
                            ${item.product?.name || 'Product'}
                            <span style="color:var(--text-s)"> × ${item.quantity}</span>
                        </div>
                        <div class="order-item-total">
                            ${formatPrice((item.priceAtOrder || 0) * item.quantity)}
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="order-footer">
                <span class="order-total-label">Total Paid:</span>
                <span class="order-total-amount">${formatPrice(order.totalAmount)}</span>
            </div>
        </div>`;
}
