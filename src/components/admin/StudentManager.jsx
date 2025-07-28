"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { ArrowRight, Plus, User, Mail, Key, MapPin, AlertCircle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const StudentManager = ({ onBack, students, onAddStudent, onRemoveStudent, availableLocations }) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    customId: "",
    parentPhone: "",
    location: "",
    grade: "first",
  })

  const { toast } = useToast()

  const handleAddStudent = () => {
    if (
      !newStudent.name ||
      !newStudent.email ||
      !newStudent.password ||
      !newStudent.customId ||
      !newStudent.parentPhone ||
      !newStudent.location
    ) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    if (students.some((s) => s.customId === newStudent.customId)) {
      toast({
        title: "خطأ",
        description: "رقم الطالب مستخدم بالفعل",
        variant: "destructive",
      })
      return
    }

    const student = {
      customId: newStudent.customId,
      name: newStudent.name,
      parentPhone: newStudent.parentPhone,
      location: newStudent.location,
      grade: newStudent.grade,
      registrationDate: new Date().toLocaleDateString("ar-EG"),
    }

    onAddStudent(student)
    setNewStudent({
      name: "",
      email: "",
      password: "",
      customId: "",
      parentPhone: "",
      location: "",
      grade: "first",
    })
    setShowAddForm(false)

    toast({
      title: "تم إنشاء الحساب",
      description: `تم تسجيل الطالب ${newStudent.name} بنجاح`,
    })
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setNewStudent({ ...newStudent, password })
  }

  const generateStudentId = () => {
    const lastId =
      students.length > 0 ? Math.max(...students.map((s) => Number.parseInt(s.customId.replace("ST", "")) || 0)) : 0
    const newId = `ST${String(lastId + 1).padStart(3, "0")}`
    setNewStudent({ ...newStudent, customId: newId })
  }

  const getGradeText = (grade) => {
    return grade === "first" ? "الأول الثانوي" : "الثاني الثانوي"
  }

  const getCurrentWeekAttendance = (student) => {
    const now = new Date()
    const currentWeek = getWeekKey(now)
    return student.weeklyAttendance?.[currentWeek] || false
  }

  const getWeekKey = (date) => {
    const year = date.getFullYear()
    const week = Math.ceil(((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + 1) / 7)
    return `${year}-W${week}`
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowRight className="h-4 w-4" />
            العودة
          </Button>
          <h1 className="text-2xl font-bold">إدارة الطلاب</h1>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          <Plus className="h-4 w-4 ml-2" />
          إضافة طالب جديد
        </Button>
      </div>

      {/* تنبيه حول نظام الحضور الأسبوعي */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800 font-semibold">نظام الحضور: كل طالب يمكنه حضور حصة واحدة فقط في الأسبوع</p>
          </div>
        </CardContent>
      </Card>

      {/* نموذج إضافة طالب */}
      {showAddForm && (
        <Card className="animate-fadeIn border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <User className="h-5 w-5" />
              إضافة طالب جديد
            </CardTitle>
            <CardDescription className="text-blue-600">أضف طالباً جديداً إلى النظام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم الطالب *</Label>
                <Input
                  id="name"
                  placeholder="أدخل اسم الطالب الكامل..."
                  value={newStudent.name}
                  onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customId">رقم الطالب *</Label>
                <div className="flex gap-2">
                  <Input
                    id="customId"
                    placeholder="ST001, ST002, ..."
                    value={newStudent.customId}
                    onChange={(e) => setNewStudent({ ...newStudent, customId: e.target.value.toUpperCase() })}
                  />
                  <Button type="button" variant="outline" onClick={generateStudentId}>
                    توليد
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentPhone">رقم ولي الأمر *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={newStudent.parentPhone}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  مكان الحضور *
                </Label>
                <Select
                  value={newStudent.location}
                  onValueChange={(value) => setNewStudent({ ...newStudent, location: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مكان الحضور" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@engineer-mohamed.com"
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  كلمة المرور *
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    placeholder="كلمة المرور..."
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    توليد
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">الصف الدراسي *</Label>
              <Select
                value={newStudent.grade}
                onValueChange={(value) => setNewStudent({ ...newStudent, grade: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الصف الدراسي" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first">الصف الأول الثانوي</SelectItem>
                  <SelectItem value="second">الصف الثاني الثانوي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddStudent} className="bg-blue-600 hover:bg-blue-700">
                إضافة الطالب
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                إلغاء
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* قائمة الطلاب */}
      <div className="grid gap-4">
        {students.map((student) => {
          const hasAttendedThisWeek = getCurrentWeekAttendance(student)
          return (
            <Card key={student.id} className="animate-fadeIn hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>
                        رقم: {student.customId} • {student.location}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{getGradeText(student.grade)}</Badge>
                    {hasAttendedThisWeek ? (
                      <Badge className="bg-green-500 text-white">حضر هذا الأسبوع</Badge>
                    ) : (
                      <Badge variant="outline">لم يحضر هذا الأسبوع</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>الهاتف: {student.parentPhone}</span>
                    <span>إجمالي الحضور: {student.attendanceCount} مرة</span>
                    <span>تاريخ التسجيل: {student.registrationDate}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      تعديل
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => onRemoveStudent(student.id)}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

export default StudentManager
