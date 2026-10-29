// نظام إدارة بيانات المتجر والمخزون والطلبات (store.js)

const StoreManager = {
    // جلب المنتجات
    getProducts() {
        return JSON.parse(localStorage.getItem('elgant_products')) || [];
    },
    saveProducts(products) {
        localStorage.setItem('elgant_products', JSON.stringify(products));
    },

    // جلب السلة
    getCart() {
        return JSON.parse(localStorage.getItem('elgant_cart')) || [];
    },
    saveCart(cart) {
        localStorage.setItem('elgant_cart', JSON.stringify(cart));
    },

    // جلب الطلبات والفواتير
    getOrders() {
        return JSON.parse(localStorage.getItem('elgant_orders')) || [];
    },
    saveOrders(orders) {
        localStorage.setItem('elgant_orders', JSON.stringify(orders));
    },

    // تسجيل طلب جديد وتحديث كميات المبيعات والأكثر مبيعا
    createOrder(customerData, cartItems, totalAmount) {
        const orders = this.getOrders();
        const invoiceNumber = 'ROS-' + Math.floor(100000 + Math.random() * 900000);
        
        const newOrder = {
            invoiceId: invoiceNumber,
            date: new Date().toLocaleString('ar-JO'),
            customer: customerData, // الاسم، الهاتف، العنوان، المحفظة
            items: cartItems,
            total: totalAmount,
            status: 'بانتظار التأكيد'
        };

        orders.push(newOrder);
        this.saveOrders(orders);

        // تحديث إحصائيات القطع المباعة والمخزون
        let products = this.getProducts();
        cartItems.forEach(cartItem => {
            const product = products.find(p => p.name === cartItem.name);
            if (product) {
                product.soldCount = (product.soldCount || 0) + (cartItem.quantity || 1);
                product.stock = Math.max(0, (product.stock !== undefined ? product.stock : 10) - (cartItem.quantity || 1));
            }
        });
        this.saveProducts(products);

        return invoiceNumber;
    },

    // تأكيد الطلب من قبل الإدارة
    confirmOrder(invoiceId) {
        const orders = this.getOrders();
        const order = orders.find(o => o.invoiceId === invoiceId);
        if (order) {
            order.status = 'تم التأكيد وإصدار الفاتورة';
            this.saveOrders(orders);
        }
        return order;
    }
};
