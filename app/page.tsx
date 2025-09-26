"use client"
import { TrendingUp, ArrowRight, Award, BookOpen, Code, Palette, Database, BarChartBig, Brain, Megaphone, Smartphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { CoursesList } from "@/components/courses-list"
import { useCourses } from "@/contexts/course-context"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
 const categoryIcons = {
    "Web Development": { icon: Code, color: "bg-blue-500" },
    "UI/UX Design": { icon: Palette, color: "bg-purple-500" },
    "Database": { icon: Database, color: "bg-green-500" },
    "Data Science": { icon: BarChartBig, color: "bg-green-500" },
    "Machine Learning": { icon: Brain, color: "bg-red-500" },
    "Digital Marketing": { icon: Megaphone, color: "bg-orange-500" },
    "Mobile Development": { icon: Smartphone, color: "bg-orange-500" },
  } as const;


export default function HomePage() {
  const router = useRouter()
  const { courses, categories, filterCategory, setFilterCategory } = useCourses();
 const {isLoading} = useAuth();

  const handleCategoryClick = (categoryName: string) => {
    console.log(categoryName);
    setFilterCategory(categoryName);
    router.push("/courses/search/");
  }

  const handleBrowseCatalog = () => {
    if (filterCategory)
      setFilterCategory("");
    router.push("/courses/search/")
  }
   return (
    <div className=" bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
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
                size="lg"
                className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
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
      </section>

      <div className="max-w-7xl mx-auto py-12">
        {/* Categories */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Explore by Category</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose from our wide range of categories and start your learning journey today
            </p>
          </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat: { category: string }) => {
              const Icon = categoryIcons[cat.category as keyof typeof categoryIcons].icon || Code;
              console.log(Icon);
              return (
                <Card
                  key={cat.category}
                  className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-md group"
                  onClick={() => handleCategoryClick(cat.category)}
                >
                  <CardContent className="p-6 text-center">

                    <div
                      className={`w-16 h-16 ${categoryIcons[cat.category as keyof typeof categoryIcons].color ?? 'red'} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {cat.category}
                    </h3>
                  </CardContent>
                </Card>
              )
            })}

          </div>
          
        </section>

        {/* Featured Courses */}
        <section>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Available Courses</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover our most popular courses taught by industry experts
              </p>
            </div>

            <Link href="/courses/search" className="text-lg text-blue-600 hover:underline flex items-center max-sm:hidden">
              View all courses →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="border border-gray-200 rounded-xl bg-white p-4 space-y-3"
                >
                  {/* Top badge */}
                  <div className="h-4 w-20 bg-black opacity-10 rounded" />
                  {/* Level and rating */}
                  <div className="h-4 w-16 bg-black opacity-10 rounded" />
                  {/* Title */}
                  <div className="h-5 w-3/4 bg-black opacity-10 rounded" />
                  {/* Description */}
                  <div className="h-3 w-full bg-black opacity-10 rounded" />
                  {/* Instructor */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-8 rounded-full bg-black opacity-10" />
                    <div className="h-3 w-20 bg-black opacity-10 rounded" />
                  </div>
                  {/* Stats */}
                  <div className="flex justify-between text-sm">
                    <div className="h-3 w-8 bg-black opacity-10 rounded" />
                    <div className="h-3 w-8 bg-black opacity-10 rounded" />
                    <div className="h-3 w-8 bg-black opacity-10 rounded" />
                  </div>
                  {/* Button */}
                  <div className="h-6 w-24 bg-black opacity-10 rounded-full mt-4 ml-auto" />
                </div>
              ))}
            </div>
          ) : (<>
            <CoursesList courses={courses!.slice(0,3)} />
            <Link href="/courses/search" className="text-lg text-blue-600 hover:underline flex items-center justify-center md:hidden mt-4">
              View all courses →
            </Link>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

