const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const cron = require("node-cron");

require("dotenv").config();

const port = process.env.PORT || 8080;
const app = express();
app.use(cors({ origin: "http://localhost:3000" })); // السماح للفرونت
app.use("/uploads", express.static("uploads"));
// ✅ Security Middlewares
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(mongoSanitize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ✅ Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ CORS
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
const corsOptions = {
  origin: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// ✅ Routes
const userRoutes = require("./routes/user.routes");
const studentRoutes = require("./routes/student.routes");
const newsRoutes = require("./routes/news.routes");
const placeRoutes = require("./routes/place.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const examRoutes = require("./routes/exams.routes")
const awardRoutes = require("./routes/awards.routes")
const examResultRoutes = require("./routes/exam-results.routes");
app.use("/exam-results", examResultRoutes);
app.use("/", userRoutes);
app.use("/students", studentRoutes);
app.use("/news", newsRoutes);
app.use("/places", placeRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/exams", examRoutes)
app.use("/awards", awardRoutes)
// ✅ Default routes
app.get("/", (req, res) => res.send("Hello World, The Winner Team 💪"));
app.get("/healthz", (req, res) => res.send("OK"));

// ✅ Cron Job Reset Attendance Weekly
const Attendance = require("./models/ِAttendance.model");
cron.schedule("0 0 * * 6", async () => {
  console.log("🔄 Auto reset attendance for new week...");
  await Attendance.deleteMany({});
});

// DB Connect
mongoose.set("strictQuery", false);
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  })
  .catch((err) => {
    console.error("❌ Cannot connect to MongoDB", err);
  });