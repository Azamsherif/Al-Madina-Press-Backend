const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create uploads folder if not exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'product-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB successfully!');
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
    });

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['حلويات ومعارض', 'شركات أدوية', 'مراكز أشعة', 'كتب وأغلفة']
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    details: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('ar-SA')
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Contact Messages Schema
const messageSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    product: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        default: ''
    },
    recipient: {
        type: String,
        default: ''
    },
    date: {
        type: String,
        default: () => new Date().toLocaleDateString('ar-EG')
    },
    time: {
        type: String,
        default: () => new Date().toLocaleTimeString('ar-EG')
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Message = mongoose.model('Message', messageSchema);

// Settings Schema (for admin credentials)
const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        required: true
    }
});

const Settings = mongoose.model('Settings', settingsSchema);

// ========================
// API Routes
// ========================

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'مرحباً بك في API مطبعة المدينة',
        version: '1.0.0',
        endpoints: {
            portfolio: '/api/portfolio',
            messages: '/api/messages',
            upload: '/api/upload',
            settings: '/api/settings'
        }
    });
});

// ========================
// Portfolio Routes
// ========================

// Get all portfolio items
app.get('/api/portfolio', async (req, res) => {
    try {
        const items = await Portfolio.find().sort({ createdAt: -1 });
        // Map _id to id for frontend compatibility
        const formattedItems = items.map(item => ({
            id: item._id.toString(),
            title: item.title,
            category: item.category,
            image: item.image,
            description: item.description,
            details: item.details,
            date: item.date
        }));
        res.json(formattedItems);
    } catch (error) {
        console.error('Error fetching portfolio:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتجات' });
    }
});

// Get single portfolio item
app.get('/api/portfolio/:id', async (req, res) => {
    try {
        const item = await Portfolio.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        res.json({
            id: item._id.toString(),
            title: item.title,
            category: item.category,
            image: item.image,
            description: item.description,
            details: item.details,
            date: item.date
        });
    } catch (error) {
        console.error('Error fetching portfolio item:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب المنتج' });
    }
});

// Create new portfolio item
app.post('/api/portfolio', async (req, res) => {
    try {
        const { title, category, image, description, details, date } = req.body;
        
        const newItem = new Portfolio({
            title,
            category,
            image,
            description: description || '',
            details: details || '',
            date: date || new Date().toLocaleDateString('ar-SA')
        });
        
        const savedItem = await newItem.save();
        
        res.status(201).json({
            id: savedItem._id.toString(),
            title: savedItem.title,
            category: savedItem.category,
            image: savedItem.image,
            description: savedItem.description,
            details: savedItem.details,
            date: savedItem.date
        });
    } catch (error) {
        console.error('Error creating portfolio item:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء إضافة المنتج' });
    }
});

// Update portfolio item
app.put('/api/portfolio/:id', async (req, res) => {
    try {
        const { title, category, image, description, details } = req.body;
        
        const updatedItem = await Portfolio.findByIdAndUpdate(
            req.params.id,
            { title, category, image, description, details },
            { new: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        res.json({
            id: updatedItem._id.toString(),
            title: updatedItem.title,
            category: updatedItem.category,
            image: updatedItem.image,
            description: updatedItem.description,
            details: updatedItem.details,
            date: updatedItem.date
        });
    } catch (error) {
        console.error('Error updating portfolio item:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء تحديث المنتج' });
    }
});

// Delete portfolio item
app.delete('/api/portfolio/:id', async (req, res) => {
    try {
        const deletedItem = await Portfolio.findByIdAndDelete(req.params.id);
        
        if (!deletedItem) {
            return res.status(404).json({ error: 'المنتج غير موجود' });
        }
        
        // Delete associated image if it's stored locally
        if (deletedItem.image && deletedItem.image.includes('/uploads/')) {
            const imagePath = path.join(__dirname, deletedItem.image.replace('https://al-madina-press-backend.onrender.com', ''));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        res.json({ message: 'تم حذف المنتج بنجاح', id: req.params.id });
    } catch (error) {
        console.error('Error deleting portfolio item:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء حذف المنتج' });
    }
});

// ========================
// Image Upload Route
// ========================

app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'لم يتم رفع أي صورة' });
        }
        
        const baseUrl = process.env.BASE_URL || `http://localhost:${PORT}`;
        const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        res.json({
            message: 'تم رفع الصورة بنجاح',
            url: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء رفع الصورة' });
    }
});

