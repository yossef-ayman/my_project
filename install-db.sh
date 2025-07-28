#!/bin/bash
echo "🚀 تثبيت MongoDB و Mongoose..."
npm install mongoose
npm install bcryptjs
npm install jsonwebtoken
npm install @types/bcryptjs @types/jsonwebtoken --save-dev

echo "✅ تم تثبيت قاعدة البيانات بنجاح!"
echo "📝 لا تنس إضافة MONGODB_URI في ملف .env.local"
