import CourseClientWrapper from "@/components/course-client-wrapper";

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
    let courseData:any
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${programId}`)
        if (!res.ok)
          throw new Error(`Failed to fetch course: ${res.status}`)
        
        const data = await res.json()
        console.log("Course data:", data.data)
        courseData = data.data
      } catch (err: any) {
        console.error("Error fetching course:", err)
        courseData = null;  
      }  

     return  <CourseClientWrapper  courseData={courseData} enrolled={enrolled}/>
}