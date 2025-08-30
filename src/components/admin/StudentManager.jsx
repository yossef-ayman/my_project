"use client"

import React, { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { User, Mail, Key, MapPin, Plus, ArrowRight, AlertCircle } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const StudentManager = ({ onBack, students, onAddStudent, onRemoveStudent, availableLocations }) => {
  const [showAddForm, setShowAddForm] = useState(false)
 const [newStudent, setNewStudent] = useState({
  name: "",
  email: "",
  password: "",
  phone: "",
  parentPhone: "",
  stdcode: "",
  place: "",
  grade: "first",
});


  const { toast } = useToast()

const handleAddStudent = async () => {
  const { name, email, password, phone, parentPhone, stdcode, grade, place } = newStudent;

  if (!name || !email || !password || !parentPhone || !stdcode || !grade || !place) {
    toast({
      title: "خطأ",
      description: "يرجى ملء جميع الحقول المطلوبة",
      variant: "destructive",
    });
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        phone,
        parentPhone,
        role: "student",
        stdcode,
        grade,
        place,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast({
        title: "فشل الإضافة",
        description: data.message || "فشل التسجيل",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "تم التسجيل",
      description: `تمت إضافة الطالب ${name} بنجاح`,
    });

    const student = {
      stdcode,
      name,
      phone,
      parentPhone,
      place,
      grade,
      registrationDate: new Date().toLocaleDateString("ar-EG"),
      attendanceCount: 0,
    };

    onAddStudent(student);

    setNewStudent({
      name: "",
      email: "",
      password: "",
      phone: "",
      parentPhone: "",
      stdcode: "",
      place: "",
      grade: "",
    });

    setShowAddForm(false);
  } catch (err) {
    console.error("Register Error:", err);
    toast({
      title: "خطأ في الاتصال",
      description: "فشل الاتصال بالسيرفر",
      variant: "destructive",
    });
  }
};

const handleDeleteStudent = async (id) => {
  try {
    const res = await fetch(`http://localhost:8080/users/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || "فشل في حذف الطالب");
      return;
    }

    // شيل الطالب من state
    onRemoveStudent(id);

  } catch (err) {
    console.error("Delete error:", err);
    alert("حصل خطأ في الاتصال بالسيرفر");
  }
};

  const generateStudentId = () => {
    const lastId =
      students.length > 0 ? Math.max(...students.map((s) => parseInt(s.stdcode?.replace("ST", "")) || 0)) : 0
    const newId = `ST${String(lastId + 1).padStart(3, "0")}`
    setNewStudent({ ...newStudent, stdcode: newId })
  }

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8)
    setNewStudent({ ...newStudent, password })
  }




  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="ghost">
          <ArrowRight className="w-4 h-4" /> العودة
        </Button>
        <Button onClick={() => setShowAddForm(true)} className="bg-gradient-to-r from-blue-500 to-purple-500">
          <Plus className="w-4 h-4 ml-2" />
          إضافة طالب جديد
        </Button>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 flex gap-2 items-center">
          <AlertCircle className="text-yellow-600" />
          <span className="text-yellow-800 font-semibold">كل طالب يمكنه الحضور مرة واحدة أسبوعياً</span>
        </CardContent>
      </Card>

      {showAddForm && (
  <Card className="border-blue-200 bg-blue-50 animate-fadeIn">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-blue-800">
        <User className="h-5 w-5" /> إضافة طالب جديد
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>اسم الطالب</Label>
          <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} />
        </div>
        <div>
          <Label>كود الطالب</Label>
          <div className="flex gap-2">
            <Input value={newStudent.stdcode} onChange={(e) => setNewStudent({ ...newStudent, stdcode: e.target.value.toUpperCase() })} />
            <Button type="button" onClick={generateStudentId}>توليد</Button>
          </div>
        </div>
        <div>
          <Label>البريد الإلكتروني</Label>
          <Input value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
        </div>
        <div>
          <Label>كلمة المرور</Label>
          <div className="flex gap-2">
            <Input value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} />
            <Button type="button" onClick={generatePassword}>توليد</Button>
          </div>
        </div>
        <div>
          <Label>رقم ولي الأمر</Label>
          <div>
            <Input value={newStudent.parentPhone} onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })} />
          </div>
        </div>
        <div>
          <Label>رقم الطالب</Label>
          <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
        </div>

        {/* خانة الصف الدراسى */}
        <div>
          <Label>الصف الدراسي</Label>
          <select
            className="w-full p-2 border rounded"
            value={newStudent.grade}
            onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
          >
            <option value="">اختر الصف</option>
            <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
            <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
            <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
          </select>
        </div>

        {/* خانة المكان */}
        <div>
          <Label>المكان</Label>
          <select
            className="w-full p-2 border rounded"
            value={newStudent.place}
            onChange={(e) => setNewStudent({ ...newStudent, place: e.target.value })}
          >
            <option value="">اختر المكان</option>
            <option value="المعمل">المعمل</option>
            <option value="المدرج">المدرج</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleAddStudent}>إضافة</Button>
        <Button variant="outline" onClick={() => setShowAddForm(false)}>إلغاء</Button>
      </div>
    </CardContent>
  </Card>
)}

      <div className="grid gap-4">
  {students.map((s) => (
    <Card key={s.stdcode}>
      <CardHeader>
        <CardTitle>{s.name}</CardTitle>
        <CardDescription>{s.stdcode} • {s.place}</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-between">
        <div>
          <p>الهاتف: {s.parentPhone}</p>
          <p>الحضور: {s.attendanceCount} مرة</p>
          <p>تاريخ التسجيل: {s.registrationDate}</p>
        </div>
        <Button onClick={() => handleDeleteStudent(s._id)} variant="outline"className="text-red-600">
  حذف
</Button>
      </CardContent>
    </Card>
  ))}
</div>

    </div>
  )
}

export default StudentManager
