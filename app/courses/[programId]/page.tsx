import CourseClientWrapper from "@/components/course/course-client-wrapper";
import { Course } from "@/types/course";

export const dynamicParams = false;

export async function generateStaticParams() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses`);
  const data = await res.json();
  return data?.data?.map((course: any) => ({ programId: course.id.toString() })) || [];
}

export default async function CourseDetail({
  params,
  searchParams,
}: {
  params: Promise<{ programId: string }>
  searchParams: Promise<{ [enrolled: string]: string | undefined }>
}) {
    const { programId } = await params;
    const {enrolled} = await searchParams;
    let courseData:Course|null = null;
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${programId}`,{ next: { revalidate: 3600 } })
        const data = await res.json()
        if(!res.ok)
          throw new Error(data.error)
        courseData = data.data
      } catch (err: any) {
        console.error("Error fetching course:", err)
      }  

     return  <CourseClientWrapper  courseData={courseData} enrolled={enrolled}/>
}