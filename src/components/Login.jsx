// في ملف Login.jsx

"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom" // ✅ استيراد Link هنا
import { toast, Bounce } from "react-toastify"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { LogIn, User, Lock, GraduationCap } from "lucide-react"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const apiBaseUrl = process.env.REACT_APP_API_URL

  // ... (دالة handleSubmit كما هي)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      let data
      try {
        data = await res.json()
      } catch {
        data = { message: "Unexpected server response" }
      }

      if (res.ok && data.token) {
        localStorage.setItem("authToken", data.token)
        localStorage.setItem("user", JSON.stringify(data.user))

        if (data.user.role === "student") {
          const studentRes = await fetch(`${apiBaseUrl}/students/${data.user._id}`, {
            headers: { Authorization: `Bearer ${data.token}` },
          })
          const studentData = await studentRes.json()
          if (studentRes.ok) {
            localStorage.setItem("student", JSON.stringify(studentData))
          }
        }

        onLogin?.({
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          token: data.token,
        })
        
        toast.success(`مرحبا بعودتك ${data.user.name}`, {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
          transition: Bounce,
        })

        if (data.user.role === "admin") navigate("/admin")
        else navigate("/student")
      } else {
        toast.error(data.message || "❌ البريد الإلكتروني أو كلمة المرور غير صحيحة", {
          position: "top-right",
          autoClose: 5000,
          theme: "colored",
          transition: Bounce,
        })
      }
    } catch (err) {
      toast.error("⚠️ فشل الاتصال بالخادم", {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* ... (الجزء العلوي كما هو) ... */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-glow">
            <GraduationCap className="h-10 w-10 text-white animate-wiggle" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient text-glow">أستاذ</h1>
            <h2 className="text-2xl font-bold text-purple-800">الاستاذ</h2>
            <p className="text-gray-600 mt-2">نظام إدارة الحضور الإلكتروني</p>
          </div>
        </div>

        <Card className="border-gradient bg-white/80 backdrop-blur-sm animate-slideInUp">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-blue-800">
              <LogIn className="h-5 w-5" />
              تسجيل الدخول
            </CardTitle>
            <CardDescription>أدخل بياناتك للوصول إلى النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ... حقول البريد وكلمة المرور ... */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <User className="h-4 w-4" /> البريد الإلكتروني
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="text-right"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" /> كلمة المرور
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="أدخل كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="text-right"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 ml-2" /> تسجيل الدخول
                  </>
                )}
              </Button>

            </form>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-600 space-y-2">
          {/* ⚠️ إضافة رابط التسجيل ⚠️ */}
          <p className="text-base">
            هل أنت طالب جديد؟ {" "}
            <Link to="/signup" className="text-purple-600 hover:text-blue-700 font-bold transition-colors duration-200">
                سجل حسابك الآن
            </Link>
          </p>
          <p>للدعم الفني: 01002470826</p>
          <p>© 2024 الاستاذ - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}

export default Login