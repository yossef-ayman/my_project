"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { LogIn, User, Lock, GraduationCap } from "lucide-react"
import { useToast } from "../hooks/use-toast"

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // محاكاة تسجيل الدخول
    setTimeout(() => {
      if (email === "admin@engineer-mohamed.com" && password === "admin123") {
        onLogin({
          email,
          role: "admin",
          name: "المدير",
        })
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في لوحة الإدارة",
        })
      } else if (email === "student1@engineer-mohamed.com" && password === "123456") {
        onLogin({
          email,
          role: "student",
          name: "أحمد محمد",
        })
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: "مرحباً بك في بوابة الطالب",
        })
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
          variant: "destructive",
        })
      }
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* شعار وعنوان */}
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto animate-glow">
            <GraduationCap className="h-10 w-10 text-white animate-wiggle" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gradient text-glow">أستاذ المهندسين</h1>
            <h2 className="text-2xl font-bold text-purple-800">محمد الإبراشي</h2>
            <p className="text-gray-600 mt-2">نظام إدارة الحضور الإلكتروني</p>
          </div>
        </div>

        {/* نموذج تسجيل الدخول */}
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
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  البريد الإلكتروني
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
                  <Lock className="h-4 w-4" />
                  كلمة المرور
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
                    <LogIn className="h-4 w-4 ml-2" />
                    تسجيل الدخول
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* بيانات تجريبية */}
        <Card className="border-yellow-200 bg-yellow-50/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-yellow-800 text-lg">بيانات تجريبية</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="font-semibold text-blue-800">حساب المدير:</p>
              <p className="text-sm">البريد: admin@engineer-mohamed.com</p>
              <p className="text-sm">كلمة المرور: admin123</p>
            </div>
            <div className="p-3 bg-white/70 rounded-lg">
              <p className="font-semibold text-green-800">حساب الطالب:</p>
              <p className="text-sm">البريد: student1@engineer-mohamed.com</p>
              <p className="text-sm">كلمة المرور: 123456</p>
            </div>
          </CardContent>
        </Card>

        {/* معلومات التواصل */}
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>للدعم الفني: 01002470826</p>
          <p>© 2024 أستاذ المهندسين محمد الإبراشي - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  )
}

export default Login
