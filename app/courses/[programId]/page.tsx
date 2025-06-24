"use client"

import { Clock, ArrowLeft, FileText, Award } from "lucide-react"
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { use, useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import Loading from "./loading"
import { useCourses } from "@/contexts/course-context"

export default function CourseDetail({ params }: { params: Promise<{ programId: string }> }) {
  const { toast } = useToast()
  const { programId } = use(params)
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [courseData, setCourseData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const {filterCategory, setFilterCategory} = useCourses();

  useEffect(() => {
    if(filterCategory)
     setFilterCategory(""); 
    async function fetchCourse() {
      if (!programId) return

      setIsLoading(true)
      try {
        console.log("Fetching course for programId:", programId)
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

  // Show loading state
  if (isLoading) {
    return <Loading />
  }

  // Show error state if no course data
  if (!courseData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or couldn't be loaded.</p>
          <Link href="/student/courses" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to courses
          </Link>
        </div>
      </div>
    )
  }
  courseData.programModules.sort((a: any, b: any) => a.position - b.position);
  const courseModules =
    courseData.programModules.map((prop: any) => prop.module)

  console.log(courseModules);
  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Hero Section with Cover Image */}
      <div
        className="relative rounded-xl overflow-hidden mb-8 bg-gradient-to-r from-gray-800 to-gray-900 h-64 flex items-end"
        style={{
          backgroundImage: courseData.image
            ? `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url(${courseData.image})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
        <div className="relative z-10 p-6 w-full">
          <Link
            href="/student/courses"
            className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-4 bg-gray-800/50 px-3 py-1 rounded-full"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to courses
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{courseData.title || "Course Title"}</h1>
          <div className="flex items-center text-gray-300 space-x-4">
            {courseData.total_time_limit && (
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{courseData.total_time_limit}</span>
              </div>
            )}
            {courseData.rating && (
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-1" />
                <span>{courseData.rating} Rating</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Course Description */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
            <p className="text-gray-700">{courseData.description || "No description available."}</p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-500 mb-1">Total Topics</div>
                <div className="text-xl font-semibold">{courseModules.reduce(
                  (acc: Number, prop: any) => acc + prop.moduleTopics.length,
                  0
                ) || 0}</div>
              </div>
            </div>
          </div>

          {/* Course Modules */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Course Modules</h2>

            {courseModules.length > 0 ? (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={activeModule || undefined}
                onValueChange={setActiveModule}
              >
                {courseModules.map((module: any, index: number) => (
                  <AccordionItem
                    key={module.id}
                    value={module.id}
                    className="border border-gray-200 rounded-lg mb-4 overflow-hidden"
                  >
                    <AccordionTrigger className="hover:bg-gray-50 px-4 py-4 rounded-t-lg data-[state=open]:border-b data-[state=open]:border-gray-200">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center">
                          <div className="bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-gray-700">
                            {index + 1}
                          </div>
                          <span className="font-medium">{module.title}</span>
                        </div>
                        {/* <Badge
                        variant={module.progress === 100 ? "success" : "outline"}
                        className={`ml-2 ${module.progress === 100 ? "bg-green-100 text-green-800" : ""}`}
                      >
                        {module.progress}%
                      </Badge> */}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 py-3 bg-gray-50">
                      <div className="space-y-3">
                        {module.moduleTopics.sort((a: any, b: any) => a.position - b.position).map((prop: any) => (
                          <Link href={`/courses/${courseData.id}/${module.id}/${prop.topic.id}`}> <Card
                            key={prop.topic.id}
                            className={`p-3 hover:bg-white transition-colors cursor-pointer border ${prop.topic.completed ? "border-green-200 bg-green-50/30" : "border-gray-200"
                              }`}

                          >
                            <CardContent className="p-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  {prop.topic.topicResources[0].resource.resourceType === "document" ? (
                                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                                  ) : (
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                  )}
                                  <span className="text-sm font-medium">{prop.topic.title}</span>
                                </div>
                                <div className="flex items-center">
                                  {/* <span className="text-xs text-gray-500 mr-2">{topic.duration}</span> */}
                                  {/* {topic.completed && <CheckCircle className="h-4 w-4 text-green-500" />} */}
                                </div>
                              </div>
                            </CardContent>
                          </Card></Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-gray-500 text-center py-8">No modules available for this course.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Instructor Card */}
          {courseData.instructor && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Instructor</h3>
              <div className="flex items-center">
                <img
                  src={courseData.instructorAvatar || "/placeholder.svg?height=48&width=48"}
                  alt={courseData.instructor}
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-medium">{courseData.instructor}</h4>
                </div>
              </div>
            </div>
          )}

          {/* Course Stats */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Course Stats</h3>
            <div className="space-y-4">
              {courseData.enrollments.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Students Enrolled</span>
                  <span className="font-medium">{courseData.enrollments.length}</span>
                </div>
              )}
              {courseData.total_time_limit && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Duration</span>
                  <span className="font-medium">{courseData.total_time_limit}</span>
                </div>
              )}
              {courseData.rating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <div className="flex items-center">
                    <span className="font-medium mr-1">{courseData.rating}</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(courseData.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
