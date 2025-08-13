"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext, type ReactNode, Dispatch, SetStateAction } from "react";
import { Course } from "@/types/course";
import { usePrevious } from "@/hooks/usePrevious";

interface CourseContextType {
  courses: Course[] | null;
  loading: boolean;
  filterCategory: string;
  categories: any;
  setLoading: Dispatch<SetStateAction<boolean>>;
  setFilterCategory: Dispatch<SetStateAction<string>>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export function CourseProvider({
  children,
  initialCourses,
  categories,
}: {
  children: ReactNode;
  initialCourses: Course[];
  categories: { category: string }[];
}) {
  const [courses] = useState<Course[] | null>(initialCourses || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState("");
  const pathname = usePathname();

  const previousPath = usePrevious(pathname);
// Track previous path and reset filters / loading if needed
   useEffect(() => {
    if (previousPath?.startsWith("/courses/search") && filterCategory) {
      setFilterCategory("");
    }
    // if (previousPath?.startsWith("/payment/") && loading) {
    //   console.log(loading);
    //   setLoading(false);
    // }
  }, [pathname, previousPath, filterCategory, loading]);

  return (
    <CourseContext.Provider
      value={{
        courses,
        categories,
        loading,
        filterCategory,
        setLoading,
        setFilterCategory,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
}

export function useCourses() {
  const context = useContext(CourseContext);
  if (!context) throw new Error("useCourses must be used within a CourseProvider");
  return context;
}
