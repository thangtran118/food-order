// Counter for unique food IDs
let foodCounter = 0;

// Initialize form with one restaurant and a default food item
window.addEventListener('DOMContentLoaded', function() {
    addFoodItem();
});

// Add new food item
function addFoodItem() {
    foodCounter++;
    const foodId = `food-${foodCounter}`;

    const foodContainer = document.getElementById('food-items-container');

    const foodItem = document.createElement('div');
    foodItem.className = 'food-item';
    foodItem.dataset.foodId = foodId;

    foodItem.innerHTML = `
        <div class="food-item-header">
            <span class="food-item-title">🍽️ Món ${foodCounter}</span>
            <button type="button" class="remove-food-btn" onclick="removeFoodItem('${foodId}')">
                Xóa 🗑️
            </button>
        </div>
        
        <div class="form-group">
            <label>
                <span class="emoji">🍕</span>
                Tên món ăn
            </label>
            <input type="text" 
                   name="${foodId}-name" 
                   placeholder="Ví dụ: Phở bò, Bún chả, Trà sữa...">
        </div>
        
        <div class="form-group">
            <label>
                <span class="emoji">💬</span>
                Note cho món
            </label>
            <input type="text" 
                   name="${foodId}-note" 
                   placeholder="Ví dụ: ít đường, thêm topping, không hành...">
        </div>
    `;
    
    foodContainer.appendChild(foodItem);
    foodItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateRemoveButtons();
}

// Remove food item
function removeFoodItem(foodId) {
    const foodItem = document.querySelector(`.food-item[data-food-id="${foodId}"]`);
    if (foodItem) {
        foodItem.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            foodItem.remove();
            updateRemoveButtons();
        }, 300);
    }
}

function updateRemoveButtons() {
    const foodItems = document.querySelectorAll('.food-item');
    const shouldShowRemove = foodItems.length > 1;

    foodItems.forEach(item => {
        const removeBtn = item.querySelector('.remove-food-btn');
        if (!removeBtn) return;

        if (shouldShowRemove) {
            removeBtn.classList.remove('hidden');
            removeBtn.setAttribute('aria-hidden', 'false');
        } else {
            removeBtn.classList.add('hidden');
            removeBtn.setAttribute('aria-hidden', 'true');
        }
    });
}

// Add slide out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100px);
        }
    }
`;
document.head.appendChild(style);

// Handle form submission
document.getElementById('foodOrderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const foods = [];

    document.querySelectorAll('.food-item').forEach(foodElement => {
        const foodId = foodElement.dataset.foodId;
        const foodName = formData.get(`${foodId}-name`);
        const foodNote = formData.get(`${foodId}-note`);

        if (foodName) {
            foods.push({
                name: foodName,
                note: foodNote || ''
            });
        }
    });

    const orderData = {
        restaurant: {
            link: formData.get('restaurant-link') || '',
            note: formData.get('restaurant-note') || '',
            foods
        }
    };
    
    // Log the order data
    console.log('=== 🎀 ĐƠN HÀNG CỦA BẠN 🎀 ===');
    console.log(JSON.stringify(orderData, null, 2));
    console.log('=== 💕 CẢM ƠN BẠN 💕 ===');
    
    // Show cute alert
    alert('✨ Đơn hàng đã được gửi! Kiểm tra console để xem chi tiết nhé! 🐶💕');
});

