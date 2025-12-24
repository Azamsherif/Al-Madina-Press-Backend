const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ Connection error:', err));

// Portfolio Schema
const portfolioSchema = new mongoose.Schema({
    title: String,
    category: String,
    image: String,
    description: String,
    details: String,
    date: String,
    createdAt: { type: Date, default: Date.now }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Default products to seed
const defaultProducts = [
    {
        title: 'علبة حلويات فاخرة',
        category: 'حلويات ومعارض',
        image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600',
        description: 'تصميم علبة حلويات أنيقة وفاخرة',
        details: 'علبة كرتون مطبوعة بجودة عالية مع تشطيب لامع',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'كرتونة دواء شركة',
        category: 'شركات أدوية',
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600',
        description: 'عبوات أدوية احترافية',
        details: 'كرتون طبي بمعايير الجودة العالمية',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'غلاف أشعة طبية',
        category: 'مراكز أشعة',
        image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600',
        description: 'أغلفة أشعة احترافية',
        details: 'غلاف أشعة بجودة عالية ومقاوم للماء',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'علب كيك وحلويات',
        category: 'حلويات ومعارض',
        image: 'https://images.unsplash.com/photo-1562440499-64c9a111f713?w=600',
        description: 'علب كيك متنوعة',
        details: 'علب كيك بأحجام مختلفة مع إمكانية التخصيص',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'عبوة دواء طبي',
        category: 'شركات أدوية',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600',
        description: 'عبوات دوائية متقدمة',
        details: 'عبوات محكمة الإغلاق ومطابقة للمواصفات الدوائية',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'غلاف أشعة سينية',
        category: 'مراكز أشعة',
        image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600',
        description: 'أغلفة أشعة سينية',
        details: 'أغلفة مخصصة لحفظ صور الأشعة السينية',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'كتاب دراسي مطبوع',
        category: 'كتب وأغلفة',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600',
        description: 'طباعة كتب دراسية',
        details: 'طباعة كتب بأعلى جودة وورق فاخر',
        date: new Date().toLocaleDateString('ar-SA')
    },
    {
        title: 'غلاف كتاب فاخر',
        category: 'كتب وأغلفة',
        image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600',
        description: 'تصميم أغلفة كتب',
        details: 'تصميم وطباعة أغلفة كتب بتشطيبات مميزة',
        date: new Date().toLocaleDateString('ar-SA')
    }
];

async function seedDatabase() {
    try {
        // Check if there are existing products
        const existingCount = await Portfolio.countDocuments();
        
        if (existingCount > 0) {
            console.log(`📦 يوجد ${existingCount} منتج في قاعدة البيانات`);
            console.log('هل تريد إضافة المنتجات الافتراضية؟ (سيتم الإضافة تلقائياً)');
        }
        
        // Add default products
        const result = await Portfolio.insertMany(defaultProducts);
        console.log(`✅ تم إضافة ${result.length} منتج بنجاح!`);
        
        // Show all products
        const allProducts = await Portfolio.find();
        console.log('\n📋 جميع المنتجات:');
        allProducts.forEach((p, i) => {
            console.log(`  ${i + 1}. ${p.title} (${p.category})`);
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        mongoose.connection.close();
        console.log('\n🔌 تم إغلاق الاتصال بقاعدة البيانات');
    }
}

seedDatabase();
