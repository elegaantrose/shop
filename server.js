const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// زيادة الحدود المسموحة لبيانات JSON و URL-encoded لكي تستوعب 5 صور مدعومة بـ Base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

// رابط الاتصال بقاعدة بيانات MongoDB Atlas الخاصة بك
const MONGO_URI = "mongodb+srv://<db_username>:<db_password>@cluster0.liykb46.mongodb.net/elgantrose?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log('تم الاتصال بنجاح بـ MongoDB Atlas'))
  .catch(err => console.error('خطأ في الاتصال بـ MongoDB:', err));

// هيكل بيانات المنتجات
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: String, default: "" },
    stock: { type: Number, default: 10 },
    soldCount: { type: Number, default: 0 },
    images: [String] // مصفوفة لتخزين حتى 5 صور
});
const Product = mongoose.model('Product', productSchema);

// هيكل بيانات الطلبات
const orderSchema = new mongoose.Schema({
    invoiceId: String,
    date: { type: String, default: () => new Date().toLocaleString('ar-JO') },
    customer: { name: String, phone: String, address: String, wallet: String },
    items: [{ name: String, price: Number, quantity: Number }],
    total: Number,
    status: { type: String, default: 'بانتظار التأكيد' }
});
const Order = mongoose.model('Order', orderSchema);

// API Endpoints
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        let { name, price, stock, discount, images } = req.body;
        
        // تقييد عدد الصور بحد أقصى 5 صور حمايةً للقاعدة
        if (images && images.length > 5) {
            images = images.slice(0, 5);
        }

        const newProduct = new Product({ name, price, stock, discount, images });
        await newProduct.save();
        res.json({ success: true, product: newProduct });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

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
