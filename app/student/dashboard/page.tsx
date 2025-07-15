"use client"

import { ProgressCards } from "@/components/student/progress-cards"
import { Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { CoursesList } from "@/components/courses-list"
import type { ProgramModule } from "@/types/course"
import { Achievements } from "@/components/student/achievements"
import { Leaderboard } from "@/components/student/leaderboard"

export default function DashboardPage() {
  const { user } = useAuth()
  const completedTopics = new Set(user?.completedTopics || [])
  let totalModules= 0, totalTopics=0;
  // Fix the filtering logic for active courses
  const activeCourses = (user!.enrolledCourses || []).filter((course) => {
    totalModules+=course.programModules.length;
    return course.programModules.some((programModule: ProgramModule) => {
      totalTopics+=programModule.module.moduleTopics.length;
      return programModule.module.moduleTopics.some((prop) => !completedTopics.has(prop.topicId))
    })
  })

  let moduleProgress={modules:totalModules, completed:user!.completedModules.length||0}
  let topicProgress={topics:totalTopics, completed:user!.completedTopics.length||0}
  let courseProgress={courses:user!.enrolledCourses.length, completed:user!.enrolledCourses.length-activeCourses.length}
  
  return (
    <div className="max-w-7xl mx-auto">
      {user!.enrolledCourses.length > 0 ? (
        <>
          <section className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user!.first_name}!</h1>
            <p className="text-gray-600">Continue your learning journey. You've been making great progress!</p>
          </section>

          <ProgressCards courseProgress={courseProgress} moduleProgress={moduleProgress} topicProgress={topicProgress}/>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Active Courses</h2>
              <Link href="/student/courses" className="text-sm text-blue-600 hover:underline flex items-center">
                View all courses →
              </Link>
            </div>

            {activeCourses.length > 0 ? (
              <CoursesList courses={activeCourses} />
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="inline-block bg-gradient-to-br from-green-500 to-blue-600 p-3 rounded-full shadow-md mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">All caught up!</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-4">
                  Congratulations! You've completed all your enrolled courses. Check back later for
                  new content or explore more courses.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/student/courses">
                    <Button variant="outline" className="w-full sm:w-auto bg-transparent">
                      View All Completed Courses
                    </Button>
                  </Link>
                  <Link href="/student">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                      Browse New Courses
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </section>

         {/* Uncomment when ready to use
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <Achievements />
            <Leaderboard />
          </div>
          */}
        </>
      ) : (
        <section>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome {user!.first_name}!</h1>
            <p className="text-gray-600">Start your learning journey.</p>
          </div>
          <div className="text-center mt-20">
            <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-md mb-6">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">You haven't enrolled in any courses yet</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              Discover a wide range of expertly designed courses. Learn at your own pace, grow your skills, and unlock
              new opportunities.
            </p>
            <Link href="/student">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Courses
              </Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
