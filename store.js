const API_URL = "http://localhost:3000/api";

const ApiService = {
    async getProducts() {
        try {
            const res = await fetch(`${API_URL}/products`);
            return await res.json();
        } catch (e) {
            console.error("خطأ في جلب المنتجات:", e);
            return [];
        }
    },
    async addProduct(productData) {
        const res = await fetch(`${API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        return await res.json();
    },
    async deleteProduct(id) {
        await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    },
    async createOrder(orderData) {
        const res = await fetch(`${API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        return await res.json();
    },
    async getOrders() {
        const res = await fetch(`${API_URL}/orders`);
        return await res.json();
    },
    async confirmOrder(id) {
        const res = await fetch(`${API_URL}/orders/${id}/confirm`, { method: 'PUT' });
        return await res.json();
    }
};
