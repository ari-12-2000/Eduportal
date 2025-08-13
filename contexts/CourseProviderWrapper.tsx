// CourseProviderWrapper.tsx (server)
import { CourseProvider } from "./course-context";

export default async function CourseProviderWrapper({
  children,
}: { children: React.ReactNode }) {
  const [coursesRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses`, { cache: "no-store" }),
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/courses/categories`, { cache: "no-store" }),
  ]);

  if (!coursesRes.ok || !categoriesRes.ok) {
    throw new Error("Failed to fetch");
  }

  const [{ data: coursesData }, { data: categoriesData }] = await Promise.all([
    coursesRes.json(),
    categoriesRes.json(),
  ]);

  return (
    <CourseProvider
      initialCourses={coursesData}
      categories={categoriesData} // Pass preprocessed categories
    >
      {children}
    </CourseProvider>
  );
}
