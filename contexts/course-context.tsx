"use client"

import { Course } from "@/types/course"
import { createContext, useContext, useState, useEffect, type ReactNode, SetStateAction, Dispatch } from "react"
import { Code, Palette, Database, Smartphone, Brain, TrendingUp, ArrowRight, Award, BookOpen, BarChartBig, Megaphone, LineChart } from "lucide-react"
import { usePathname } from "next/navigation"

interface CourseContextType {
    courses: Course[] | null
    loading: boolean
    filterCategory: string
    categories: { name: string, icon: typeof Code, color: string }[]
    setLoading: Dispatch<SetStateAction<boolean>>
    setFilterCategory: Dispatch<SetStateAction<string>>
}

const CourseContext = createContext<CourseContextType | undefined>(undefined)

export function CourseProvider({ children }: { children: ReactNode }) {
    const [courses, setCourses] = useState<CourseContextType["courses"]>(null)
    const [categories, setCategories] = useState<CourseContextType["categories"]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [filterCategory, setFilterCategory] = useState('')
    const [previousPath, setPreviousPath] = useState("")

    const pathname = usePathname()

    useEffect(() => {

        const fetchData = async () => {
            try {
                const [coursesRes, categoriesRes] = await Promise.all([
                    fetch("/api/courses"),
                    fetch("/courses/categories"),
                ])

                if (!coursesRes.ok || !categoriesRes.ok) { throw new Error("Failed to fetch") }

                const [{ data: coursesData }, { data: categoriesData }] = await Promise.all([
                    coursesRes.json(),
                    categoriesRes.json(),
                ])

                setCourses(coursesData)

                const categoryIcons = {
                    "Web Development": { icon: Code, color: "bg-blue-500" },
                    "UI/UX Design": { icon: Palette, color: "bg-purple-500" },
                    "Database": { icon: Database, color: "bg-green-500" },
                    "Data Science": { icon: BarChartBig, color: "bg-green-500" },
                    "Machine Learning": { icon: Brain, color: "bg-red-500" },
                    "Digital Marketing": { icon: Megaphone, color: "bg-orange-500" },
                    "Mobile Development": { icon: Smartphone, color: "bg-orange-500" },
                } as const;

                const mappedCategories = categoriesData.map((categoryData: { category: string }) => {
                    const key = categoryData.category as keyof typeof categoryIcons
                    return {
                        name: categoryData.category,
                        icon: categoryIcons[key]?.icon || Code,
                        color: categoryIcons[key]?.color || "bg-gray-500",
                    }
                })
                console.log(mappedCategories);
                setCategories(mappedCategories)
            } catch (err: any) {
                console.error(err.message)

            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [])

    useEffect(() => {
        // Clear filter when moving away from search page to any other page except home
        console.log(previousPath);
        if (previousPath?.startsWith("/courses/search") && filterCategory) {
            console.log("Clearing filter - moved away from search page")
            setFilterCategory("")
        }
        if(previousPath?.startsWith("/payment/") && loading)
             setLoading(false)      
        setPreviousPath(pathname)
    }, [pathname])

    return (<CourseContext.Provider value={{ courses, loading, categories, filterCategory, setLoading, setFilterCategory }}>{children}</CourseContext.Provider>)
}

export function useCourses() {
    const context = useContext(CourseContext)
    if (!context) {
        throw new Error("useCourses must be used within a CourseProvider")
    }
    return context
}