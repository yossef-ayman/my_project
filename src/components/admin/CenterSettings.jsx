"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Badge } from "../ui/badge"
import { ArrowRight, MapPin, Calendar, Plus, X } from "lucide-react"
import { useToast } from "../../hooks/use-toast"

const CenterSettings = ({ availableLocations, availableDays, onUpdateLocations, onUpdateDays, onBack }) => {
  const [newLocation, setNewLocation] = useState("")
  const [newDay, setNewDay] = useState("")
  const { toast } = useToast()

  const addLocation = () => {
    const loc = newLocation.trim()
    if (!loc) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم المكان", variant: "destructive" })
      return
    }
    if (availableLocations.includes(loc)) {
      toast({ title: "خطأ", description: "هذا المكان موجود بالفعل", variant: "destructive" })
      return
    }
    onUpdateLocations([...availableLocations, loc])
    setNewLocation("")
    toast({ title: "تم الإضافة", description: `تم إضافة المكان: ${loc}` })
  }

  const removeLocation = (location) => {
    onUpdateLocations(availableLocations.filter((l) => l !== location))
    toast({ title: "تم الحذف", description: `تم حذف المكان: ${location}` })
  }

  const addDay = () => {
    const day = newDay.trim()
    if (!day) {
      toast({ title: "خطأ", description: "يرجى إدخال اسم اليوم", variant: "destructive" })
      return
    }
    if (availableDays.includes(day)) {
      toast({ title: "خطأ", description: "هذا اليوم موجود بالفعل", variant: "destructive" })
      return
    }
    onUpdateDays([...availableDays, day])
    setNewDay("")
    toast({ title: "تم الإضافة", description: `تم إضافة اليوم: ${day}` })
  }

  const removeDay = (day) => {
    onUpdateDays(availableDays.filter((d) => d !== day))
    toast({ title: "تم الحذف", description: `تم حذف اليوم: ${day}` })
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>
        <h1 className="text-2xl font-bold">إعدادات المركز</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* إدارة الأماكن */}
        <Card className="animate-fadeIn border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              إدارة الأماكن
            </CardTitle>
            <CardDescription>إضافة وحذف أماكن الحضور المتاحة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="اسم المكان الجديد"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addLocation()}
              />
              <Button
                onClick={addLocation}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>الأماكن المتاحة:</Label>
              <div className="flex flex-wrap gap-2">
                {availableLocations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد أماكن مضافة بعد</p>
                ) : (
                  availableLocations.map((location) => (
                    <Badge key={location} variant="secondary" className="flex items-center gap-1">
                      {location}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeLocation(location)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* إدارة الأيام */}
        <Card className="animate-fadeIn border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              إدارة أيام التسجيل
            </CardTitle>
            <CardDescription>تحديد الأيام المتاحة لتسجيل الحضور</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="اسم اليوم (مثل: السبت، الأحد)"
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addDay()}
              />
              <Button
                onClick={addDay}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>الأيام المتاحة:</Label>
              <div className="flex flex-wrap gap-2">
                {availableDays.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد أيام مضافة بعد</p>
                ) : (
                  availableDays.map((day) => (
                    <Badge key={day} variant="secondary" className="flex items-center gap-1">
                      {day}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeDay(day)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* إضافة سريعة لأيام الأسبوع */}
      <Card className="animate-fadeIn border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle>إضافة سريعة لأيام الأسبوع</CardTitle>
          <CardDescription>انقر على الأيام لإضافتها أو حذفها بسرعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"].map((day) => (
              <Button
                key={day}
                variant={availableDays.includes(day) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (availableDays.includes(day)) removeDay(day)
                  else onUpdateDays([...availableDays, day])
                }}
              >
                {day}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CenterSettings
