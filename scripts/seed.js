const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/attendance-system"

// User Schema (simplified for seeding)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  customId: String,
  parentPhone: String,
  location: String,
  grade: String,
  registrationDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
})

const User = mongoose.models.User || mongoose.model("User", UserSchema)

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log("🔗 Connected to MongoDB")

    // Clear existing data
    await User.deleteMany({})
    console.log("🗑️ Cleared existing users")

    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 12)
    const studentPassword = await bcrypt.hash("123456", 12)

    // Create admin user
    const admin = new User({
      email: "admin@engineer-mohamed.com",
      password: hashedPassword,
      name: "الأستاذ محمد الإبراشي",
      role: "admin",
    })
    await admin.save()

    // Create sample students
    const students = [
      {
        email: "student1@engineer-mohamed.com",
        password: studentPassword,
        name: "أحمد محمد علي",
        role: "student",
        customId: "ST001",
        parentPhone: "01012345678",
        location: "القاعة الرئيسية",
        grade: "first",
      },
      {
        email: "student2@engineer-mohamed.com",
        password: studentPassword,
        name: "فاطمة أحمد محمد",
        role: "student",
        customId: "ST002",
        parentPhone: "01087654321",
        location: "القاعة الرئيسية",
        grade: "second",
      },
      {
        email: "student3@engineer-mohamed.com",
        password: studentPassword,
        name: "محمد علي حسن",
        role: "student",
        customId: "ST003",
        parentPhone: "01055555555",
        location: "المعمل",
        grade: "first",
      },
    ]

    await User.insertMany(students)

    console.log("✅ Database seeded successfully!")
    console.log("👤 Admin: admin@engineer-mohamed.com / admin123")
    console.log("🎓 Students: student1@engineer-mohamed.com / 123456")
    console.log("🎓 Students: student2@engineer-mohamed.com / 123456")
    console.log("🎓 Students: student3@engineer-mohamed.com / 123456")
  } catch (error) {
    console.error("❌ Seeding failed:", error)
  } finally {
    await mongoose.disconnect()
    console.log("🔌 Disconnected from MongoDB")
  }
}

seedDatabase()
