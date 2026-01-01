# مطبعة المدينة - Backend API

## 📋 الوصف
باك إند كامل لموقع مطبعة المدينة، يتضمن API للتعامل مع المنتجات، الرسائل، ورفع الصور.

## 🛠️ التقنيات المستخدمة
- **Node.js** - بيئة التشغيل
- **Express.js** - إطار العمل
- **MongoDB** - قاعدة البيانات
- **Mongoose** - ODM للتعامل مع MongoDB
- **Multer** - رفع الصور

## 📦 التثبيت

```bash
# الانتقال لمجلد الباك إند
cd backend

# تثبيت الـ dependencies
npm install

# تشغيل السيرفر
npm start

# أو للتشغيل في وضع التطوير
npm run dev
```

## ⚙️ إعدادات البيئة (.env)

```env
MONGODB_URI=mongodb+srv://your_connection_string
PORT=4000
BASE_URL=https://al-madina-press-backend.onrender.com
```

## 🖼️ تخزين الصور
الصور يتم تخزينها مباشرة في MongoDB كـ Base64.
- لا حاجة لأي خدمة خارجية
- الصور تبقى محفوظة حتى لو أُعيد تشغيل السيرفر
- رابط الصور: `/api/images/:id`

## 🔗 الـ API Endpoints

### المنتجات (Portfolio)
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/portfolio` | جلب جميع المنتجات |
| GET | `/api/portfolio/:id` | جلب منتج واحد |
| POST | `/api/portfolio` | إضافة منتج جديد |
| PUT | `/api/portfolio/:id` | تحديث منتج |
| DELETE | `/api/portfolio/:id` | حذف منتج |

### رفع الصور
| Method | Endpoint | الوصف |
|--------|----------|-------|
| POST | `/api/upload` | رفع صورة (form-data: image) |

### الرسائل
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/messages` | جلب جميع الرسائل |
| POST | `/api/messages` | إنشاء رسالة جديدة |
| PATCH | `/api/messages/:id/read` | تحديد كمقروءة |
| DELETE | `/api/messages/:id` | حذف رسالة |
| DELETE | `/api/messages` | حذف جميع الرسائل |

### الإحصائيات
| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/api/stats` | جلب إحصائيات الموقع |

## 📝 أمثلة على الاستخدام

### إضافة منتج جديد
```javascript
fetch('http://localhost:4000/api/portfolio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        title: 'علبة حلويات فاخرة',
        category: 'حلويات ومعارض',
        image: 'https://example.com/image.jpg',
        description: 'وصف المنتج',
        details: 'تفاصيل المنتج'
    })
});
```

### رفع صورة
```javascript
const formData = new FormData();
formData.append('image', file);

fetch('http://localhost:4000/api/upload', {
    method: 'POST',
    body: formData
});
```

## 📁 هيكل المشروع
```
backend/
├── server.js      # ملف السيرفر الرئيسي
├── seed.js        # سكريبت لإضافة بيانات افتراضية
├── package.json   # ملف الـ dependencies
├── .env           # إعدادات البيئة
└── uploads/       # مجلد الصور المرفوعة
```

## 🚀 تشغيل المشروع الكامل

### 1. تشغيل الباك إند
```bash
cd backend
npm start
```
السيرفر يعمل على: http://localhost:4000

### 2. تشغيل الفرونت إند
```bash
cd ..
npx serve public -p 3000
```
الموقع يعمل على: http://localhost:3000

## 📊 قاعدة البيانات (Collections)

### portfolios
```javascript
{
  _id: ObjectId,
  title: String,
  category: String,  // ['حلويات ومعارض', 'شركات أدوية', 'مراكز أشعة', 'كتب وأغلفة']
  image: String,
  description: String,
  details: String,
  date: String,
  createdAt: Date
}
```

### messages
```javascript
{
  _id: ObjectId,
  type: String,
  name: String,
  email: String,
  phone: String,
  message: String,
  product: String,
  category: String,
  recipient: String,
  date: String,
  time: String,
  read: Boolean,
  createdAt: Date
}
```

## ✅ تم الانتهاء!
الباك إند جاهز للعمل مع الفرونت إند بشكل كامل.
