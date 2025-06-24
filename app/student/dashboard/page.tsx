"use client"

import { ProgressCards } from "@/components/student/progress-cards"
import { Achievements } from "@/components/student/achievements"
import { Leaderboard } from "@/components/student/leaderboard"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { CoursesList } from "@/components/courses-list"

export default function DashboardPage() {
  const { user } = useAuth()
  return (
    <div className="max-w-7xl mx-auto">

      {user!.enrolledCourses.length > 0 ? (<>
        <section className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user!.first_name}!</h1>
          <p className="text-gray-600">Continue your learning journey. You've been making great progress!</p>
        </section>
        <ProgressCards />

        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Active Courses</h2>
            <Link href="/student/courses" className="text-sm text-blue-600 hover:underline flex items-center">
              View all courses →
            </Link>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800">All Courses</h2>
            <p className="text-gray-600">Browse all enrolled courses</p>
          </div>

          <CoursesList courses={(user!.enrolledCourses).slice(0,3)} />


        </section>
        {/* <div className="mt-8 grid md:grid-cols-2 gap-6">
        <Achievements />
        <Leaderboard />
      </div> */}
      </>) : (<section>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Welcome {user!.first_name}!</h1>
          <p className="text-gray-600">Start your learning journey.</p>
        </div>
        <div className="text-center mt-20">
          <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full shadow-md mb-6">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">You haven’t enrolled in any courses yet</h2>
          <p className="text-gray-600 max-w-xl mx-auto mb-6">
            Discover a wide range of expertly designed courses. Learn at your own pace, grow your skills, and unlock new opportunities.
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
