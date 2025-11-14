// Global variables
let allOrders = [];
let filteredOrders = [];

// Load orders when page loads
window.addEventListener('DOMContentLoaded', async function() {
    await loadOrders();
});

// Function to load and display orders
async function loadOrders() {
    const loading = document.getElementById('ordersLoading');
    const empty = document.getElementById('ordersEmpty');
    const tableContainer = document.getElementById('ordersTableContainer');

    // Show loading
    loading.style.display = 'block';
    empty.style.display = 'none';
    tableContainer.style.display = 'none';

    try {
        // Fetch orders from Supabase
        const result = await getAllOrders();

        if (result.success && result.data && result.data.length > 0) {
            allOrders = result.data;
            filteredOrders = [...allOrders];
            
            // Update statistics
            updateStatistics();
            
            // Apply default sorting (newest first)
            applySorting();
            
            // Hide loading, show table
            loading.style.display = 'none';
            tableContainer.style.display = 'block';
        } else {
            // No orders found
            loading.style.display = 'none';
            empty.style.display = 'block';
            allOrders = [];
            filteredOrders = [];
            updateStatistics();
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        loading.style.display = 'none';
        empty.style.display = 'block';
        allOrders = [];
        filteredOrders = [];
        updateStatistics();
    }
}

// Function to update statistics
function updateStatistics() {
    const totalOrders = allOrders.length;
    
    // Calculate today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
    }).length;
    
    // Calculate total items
    const totalItems = allOrders.reduce((sum, order) => {
        return sum + (order.order_items ? order.order_items.length : 0);
    }, 0);
    
    // Update UI
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('todayOrders').textContent = todayOrders;
    document.getElementById('totalItems').textContent = totalItems;
}

// Function to apply date filter
function applyDateFilter() {
    const dateFrom = document.getElementById('filterDateFrom').value;
    const dateTo = document.getElementById('filterDateTo').value;
    
    if (!dateFrom && !dateTo) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(order => {
            const orderDate = new Date(order.created_at);
            orderDate.setHours(0, 0, 0, 0);
            
            if (dateFrom && dateTo) {
                const fromDate = new Date(dateFrom);
                const toDate = new Date(dateTo);
                return orderDate >= fromDate && orderDate <= toDate;
            } else if (dateFrom) {
                const fromDate = new Date(dateFrom);
                return orderDate >= fromDate;
            } else if (dateTo) {
                const toDate = new Date(dateTo);
                return orderDate <= toDate;
            }
            return true;
        });
    }
    
    applySorting();
}

// Function to clear date filter
function clearDateFilter() {
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    filteredOrders = [...allOrders];
    applySorting();
}

// Function to apply sorting
function applySorting() {
    const sortValue = document.getElementById('sortSelect').value;
    
    switch(sortValue) {
        case 'newest':
            filteredOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredOrders.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'most-items':
            filteredOrders.sort((a, b) => {
                const aItems = a.order_items ? a.order_items.length : 0;
                const bItems = b.order_items ? b.order_items.length : 0;
                return bItems - aItems;
            });
            break;
        case 'least-items':
            filteredOrders.sort((a, b) => {
                const aItems = a.order_items ? a.order_items.length : 0;
                const bItems = b.order_items ? b.order_items.length : 0;
                return aItems - bItems;
            });
            break;
    }
    
    renderOrders();
}

// Function to render orders
function renderOrders() {
    const tableContainer = document.getElementById('ordersTableContainer');
    const tableBody = document.getElementById('ordersTableBody');
    const empty = document.getElementById('ordersEmpty');
    
    if (filteredOrders.length === 0) {
        tableContainer.style.display = 'none';
        empty.style.display = 'block';
        return;
    }
    
    tableContainer.style.display = 'block';
    empty.style.display = 'none';
    tableBody.innerHTML = '';
    
    filteredOrders.forEach((order, index) => {
        const orderRow = createOrderRow(order, index + 1);
        tableBody.appendChild(orderRow);
    });
}

// Function to create order row
function createOrderRow(order, orderNumber) {
    const row = document.createElement('tr');
    
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
        foodsHTML = `
            <div class="food-items-list">
                ${order.order_items.map(item => `
                    <div class="food-item">
                        <div class="food-name">${escapeHtml(item.food_name)}</div>
                        ${item.food_note ? `<div class="food-note">${escapeHtml(item.food_note)}</div>` : ''}
                    </div>
                `).join('')}
            </div>
            <div style="margin-top: 8px;">
                <span class="items-count-badge">${order.order_items.length} món</span>
            </div>
        `;
    } else {
        foodsHTML = '<span class="no-data">Không có món</span>';
    }
    
    // Create restaurant link HTML
    const linkHTML = order.restaurant_link 
        ? `<a href="${escapeHtml(order.restaurant_link)}" target="_blank">${escapeHtml(truncateUrl(order.restaurant_link, 30))}</a>`
        : '<span class="no-data">-</span>';
    
    // Create note HTML
    const noteHTML = order.restaurant_note 
        ? escapeHtml(order.restaurant_note)
        : '<span class="no-data">-</span>';
    
    row.innerHTML = `
        <td class="order-number-cell">#${orderNumber}</td>
        <td class="order-date-cell">${formattedDate}</td>
        <td class="order-link-cell">${linkHTML}</td>
        <td class="order-note-cell">${noteHTML}</td>
        <td class="order-foods-cell">${foodsHTML}</td>
    `;
    
    return row;
}

// Function to truncate URL for display
function truncateUrl(url, maxLength = 35) {
    if (url.length > maxLength) {
        return url.substring(0, maxLength) + '...';
    }
    return url;
}

// Function to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh button functionality
function refreshOrders() {
    // Clear filters
    document.getElementById('filterDateFrom').value = '';
    document.getElementById('filterDateTo').value = '';
    document.getElementById('sortSelect').value = 'newest';
    
    // Reload orders
    loadOrders();
}
