// Load orders when page loads
window.addEventListener('DOMContentLoaded', async function() {
    await loadOrders();
});

// Function to load and display orders
async function loadOrders() {
    const loading = document.getElementById('ordersLoading');
    const empty = document.getElementById('ordersEmpty');
    const list = document.getElementById('ordersList');

    // Show loading
    loading.style.display = 'block';
    empty.style.display = 'none';
    list.style.display = 'none';

    try {
        // Fetch orders from Supabase
        const result = await getAllOrders();

        if (result.success && result.data && result.data.length > 0) {
            // Hide loading, show list
            loading.style.display = 'none';
            list.style.display = 'block';

            // Render orders
            renderOrders(result.data);
        } else {
            // No orders found
            loading.style.display = 'none';
            empty.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        loading.style.display = 'none';
        empty.style.display = 'block';
    }
}

// Function to render orders
function renderOrders(orders) {
    const list = document.getElementById('ordersList');
    list.innerHTML = '';

    orders.forEach((order, index) => {
        const orderCard = createOrderCard(order, index + 1);
        list.appendChild(orderCard);
    });
}

// Function to create order card
function createOrderCard(order, orderNumber) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.animationDelay = `${orderNumber * 0.1}s`;

    // Format date
    const date = new Date(order.created_at);
    const formattedDate = date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Create foods list HTML
    let foodsHTML = '';
    if (order.order_items && order.order_items.length > 0) {
        foodsHTML = order.order_items.map(item => `
            <div class="food-item-view">
                <div class="food-name">🍽️ ${escapeHtml(item.food_name)}</div>
                ${item.food_note ? `<div class="food-note">💬 ${escapeHtml(item.food_note)}</div>` : ''}
            </div>
        `).join('');
    } else {
        foodsHTML = '<div class="no-items">Không có món nào</div>';
    }

    card.innerHTML = `
        <div class="order-card-header">
            <div class="order-number">Đơn hàng #${orderNumber}</div>
            <div class="order-date">🕐 ${formattedDate}</div>
        </div>

        ${order.restaurant_link ? `
            <div class="order-restaurant-link">
                <div class="order-label">🔗 Link quán:</div>
                <a href="${escapeHtml(order.restaurant_link)}" target="_blank" class="restaurant-link">
                    ${escapeHtml(order.restaurant_link)}
                </a>
            </div>
        ` : ''}

        ${order.restaurant_note ? `
            <div class="order-restaurant-note">
                <div class="order-label">📝 Note cho quán:</div>
                <div class="restaurant-note">${escapeHtml(order.restaurant_note)}</div>
            </div>
        ` : ''}

        <div class="order-foods">
            <div class="order-label">🍜 Món ăn:</div>
            <div class="order-foods-list">
                ${foodsHTML}
            </div>
        </div>

        <div class="order-id">ID: ${order.id.substring(0, 8)}...</div>
    `;

    return card;
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh button functionality
function refreshOrders() {
    loadOrders();
}

