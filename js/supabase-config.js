// Supabase Configuration
const SUPABASE_URL = 'https://gspzrqmgqlwirvosnqak.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzcHpycW1ncWx3aXJ2b3NucWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjcxODksImV4cCI6MjA3ODYwMzE4OX0.it9LjAZdsMFpXuVuH4S2ejC2mx9ztTTpgcV5W4XnBj8';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to save order to Supabase
async function saveOrderToSupabase(orderData) {
    try {
        // 1. Insert order vào bảng orders
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert([
                {
                    restaurant_link: orderData.restaurant.link,
                    restaurant_note: orderData.restaurant.note
                }
            ])
            .select()
            .single();

        if (orderError) {
            throw orderError;
        }

        console.log('✅ Order created:', order);

        // 2. Insert các món ăn vào bảng order_items
        if (orderData.restaurant.foods.length > 0) {
            const orderItems = orderData.restaurant.foods.map(food => ({
                order_id: order.id,
                food_name: food.name,
                food_note: food.note
            }));

            const { data: items, error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems)
                .select();

            if (itemsError) {
                throw itemsError;
            }

            console.log('✅ Order items created:', items);
        }

        return { success: true, order };

    } catch (error) {
        console.error('❌ Error saving order:', error);
        return { success: false, error };
    }
}

// Function to get all orders
async function getAllOrders() {
    try {
        const { data, error } = await supabase
            .from('orders')
            .select(`
                *,
                order_items (
                    id,
                    food_name,
                    food_note
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        return { success: false, error };
    }
}

