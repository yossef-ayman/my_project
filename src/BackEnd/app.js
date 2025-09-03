const express = require("express");
const mongoose = require('mongoose');
const multer = require("multer");
const path = require("path");
const User = require('./models/user.model');
const News = require("./models/news.model");
const Place = require("./models/place.model");

const bcrypt = require('bcrypt');
const cors = require('cors');
 
const mongouri = "mongodb+srv://hazemmohmed564:8maZMXPSnWm7M8DS@cluster0.eqoczlu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/")
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname)
  },
})
const upload = multer({ storage })

app.get('/', (req, res) => {
    res.send('Hello World, the winner team');
});

app.get('/students', async (req, res) => {
  try {
    const students = await User.find({ role: "student" }); 
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/user/:stdcode', async (req, res) => {
  try {
    const stdcode = req.params.stdcode;

    const user = await User.findOne({ stdcode: stdcode });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
}   catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.post("/register", async (req, res) => {
    try {
       const { name, email, password, phone, parentPhone, role ,grade ,place ,stdcode} = req.body;


        if (!name || !email || !password || !phone || !parentPhone) {
            return res.status(400).send({ message: "Missing required fields" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ message: "Invalid email format" });
        }

        if (await User.findOne({ email })) {
            return res.status(400).send({ message: `Email "${email}" already exists` });
        }

        if (!/^[0-9]{11}$/.test(phone)) {
            return res.status(400).send({ message: "Phone number must be 11 digits" });
        }

        if (!/^[0-9]{11}$/.test(parentPhone)) {
            return res.status(400).send({ message: "Parent phone number must be 11 digits" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

       const newUser = new User({
  name,
  email,
  password: hashedPassword,
  phone,
  parentPhone,
  role,
  grade,
  place,
  stdcode
});


        await newUser.save();
        res.status(201).send({ message: "User added successfully", userId: newUser._id });

    } catch (err) {
        console.error("SignUp Error:", err);
        res.status(500).send({ message: "Server error", error: err.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        const token = user.generateAuthToken();
        res.status(200).send({ user, token });
        console.log('Login successful');
    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('Login failed', error.message);
    }
});
// ✅ Update user by stdcode
app.put("/user/:stdcode", async (req, res) => {
  try {
    const { stdcode } = req.params;

    const updatedUser = await User.findOneAndUpdate(
      { stdcode: stdcode },   
      req.body,
      { new: true }           
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/news", async (req, res) => {
  try {
    const news = await News.find().sort({ date: -1 });

    const fixedNews = news.map(item => ({
      ...item._doc,
      imageUrl: item.imageUrl
        ? item.imageUrl.startsWith("http")
          ? item.imageUrl
          : `http://localhost:8080${item.imageUrl}`
        : null
    }));

    res.status(200).json(fixedNews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/news", upload.single("image"), async (req, res) => {
  try {
    const newNews = new News({
      title: req.body.title,
      content: req.body.content,
      date: req.body.date || new Date(),
      priority: req.body.priority,
      imageUrl: req.file ? `http://localhost:8080/uploads/${req.file.filename}` : null,
    });

    await newNews.save();
    res.status(201).json(newNews);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error saving news" });
  }
});

app.put("/news/:id", upload.single("image"), async (req, res) => {
  try {
    const updatedData = {
      title: req.body.title,
      content: req.body.content,
      date: req.body.date || new Date(),
      priority: req.body.priority,
    }

    // ✅ لو فيه صورة جديدة استعملها، لو لأ احتفظ بالقديمة
    if (req.file) {
      updatedData.imageUrl = `/uploads/${req.file.filename}`
    }

    const updated = await News.findByIdAndUpdate(req.params.id, updatedData, { new: true })
    if (!updated) return res.status(404).json({ message: "الخبر غير موجود" })
    res.json({ message: "تم التحديث", news: updated })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

app.delete("/news/:id", async (req, res) => {
  try {
    const deleted = await News.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "الخبر غير موجود" });
    res.json({ message: "تم الحذف" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.get("/places", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/places", async (req, res) => {
  try {
    const { name, grade, from, to, days } = req.body;
    const place = new Place({ name, grade, from, to, days });
    await place.save();
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put("/places/:id", async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(place);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/places/:id", async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    res.json({ message: "تم الحذف بنجاح" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const port = 8080;
mongoose.set("strictQuery", false);
mongoose
    .connect(mongouri)
    .then(() => {
        console.log('connected to MongoDB');
        app.listen(port, () => console.log('app started on port ' + port));
    })
    .catch((error) => {
        console.log('cant connect to mongodb', error);
    });
