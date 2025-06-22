"use client"

import { useState, useEffect } from "react"
import { Code, Palette, Database, Smartphone, Brain, TrendingUp, ArrowRight, Award, BookOpen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import type { Course } from "@/types"
import { CoursesList } from "@/components/courses-list"

export default function HomePage() {
  const router = useRouter()

  // Add state for courses
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<{ category: string }[]>([])
  const [loading, setLoading] = useState(true)

  // Add useEffect to fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [{ data: coursesData }, { data: categoriesData }] = await Promise.all([
          fetch("api/courses").then((res) => res.json()),
          fetch("/courses/categories").then((res) => res.json()),
        ])

        setCourses(coursesData)

        // Map categories with icons and colors
        const categoryIcons = {
          "Web Development": { icon: Code, color: "bg-blue-500" },
          "UI/UX Design": { icon: Palette, color: "bg-purple-500" },
          "Data Science": { icon: Database, color: "bg-green-500" },
          "Mobile Development": { icon: Smartphone, color: "bg-orange-500" },
          "Machine Learning": { icon: Brain, color: "bg-red-500" },
          "Digital Marketing": { icon: TrendingUp, color: "bg-pink-500" },
        } as const

        const mappedCategories = categoriesData.map((prop: { category: string }) => {
          const key = prop.category as keyof typeof categoryIcons
          return {
            name: prop.category,
            icon: categoryIcons[key]?.icon || Code,
            color: categoryIcons[key]?.color || "bg-gray-500",
          }
        })

        setCategories(mappedCategories)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/courses/search/${encodeURIComponent(categoryName.toLowerCase().replace(/\s+/g, "-"))}`)
  }

  const handleBrowseCatalog = () => {
    router.push("/courses/search/")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-20 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">Learn Without Limits</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Start, switch, or advance your career with thousands of courses from world-class instructors. Join
              millions of learners worldwide.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                className="bg-white text-blue-600 cursor-default hover:bg-gray-100 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300"
                onClick={handleBrowseCatalog}
              >
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Catalog
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">95%</span>
                </div>
                <p className="text-blue-200">Success Rate</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">10K+</span>
                </div>
                <p className="text-blue-200">Online Courses</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Award className="h-8 w-8 text-blue-200 mr-2" />
                  <span className="text-3xl font-bold">500+</span>
                </div>
                <p className="text-blue-200">Expert Instructors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of categories and start your learning journey today
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category: any) => (
              <Card
                key={category.name}
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md group"
                onClick={() => handleCategoryClick(category.name)}
              >
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <category.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Available Courses</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover our most popular courses taught by industry experts
            </p>
          </div>

          {loading ? (
            <div className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="overflow-hidden shadow-md">
                    <div className="h-48 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-3" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-3/4" />
                      <div className="flex justify-between items-center">
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <CoursesList courses={courses} />
          )}
        </section>
      </div>
    </div>
  )
}
