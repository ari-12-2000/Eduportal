"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search, Filter, X, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { CoursesList } from "@/components/courses-list"
import { Course } from "@/types/course"
import { useCourses } from "@/contexts/course-context"
import { Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface FilterState {
  priceRange: [number, number]
  categories: string[]
  levels: string[]
  ratings: string
  duration: string[]
}

const defaultFilterState: FilterState = {
  priceRange: [0, 500],
  categories: [],
  levels: [],
  ratings: "",
  duration: [],
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const { courses, filterCategory } = useCourses()

  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [filters, setFilters] = useState<FilterState>(defaultFilterState)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const categories = [
    "Web Development",
    "UI/UX Design",
    "Data Science",
    "Database",
    "Machine Learning",
    "Digital Marketing",
  ]

  const levels = ["Beginner", "Intermediate", "Advanced"]
  const router = useRouter();
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchTerm(query)
  }, [searchParams])

  useEffect(() => {
    if (!courses) return

    const initialFilters = {
      ...defaultFilterState, // copies all fields, including array references
      categories: [...defaultFilterState.categories], // deep copy array
      levels: [...defaultFilterState.levels],         // deep copy array
      duration: [...defaultFilterState.duration],    // deep copy array
    }

    if (filterCategory) {
      initialFilters.categories = [filterCategory]
    }

    setFilters(initialFilters)
    setFilteredCourses(courses)

  }, [courses, filterCategory])

  useEffect(() => {
    if (!courses) return

    let result = [...courses]

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase()
      result = result.filter((course) =>
        [course.title, course.instructor, course.description, course.category].some((field) =>
          field?.toLowerCase().includes(search),
        ),
      )
    }

    result = result.filter((course) => {
      const price = parseFloat(course.price || "0")
      return price >= filters.priceRange[0] && price <= filters.priceRange[1]
    })

    if (filters.categories.length > 0) {
      result = result.filter((course) => filters.categories.includes(course.category))
    }

    if (filters.levels.length > 0) {
      result = result.filter((course) => course.level && filters.levels.includes(course.level))
    }

    if (filters.ratings) {
      const minRating = parseInt(filters.ratings)
      result = result.filter((course) => parseFloat(String(course.rating ?? "0")) >= minRating)
    }

    setFilteredCourses(result)
  }, [courses, filters, searchTerm])


  const handleSearch = (e: React.FormEvent) => e.preventDefault()

  const handleCheckboxChange = (key: keyof FilterState, value: string, checked: boolean) => {
    setFilters((prev) => {
      const prevValue = prev[key]
      if (Array.isArray(prevValue)) {
        return {
          ...prev,
          [key]: checked ? [...prevValue, value] : prevValue.filter((v) => v !== value),
        }
      }
      return prev
    })
  }

  const handlePriceChange = (value: number[]) => {
    setFilters((prev) => ({ ...prev, priceRange: [value[0], value[1]] }))
  }

  const clearFilters = () => {
    setFilters({
      ...defaultFilterState,
      categories: [...defaultFilterState.categories],
      levels: [...defaultFilterState.levels],
      duration: [...defaultFilterState.duration],
    })
  }



 return (
  <div className="flex min-h-screen bg-gray-50">
    {/* Mobile Filter Button */}
    <Button
      variant="outline"
      size="sm"
      className="fixed top-4 left-4 z-50 xl:hidden"
      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
    >
      <Filter className="h-4 w-4 mr-2" />
      Filters
    </Button>

    {/* Sidebar */}
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 w-[220px] bg-white border-r transition-transform duration-300 ease-in-out -translate-x-full xl:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        mounted ? "block" : "hidden",
      )}
    >
      <div className="p-6 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600">
              Clear All
            </Button>
            <Button variant="ghost" size="sm" className="xl:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Price</h3>
          <Slider
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={0}
            max={500}
            step={10}
            className="mb-4"
          />
          <div className="flex justify-between text-sm text-gray-600">
            <span>₹{filters.priceRange[0]}</span>
            <span>₹{filters.priceRange[1]}</span>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category</h3>
          <div className="space-y-3">
            {categories.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={cat}
                  checked={filters.categories.includes(cat)}
                  onCheckedChange={(checked) => handleCheckboxChange("categories", cat, checked as boolean)}
                />
                <Label htmlFor={cat}>{cat}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Levels */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Level</h3>
          <div className="space-y-3">
            {levels.map((level) => (
              <div key={level} className="flex items-center space-x-2">
                <Checkbox
                  id={level}
                  checked={filters.levels.includes(level)}
                  onCheckedChange={(checked) => handleCheckboxChange("levels", level, checked as boolean)}
                />
                <Label htmlFor={level}>{level}</Label>
              </div>
            ))}
          </div>
        </div>

        {/* Ratings */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ratings</h3>
          <RadioGroup
            value={filters.ratings}
            onValueChange={(value) => setFilters((prev) => ({ ...prev, ratings: value }))}
          >
            {[4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center space-x-2">
                <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                <Label htmlFor={`rating-${rating}`} className="flex items-center text-sm font-normal">
                  {rating}
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />
                  <span className="ml-1">and above</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>
    </aside>

    {/* Overlay for mobile */}
    {isSidebarOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-30 xl:hidden" onClick={() => setIsSidebarOpen(false)} />
    )}

    {/* Main Content */}
    <main className="flex-1 xl:ml-[220px]">
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push("/")}
        className="flex items-center gap-2 mb-4 absolute top-4 right-4"
      >
        <span className="flex items-center justify-center rounded-full bg-gray-100 p-1.5">
          <Home className="h-4 w-4 text-gray-600" />
        </span>
        Home
      </Button>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8 md:ml-0 ml-0 flex flex-col items-center md:items-start">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center md:text-left">Search Courses</h1>
          <form onSubmit={handleSearch} className="max-w-2xl w-full relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search for courses, instructors, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-3 text-lg border-2 border-gray-200 rounded-lg focus:border-blue-500 w-full"
            />
          </form>
        </div>

        {/* Course Count */}
        <div className="mb-6 md:ml-0 ml-0 text-gray-600 text-center md:text-left">
          {filteredCourses.length} course{filteredCourses.length !== 1 && "s"} found
          {searchTerm && ` for "${searchTerm}"`}
        </div>

        {/* Course Results */}
        <div className="md:ml-0 ml-0">
          {filteredCourses.length > 0 ? (
            <CoursesList courses={filteredCourses} />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No courses found matching your criteria.</p>
              <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  </div>
);

}
