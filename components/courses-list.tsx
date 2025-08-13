"use client"

import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Star, Clock, Users, BookOpen, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Course, ModuleTopic, ProgramModule } from "@/types/course"
import { useAuth } from "@/contexts/auth-context"
import { GlobalVariables } from "@/globalVariables"
import { usePathname } from "next/navigation"

export function CoursesList({ courses }: { courses: Course[] | null }) {
  const { user } = useAuth()
  const pathname = usePathname()
  const enrolledCourseIDs = user?.enrolledCourseIDs || {}
  const learnerCompletedTopics = user?.completedTopics || {}

  function CourseDetail(totalModules: ProgramModule[]) {
    let topics = 0,
      completedTopics = 0
    totalModules.forEach((prop: ProgramModule) => {
      topics += prop.module.moduleTopics.length
      completedTopics += prop.module.moduleTopics.filter((prop: ModuleTopic) =>
        learnerCompletedTopics[Number(prop.topicId)],
      ).length
    })
    return { modules: totalModules.length, topics, progress: Math.round((completedTopics / topics) * 100) }
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {courses!.map((course) => {
        const { modules, topics, progress } = CourseDetail(course.programModules)
        if (!(pathname?.startsWith("/dashboard") && progress == 100) && !(pathname?.startsWith("/student/courses") && !enrolledCourseIDs[Number(course.id)]))  
          return (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="h-80 relative bg-gray-100">
                {course.image ? (
                  <Image
                    src={course.image || "/placeholder.svg"}
                    alt={course.title}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-white opacity-50" />
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-yellow-500 text-yellow-900 hover:bg-yellow-500">⭐ Featured</Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  {course.level ? (
                    <Badge variant="outline" className="text-xs">
                      {course.level}
                    </Badge>
                  ) : null}
                  {course.rating ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="font-medium">{course.rating}</span>
                      <Users className="h-4 w-4 mx-1" />
                      <span className="ml-1">({course.enrollments.length})</span>
                    </div>
                  ) : null}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center mb-4">
                  <div className="relative w-8 h-8 mr-3">
                    <Image
                      src={course.instructorAvatar || "/placeholder.svg?height=32&width=32"}
                      alt={course.instructor}
                      fill
                      className="rounded-full object-cover object-top"
                      sizes="32px"
                    />
                  </div>
                  <span className="text-sm text-gray-700 font-medium">{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  {course.totalTimeLimit && (
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{course.totalTimeLimit} hours</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <BookOpen className="h-4 w-4 mr-1" />
                    <span>{modules} modules</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>{topics} topics</span>
                  </div>
                </div>
               
                  <>
                    {enrolledCourseIDs[Number(course.id)] ? (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium text-blue-600">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2  [&>div]:bg-blue-600" />
                      </div>
                    ) : (
                      <div className="text-sm text-blue-600 mb-3">Not started</div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-gray-900">
                        {!enrolledCourseIDs[Number(course.id)] && <span>₹ {course.price!}</span>}
                      </div>
                      {enrolledCourseIDs[Number(course.id)] ? (
                        <Link href={`/courses/${course.id}`}>
                          <Button className="bg-violet-600 hover:bg-violet-700">Continue Learning</Button>
                        </Link>
                      ) : (
                        <Link href={`/payment/${course.id}`}>
                          <Button className="bg-green-600 hover:bg-green-700">Enroll Now</Button>
                        </Link>
                      )}
                    </div>
                  </>
                
              </CardContent>
            </Card>
          )
      })}
    </div>
  )
}
