const express = require("express");
const router = express.Router();
const News = require("../models/news.model");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Get all news
router.get("/", async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });

    // ✅ التعديل هنا: إضافة رابط الخادم الكامل لكل صورة
    const fullUrl = req.protocol + "://" + req.get("host");
    const formattedNews = news.map((item) => {
      // استخدام toObject() للحصول على كائن JS عادي
      const newsObject = item.toObject();
      
      // تحديث مسار الصورة ليصبح رابطًا كاملاً
      if (newsObject.imageUrl) {
        newsObject.imageUrl = `${fullUrl}${newsObject.imageUrl}`;
      }
      return newsObject;
    });

    res.json(formattedNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create news
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      date: new Date(),
      priority: req.body.priority,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null,
    });
    await newNews.save();
    // إرسال الكائن الجديد بعد تعديل مسار الصورة
    const fullUrl = req.protocol + "://" + req.get("host");
    const createdNews = newNews.toObject();
    if (createdNews.imageUrl) {
      createdNews.imageUrl = `${fullUrl}${createdNews.imageUrl}`;
    }
    res.status(201).json(createdNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update news
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    news.title = req.body.title || news.title;
    news.content = req.body.content || news.content;
    news.priority = req.body.priority || news.priority;

    // إذا في صورة جديدة نحذف القديمة
    if (req.file) {
      if (news.imageUrl) {
        const oldImagePath = path.join(__dirname, "..", news.imageUrl);
        if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
      }
      news.imageUrl = `/uploads/${req.file.filename}`;
    }

    await news.save();
    // إرسال الكائن المحدث بعد تعديل مسار الصورة
    const fullUrl = req.protocol + "://" + req.get("host");
    const updatedNews = news.toObject();
    if (updatedNews.imageUrl) {
      updatedNews.imageUrl = `${fullUrl}${updatedNews.imageUrl}`;
    }
    res.json(updatedNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete news
router.delete("/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ message: "News not found" });

    // حذف الصورة من السيرفر لو موجودة
    if (news.imageUrl) {
      const imagePath = path.join(__dirname, "..", news.imageUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }

    await News.findByIdAndDelete(req.params.id);
    res.json({ message: "News deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;