"use client"
import { Clock, ArrowLeft, FileText, Award, CheckCircle, Users, BookOpen, Star } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { use, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import Loading from "./loading"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

export default function CourseDetail({
  params,
  searchParams,
}: { params: Promise<{ programId: string }>; searchParams: Promise<{ [enrolled: string]: string | undefined }> }) {
  const { toast } = useToast()
  const { programId } = use(params)
  const { enrolled } = use(searchParams)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [courseData, setCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchCourse() {
      if (!programId) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/courses/${programId}`)
        if (!res.ok) {
          throw new Error(`Failed to fetch course: ${res.status}`)
        }
        const data = await res.json()
        console.log("Course data:", data.data)
        setCourseData(data.data)
      } catch (err: any) {
        console.error("Error fetching course:", err)
        toast({
          title: "Error",
          description: err.message || "Failed to load course data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }
    fetchCourse()
  }, [programId, toast])

  useEffect(() => {
    if (enrolled === "true") {
      toast({
        title: "Enrollment Successful",
        description: (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>You have successfully enrolled in the course.</span>
          </div>
        ),
      })
      if (refreshUser) {
        refreshUser()
      }
      const url = new URL(window.location.href)
      url.searchParams.delete("enrolled")
      router.replace(url.pathname, { scroll: false })
    }
  }, [enrolled, refreshUser, toast, router])

  if (isLoading) {
    return <Loading />
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 py-8 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or couldn't be loaded.</p>
            <Link
              href="/student/courses"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Link>
          </div>
        </div>
      </div>
    )
  }

  courseData.programModules.sort((a: any, b: any) => a.position - b.position)
  const courseModules = courseData.programModules.map((prop: any) => prop.module)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Enhanced Hero Section */}
        <div
          className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl"
          style={{
            backgroundImage: courseData.image
              ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${courseData.image})`
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: "320px",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="relative z-10 p-8 h-full flex flex-col justify-end">
            <Link
              href="/student/courses"
              className="inline-flex items-center text-sm text-white/90 hover:text-white mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all hover:bg-white/20 w-fit"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to courses
            </Link>
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                {courseData.title || "Course Title"}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                {courseData.total_time_limit && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="h-5 w-5 mr-2" />
                    <span className="font-medium">{courseData.total_time_limit}</span>
                  </div>
                )}
                {courseData.rating && (
                  <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{courseData.rating} Rating</span>
                  </div>
                )}
                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <BookOpen className="h-5 w-5 mr-2" />
                  <span className="font-medium">{courseModules.length} Modules</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Course Description Card */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">About This Course</h2>
                </div>
                <p className="text-gray-700 leading-relaxed text-lg mb-8">
                  {courseData.description || "No description available."}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {courseModules.reduce((acc: number, prop: any) => acc + prop.moduleTopics.length, 0) || 0}
                    </div>
                    <div className="text-sm font-medium text-blue-800">Total Topics</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600 mb-2">{courseModules.length}</div>
                    <div className="text-sm font-medium text-purple-800">Modules</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
                    <div className="text-3xl font-bold text-green-600 mb-2">{courseData.enrollments?.length || 0}</div>
                    <div className="text-sm font-medium text-green-800">Students</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Course Modules */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
                </div>
                {courseModules.length > 0 ? (
                  <Accordion
                    type="single"
                    collapsible
                    className="w-full space-y-4"
                    value={activeModule || undefined}
                    onValueChange={setActiveModule}
                  >
                    {courseModules.map((module: any, moduleIndex: number) => (
                      <AccordionItem
                        key={module.id}
                        value={module.id}
                        className="border-0 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl overflow-hidden shadow-sm"
                      >
                        <AccordionTrigger className="hover:bg-white/50 px-6 py-4 rounded-xl transition-all duration-200 [&[data-state=open]]:bg-white/70">
                          <div className="flex items-center justify-between w-full pr-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4 text-white font-bold">
                                {moduleIndex + 1}
                              </div>
                              <div className="text-left">
                                <h3 className="font-semibold text-gray-900 text-lg">{module.title}</h3>
                              </div>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                              {module.moduleTopics.length} Topics
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-6">
                          <div className="bg-white/50 rounded-lg p-4 mb-6">
                            <p className="text-gray-600 leading-relaxed">{module.description}</p>
                          </div>
                          <div className="space-y-6">
                            {module.moduleTopics
                              .sort((a: any, b: any) => a.position - b.position)
                              .map((prop: any, topicIndex: number) => {
                                const colors = [
                                  {
                                    bg: "bg-gradient-to-r from-red-500 to-pink-500",
                                    border: "border-red-200",
                                    cardBg: "bg-gradient-to-r from-red-50 to-pink-50",
                                    shadow: "shadow-red-100",
                                  },
                                  {
                                    bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
                                    border: "border-orange-200",
                                    cardBg: "bg-gradient-to-r from-orange-50 to-yellow-50",
                                    shadow: "shadow-orange-100",
                                  },
                                  {
                                    bg: "bg-gradient-to-r from-yellow-500 to-amber-500",
                                    border: "border-yellow-200",
                                    cardBg: "bg-gradient-to-r from-yellow-50 to-amber-50",
                                    shadow: "shadow-yellow-100",
                                  },
                                  {
                                    bg: "bg-gradient-to-r from-teal-500 to-cyan-500",
                                    border: "border-teal-200",
                                    cardBg: "bg-gradient-to-r from-teal-50 to-cyan-50",
                                    shadow: "shadow-teal-100",
                                  },
                                  {
                                    bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
                                    border: "border-blue-200",
                                    cardBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                                    shadow: "shadow-blue-100",
                                  },
                                  {
                                    bg: "bg-gradient-to-r from-purple-500 to-violet-500",
                                    border: "border-purple-200",
                                    cardBg: "bg-gradient-to-r from-purple-50 to-violet-50",
                                    shadow: "shadow-purple-100",
                                  },
                                ]
                                const colorScheme = colors[topicIndex % colors.length]

                                return (
                                  <Link
                                    key={prop.topic.id}
                                    href={`/courses/${courseData.id}/${module.id}/${prop.topic.id}`}
                                  >
                                    <div className="flex cursor-pointer mb-4">
                                      {/* Enhanced Timeline Circle and Line */}
                                      <div className="flex items-center flex-col mr-6">
                                        <div
                                          className={`p-3 rounded-full ${colorScheme.bg} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 ${colorScheme.shadow}`}
                                        >
                                          {prop.topic.topicResources[0]?.resource.resourceType === "document" ? (
                                            <FileText className="h-6 w-6" />
                                          ) : (
                                            <Clock className="h-6 w-6" />
                                          )}
                                        </div>
                                        {topicIndex < module.moduleTopics.length - 1 && (
                                          <div className="w-1 h-full bg-gradient-to-b from-gray-300 to-gray-200 mt-3 rounded-full"></div>
                                        )}
                                      </div>

                                      {/* Enhanced Content Card */}
                                      <div
                                        className={`flex-1 ${colorScheme.cardBg} ${colorScheme.border} border-2 rounded-xl p-6 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 ${prop.topic.completed ? "ring-2 ring-green-400 ring-offset-2" : ""} ${colorScheme.shadow}`}
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <h4 className="font-bold text-gray-900 text-lg leading-tight pr-4">
                                            {prop.topic.title}
                                          </h4>
                                          {prop.topic.completed && (
                                            <div className="bg-green-100 p-2 rounded-full">
                                              <CheckCircle className="h-5 w-5 text-green-600" />
                                            </div>
                                          )}
                                        </div>
                                        {prop.topic.description ? (
                                          <p className="text-gray-700 leading-relaxed text-base">
                                            {prop.topic.description}
                                          </p>
                                        ) : (
                                          <p className="text-gray-500 italic text-base">No description available</p>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                )
                              })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No modules available for this course.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Enhanced Instructor Card */}
            {courseData.instructor && (
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Instructor</h3>
                  </div>
                  <div className="flex items-center">
                    <img
                      src={courseData.instructorAvatar || "/placeholder.svg?height=56&width=56"}
                      alt={courseData.instructor}
                      className="w-14 h-14 rounded-full mr-4 object-cover border-3 border-white shadow-lg"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">{courseData.instructor}</h4>
                      <p className="text-gray-600 text-sm">Course Instructor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Course Stats */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                    <Award className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Course Stats</h3>
                </div>
                <div className="space-y-6">
                  {courseData.enrollments?.length > 0 && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                      <div className="flex items-center">
                        <Users className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-gray-700 font-medium">Students Enrolled</span>
                      </div>
                      <span className="font-bold text-blue-600 text-lg">{courseData.enrollments.length}</span>
                    </div>
                  )}
                  {courseData.total_time_limit && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 text-purple-600 mr-2" />
                        <span className="text-gray-700 font-medium">Total Duration</span>
                      </div>
                      <span className="font-bold text-purple-600 text-lg">{courseData.total_time_limit}</span>
                    </div>
                  )}
                  {courseData.rating && (
                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-gray-700 font-medium">Rating</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-bold text-yellow-600 text-lg mr-2">{courseData.rating}</span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < Math.floor(courseData.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
