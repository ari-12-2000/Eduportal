// app/courses/[programId]/[moduleId]/[topicId]/page.tsx
import TopicClientWrapper from '@/components/topic-client-wrapper';

export default async function TopicPage({ params }: { params: Promise<{ programId: string, moduleId: string, topicId: string }> }) {

    const { programId, moduleId, topicId } = await params;
    let topicData: any;
    let moduleData: any;
    try {
        const [topicRes, moduleRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/topics/${topicId}`, { cache: 'no-store' }),
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/modules/${moduleId}`, { cache: 'no-store' }),
        ]);

        [topicData, moduleData] = await Promise.all([topicRes.json(), moduleRes.json()]);
        if (!topicRes.ok)
            throw new Error(topicData.error);
        if (!moduleRes.ok)
            throw new Error(moduleData.error);

    }catch (err: any) {
        console.error("Error fetching topics and modules:", err)  
        
      }  


    return (
        <TopicClientWrapper
            programId={programId}
            moduleId={moduleId}
            topicId={topicId}
            topicData={topicData?.data}
            moduleData={moduleData?.data}
        />
    );
}
