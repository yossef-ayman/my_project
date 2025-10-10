"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { toast, Bounce } from "react-toastify"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { User, Lock, Phone, GraduationCap, MapPin, Mail } from "lucide-react"

// 🟢 تعريف مكون الإدخال خارج الكومبوننت الرئيسي
const InputGroup = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={props.name} className="flex items-center gap-2 text-sm font-medium">
      {icon} {label}
    </Label>
    <Input {...props} id={props.name} className="text-right" dir="rtl" />
  </div>
)

// 🟢 تعريف مكون الاختيار خارج الكومبوننت الرئيسي
const SelectGroup = ({ label, icon, options, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={props.name} className="flex items-center gap-2 text-sm font-medium">
      {icon} {label}
    </Label>
    <select
      {...props}
      id={props.name}
      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-right appearance-none"
    >
      <option value="" disabled className="text-gray-500">
        --- اختر {label} ---
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
)

// الصفوف (Grades)
const GRADES = [
  { value: "grade1", label: "الصف الأول (الرينج 1-100)" },
  { value: "grade2", label: "الصف الثاني (الرينج 200-250)" },
  { value: "grade3", label: "الصف الثالث (الرينج 300-350)" },
]

// الأماكن (Places)
const PLACES = [
  { value: "60c72b2f9f1b9f0015b6d5f0", label: "قاعة الشروق" },
  { value: "60c72b2f9f1b9f0015b6d5f1", label: "قاعة الأمل" },
  { value: "60c72b2f9f1b9f0015b6d5f2", label: "قاعة النور" },
]

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    grade: "",
    place: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

  const handleChange = (e) => {
    const { name, value } = e.target
    // ✅ الطريقة الصحيحة للاحتفاظ بالقيم القديمة
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    if (!formData.grade || !formData.place) {
      toast.error("الرجاء اختيار الصف والمكان بشكل صحيح.", { autoClose: 3000, theme: "colored" })
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch(`${apiBaseUrl}/register/student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          data.message ||
            `تم تسجيلك بنجاح! كود الطالب هو ${data.stdcode}. استخدم بريدك وكلمة السر لتسجيل الدخول.`,
          {
            position: "top-right",
            autoClose: 10000,
            theme: "colored",
            transition: Bounce,
          }
        )
        navigate("/login")
      } else {
        toast.error(data.message || "❌ فشل التسجيل. حاول مجدداً.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        })
      }
    } catch (err) {
      toast.error("⚠️ فشل الاتصال بالخادم.", {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
        transition: Bounce,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-gradient bg-white/90 backdrop-blur-sm animate-slideInUp shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-emerald-800">
            <User className="h-6 w-6" />
            إضافة طالب جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputGroup
              label="اسم الطالب"
              icon={<User />}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="أدخل اسمك كاملاً"
            />
            <InputGroup
              label="البريد الإلكتروني"
              icon={<Mail />}
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="بريد إلكتروني صالح"
            />
            <InputGroup
              label="كلمة السر"
              icon={<Lock />}
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="اختر كلمة مرور قوية"
            />
            <InputGroup
              label="رقم الطالب"
              icon={<Phone />}
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="رقم الهاتف الخاص بالطالب"
            />
            <InputGroup
              label="رقم ولي الأمر"
              icon={<Phone />}
              type="tel"
              name="parentPhone"
              value={formData.parentPhone}
              onChange={handleChange}
              required
              placeholder="رقم هاتف ولي الأمر"
            />
            <SelectGroup
              label="اختر الصف"
              icon={<GraduationCap />}
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              required
              options={GRADES}
            />
            <SelectGroup
              label="اختر المكان"
              icon={<MapPin />}
              name="place"
              value={formData.place}
              onChange={handleChange}
              required
              options={PLACES}
            />
            <div className="md:col-span-2 mt-4">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-[1.01] transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? "جاري إنشاء الحساب..." : "إضافة"}
              </Button>
            </div>
            <div className="md:col-span-2 text-center mt-3">
              <Link to="/login" className="text-sm text-blue-600 hover:underline">
                هل لديك حساب بالفعل؟ سجل الدخول
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default Signup
