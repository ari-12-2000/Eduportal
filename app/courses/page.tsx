"use client"

import { useState, useEffect } from "react"
import { CoursesList } from "@/components/courses-list"
import { Course } from "@/types";
import { useCourses } from "@/contexts/course-context";

export default function CoursesPage() {
  const [courses, setCourses] = useState<any>(null)
  const { filterCategory, setFilterCategory} = useCourses();

  useEffect(() => {
    if(filterCategory)
     setFilterCategory(""); 
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/courses`);
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        console.log(data.data);
        setCourses(data.data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    }

    fetchData();
  }, []);
if(courses){
  return (
   
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">All Courses</h1>
        <p className="text-gray-600">Browse all available courses</p>
      </div>

      <CoursesList courses={courses} />
    </div>
  )
}else{
  return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          
        </div>
      </div>
  )
}
}
