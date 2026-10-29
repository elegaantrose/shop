const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '10mb' })); // لدعم رفع الصور الكبيرة (Base64)
app.use(cors());

// رابط الاتصال بقاعدة بيانات MongoDB الخاصة بك
const MONGO_URI = "mongodb+srv://<db_username>:<db_password>@cluster0.liykb46.mongodb.net/elgantrose?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log('تم الاتصال بنجاح بـ MongoDB Atlas'))
  .catch(err => console.error('خطأ في الاتصال بـ MongoDB:', err));

// --- 1. هيكل بيانات المنتجات (Products Schema) ---
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: String, default: "" },
    stock: { type: Number, default: 10 },
    soldCount: { type: Number, default: 0 },
    images: [String] // حفظ روابط الصور أو بيانات الـ Base64 مباشرة
});
const Product = mongoose.model('Product', productSchema);

// --- 2. هيكل بيانات الطلبات والمشترين (Orders Schema) ---
const orderSchema = new mongoose.Schema({
    invoiceId: String,
    date: { type: String, default: () => new Date().toLocaleString('ar-JO') },
    customer: {
        name: String,
        phone: String,
        address: String,
        wallet: String
    },
    items: [{
        name: String,
        price: Number,
        quantity: Number
    }],
    total: Number,
    status: { type: String, default: 'بانتظار التأكيد' }
});
const Order = mongoose.model('Order', orderSchema);

// --- وظيفة تلقائية لرفع 5 منتجات افتراضية للمحجبات عند أول تشغيل ---
async function seedDefaultProducts() {
    const count = await Product.countDocuments();
    if (count === 0) {
        const defaultHijabProducts = [
            {
                name: "عباية سهرة راقية مطرزة",
                price: 45.00,
                discount: "خصم 15%",
                stock: 12,
                images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600"]
            },
            {
                name: "فستان ماكسي واسع للمحجبات",
                price: 35.00,
                discount: "",
                stock: 8,
                images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600"]
            },
            {
                name: "طقم كاجوال تركي أنيق",
                price: 40.00,
                discount: "عرض خاص",
                stock: 15,
                images: ["https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600"]
            },
            {
                name: "معطف شتوي طويل للمحجبات",
                price: 60.00,
                discount: "خصم 20%",
                stock: 5,
                images: ["https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600"]
            },
            {
                name: "طرحة شيفون ملكية مع إكسسوار",
                price: 12.00,
                discount: "",
                stock: 25,
                images: ["https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600"]
            }
        ];
        await Product.insertMany(defaultHijabProducts);
        console.log('تم رفع 5 منتجات افتراضية للمحجبات بنجاح على قاعدة MongoDB!');
    }
}
seedDefaultProducts();

// --- API Endpoints ---

// جلب المنتجات
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// إضافة منتج جديد (مع رفع الصور)
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// حذف منتج
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// حفظ طلب جديد وبيانات المشتري وتحديث المخزون
app.post('/api/orders', async (req, res) => {
    try {
        const { customer, items, total } = req.body;
        const invoiceNumber = 'ROS-' + Math.floor(100000 + Math.random() * 900000);

        const newOrder = new Order({
            invoiceId: invoiceNumber,
            customer,
            items,
            total
        });
        await newOrder.save();

        // تحديث كميات المخزون والقطع المباعة في قاعدة البيانات
        for (let item of items) {
            await Product.findOneAndUpdate(
                { name: item.name },
                { 
                    $inc: { stock: -1, soldCount: 1 } 
                }
            );
        }

        res.json({ success: true, invoiceId: invoiceNumber });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// جلب الطلبات للإدارة
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// تأكيد الطلب
app.put('/api/orders/:id/confirm', async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(req.params.id, { status: 'تم التأكيد وإصدار الفاتورة' }, { new: true });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`الخادم يعمل على المنفذ ${PORT}`));
