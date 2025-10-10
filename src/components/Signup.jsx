"use client"

import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { useNavigate, Link } from "react-router-dom"
import { toast, ToastContainer, Bounce } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { User, Lock, Phone, GraduationCap, MapPin, Mail, Loader, Hash } from "lucide-react"

// InputGroup component
const InputGroup = ({ label, icon, ...props }) => (
  <div className="space-y-2">
    <Label htmlFor={props.name} className="flex items-center gap-2 text-sm font-medium">
      {icon} {label}
    </Label>
    <Input {...props} id={props.name} className="text-right" dir="rtl" />
  </div>
)

// SelectGroup component
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

const Signup = () => {
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    parentPhone: "",
    grade: "",
    place: "",
    stdcode: "",
  })
  const [places, setPlaces] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // توليد stdcode عشوائي من 6 أرقام عند فتح الصفحة
  useEffect(() => {
    const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()
    setFormData((prev) => ({ ...prev, stdcode: generateCode() }))
  }, [])

  useEffect(() => {
    let mounted = true
    fetch(`${apiBaseUrl}/places`)
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return
        const opts = Array.isArray(data)
          ? data.map((p) => ({ value: p._id || p.id || p.value, label: p.name || p.title || "—" }))
          : []
        setPlaces(opts)
      })
      .catch(() => {
        toast.warn("⚠️ تعذر تحميل الأماكن حالياً — يمكنك الاختيار لاحقاً.", { transition: Bounce })
      })
    return () => (mounted = false)
  }, [apiBaseUrl])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("الرجاء ملء الاسم، البريد، وكلمة المرور.", { transition: Bounce })
      return false
    }
    if (!formData.grade || !formData.place) {
      toast.error("الرجاء اختيار الصف والمكان.", { transition: Bounce })
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    try {
      const res = await fetch(`${apiBaseUrl}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(
          data.message || `تم التسجيل بنجاح! كود الطالب: ${formData.stdcode}`,
          { position: "top-right", autoClose: 8000, theme: "colored", transition: Bounce }
        )
        setTimeout(() => navigate("/login"), 1200)
      } else {
        toast.error(data.message || "❌ فشل التسجيل. حاول مرة أخرى.", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        })
      }
    } catch (err) {
      toast.error("⚠️ فشل الاتصال بالخادم.", { position: "top-right", autoClose: 5000, theme: "colored", transition: Bounce })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-emerald-50 flex items-center justify-center p-4">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" transition={Bounce} />

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="w-full max-w-2xl border-gradient bg-white/90 backdrop-blur-sm shadow-xl rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-emerald-800">
              <User className="h-6 w-6" /> تسجيل طالب جديد
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
                placeholder="رقم الهاتف الخاص بالطالب"
              />

              <InputGroup
                label="رقم ولي الأمر"
                icon={<Phone />}
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="رقم هاتف ولي الأمر"
              />

              <SelectGroup
                label="اختر الصف"
                icon={<GraduationCap />}
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                required
                options={[
                  { value: "الصف الأول الثانوي", label: "الصف الأول الثانوي" },
                  { value: "الصف الثاني الثانوي", label: "الصف الثاني الثانوي" },
                  { value: "الصف الثالث الثانوي", label: "الصف الثالث الثانوي" },
                ]}
              />

              <SelectGroup
                label="اختر المكان"
                icon={<MapPin />}
                name="place"
                value={formData.place}
                onChange={handleChange}
                required
                options={places.length ? places : [
                  { value: "", label: "تحميل الأماكن..." }
                ]}
              />

              <div className="md:col-span-2">
                <InputGroup
                  label="كود الطالب (يُولد تلقائيًا)"
                  icon={<Hash />}
                  type="text"
                  name="stdcode"
                  value={formData.stdcode}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 transform hover:scale-[1.01] transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" /> جاري إنشاء الحساب...
                    </span>
                  ) : (
                    "إضافة"
                  )}
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
      </motion.div>
    </div>
  )
}

export default Signup