// ========================
// Messages Routes
// ========================

// Get all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        const formattedMessages = messages.map(msg => ({
            id: msg._id.toString(),
            type: msg.type,
            name: msg.name,
            email: msg.email,
            phone: msg.phone,
            message: msg.message,
            product: msg.product,
            category: msg.category,
            recipient: msg.recipient,
            date: msg.date,
            time: msg.time,
            read: msg.read,
            timestamp: msg.createdAt
        }));
        res.json(formattedMessages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب الرسائل' });
    }
});

// Create new message
app.post('/api/messages', async (req, res) => {
    try {
        const newMessage = new Message(req.body);
        const savedMessage = await newMessage.save();
        
        res.status(201).json({
            id: savedMessage._id.toString(),
            type: savedMessage.type,
            name: savedMessage.name,
            email: savedMessage.email,
            phone: savedMessage.phone,
            message: savedMessage.message,
            product: savedMessage.product,
            category: savedMessage.category,
            recipient: savedMessage.recipient,
            date: savedMessage.date,
            time: savedMessage.time,
            read: savedMessage.read
        });
    } catch (error) {
        console.error('Error creating message:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء حفظ الرسالة' });
    }
});

// Mark message as read
app.patch('/api/messages/:id/read', async (req, res) => {
    try {
        const updatedMessage = await Message.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        
        if (!updatedMessage) {
            return res.status(404).json({ error: 'الرسالة غير موجودة' });
        }
        
        res.json({ message: 'تم تحديث حالة القراءة', id: req.params.id });
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء تحديث الرسالة' });
    }
});

// Delete message
app.delete('/api/messages/:id', async (req, res) => {
    try {
        const deletedMessage = await Message.findByIdAndDelete(req.params.id);
        
        if (!deletedMessage) {
            return res.status(404).json({ error: 'الرسالة غير موجودة' });
        }
        
        res.json({ message: 'تم حذف الرسالة بنجاح', id: req.params.id });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء حذف الرسالة' });
    }
});

// Delete all messages
app.delete('/api/messages', async (req, res) => {
    try {
        await Message.deleteMany({});
        res.json({ message: 'تم حذف جميع الرسائل بنجاح' });
    } catch (error) {
        console.error('Error deleting all messages:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء حذف الرسائل' });
    }
});

// ========================
// Settings Routes (for admin)
// ========================

// Get setting
app.get('/api/settings/:key', async (req, res) => {
    try {
        const setting = await Settings.findOne({ key: req.params.key });
        if (!setting) {
            // Return default values
            if (req.params.key === 'adminUsername') {
                return res.json({ value: 'admin' });
            }
            if (req.params.key === 'adminPassword') {
                return res.json({ value: 'admin123' });
            }
            return res.status(404).json({ error: 'الإعداد غير موجود' });
        }
        res.json({ value: setting.value });
    } catch (error) {
        console.error('Error fetching setting:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب الإعداد' });
    }
});

// Update setting
app.put('/api/settings/:key', async (req, res) => {
    try {
        const { value } = req.body;
        
        const setting = await Settings.findOneAndUpdate(
            { key: req.params.key },
            { value },
            { new: true, upsert: true }
        );
        
        res.json({ message: 'تم تحديث الإعداد بنجاح', key: setting.key });
    } catch (error) {
        console.error('Error updating setting:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء تحديث الإعداد' });
    }
});

// ========================
// Statistics Route
// ========================

app.get('/api/stats', async (req, res) => {
    try {
        const totalProducts = await Portfolio.countDocuments();
        const totalMessages = await Message.countDocuments();
        const unreadMessages = await Message.countDocuments({ read: false });
        
        const categoryCounts = await Portfolio.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        res.json({
            totalProducts,
            totalMessages,
            unreadMessages,
            categoryCounts
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🖨️  مطبعة المدينة - Backend Server                       ║
║                                                            ║
║   Server running at: http://localhost:${PORT}                ║
║                                                            ║
║   API Endpoints:                                           ║
║   • GET    /api/portfolio      - Get all products          ║
║   • POST   /api/portfolio      - Add new product           ║
║   • DELETE /api/portfolio/:id  - Delete product            ║
║   • POST   /api/upload         - Upload image              ║
║   • GET    /api/messages       - Get all messages          ║
║   • POST   /api/messages       - Save message              ║
║   • GET    /api/stats          - Get statistics            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
    `);
});
