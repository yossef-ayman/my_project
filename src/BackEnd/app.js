const express = require("express");
const mongoose = require('mongoose');
const User = require('./models/user.model');
const bcrypt = require('bcrypt');
const cors = require('cors');

const mongouri = "mongodb+srv://hazemmohmed564:8maZMXPSnWm7M8DS@cluster0.eqoczlu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.get('/', (req, res) => {
    res.send('Hello World, the winner team');
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


app.post("/register", async (req, res) => {
    try {
       const { name, email, password, phone, parentPhone, role ,grad ,place ,stdcode} = req.body;


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
  grad,
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
