"use client"

import { ArrowLeft, ArrowRight, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"
import Loading from "./loading"
import TopicResourceRenderer from "@/components/TopicResourceRenderer"


export default function TopicPage({ params }: { params: Promise<{ programId: string, moduleId: string, topicId: string }> }) {

    const { programId, moduleId, topicId } = use(params);
    const router = useRouter()
    const [currentTopic, setCurrentTopic] = useState<any>(null)
    const [moduleTopics, setModuleTopics] = useState<Map<number, number>>(new Map());
    const [sortedTopics, setSortedTopics] = useState<number[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true)
            try {
                const [topicRes, moduleRes] = await Promise.all([
                    fetch(`/topics/${topicId}`),
                    fetch(`/modules/${moduleId}`),
                ]);
                if (!topicRes.ok || !moduleRes.ok) {
                    throw new Error('Failed to fetch data');
                }
                const [topicData, moduleData] = await Promise.all([
                    topicRes.json(),
                    moduleRes.json(),
                ]);

                setCurrentTopic(topicData?.data)
                const sorted = moduleData?.data?.moduleTopics?.sort((a: { topicId: number, position: number }, b: { topicId: number, position: number }) => a.position - b.position);
                setSortedTopics(sorted?.map((ele: { topicId: number, position: number }) => ele.topicId));
                const topicsMap = new Map<number, number>();
                sorted?.forEach((topic: { topicId: number, position: number }, index: number) => {
                    topicsMap.set(topic.topicId, index);
                });
                setModuleTopics(topicsMap);
                // Do something with topicData and moduleData
                console.log(topicData, moduleData);
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false)
            }
        };

        fetchData();
    }, [topicId, moduleId]);

    if (isLoading) {
        return <Loading />
    }

    if (!currentTopic) {
        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Topic Not Found</h1>
                    <p className="text-gray-600 mb-6">The topic you're looking for doesn't exist or couldn't be loaded.</p>
                    <Link href="/student/courses" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to courses
                    </Link>
                </div>
            </div>
        )
    }


    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href={`/courses/${programId}`}
                    className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
                >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back to course
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{currentTopic.title}</h1>
                        <div className="flex items-center mt-2 space-x-4">
                            <div className="flex items-center text-sm text-gray-600">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>{currentTopic.duration}</span>
                            </div>
                            <Badge variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                Documentation
                            </Badge>
                            {currentTopic.completed && (
                                <Badge variant="success">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Completed
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <Card className="mb-6">
                <CardContent className="p-6 space-y-6">
                    {currentTopic.topicResources.sort((a: any, b: any) => a.position - b.position).map((prop: any, index: number) => <TopicResourceRenderer resources={currentTopic.topicResources} topicId={topicId} topics={sortedTopics} moduleId={moduleId} key={index} resource={prop.resource} />)}
                </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div>
                    {typeof moduleTopics.get(Number(topicId)) === "number" && (moduleTopics.get(Number(topicId))! - 1 >= 0) && (

                        <Button variant="outline" onClick={() => router.push(`/courses/${programId}/${moduleId}/${sortedTopics[moduleTopics.get(Number(topicId))! - 1]}`)} className="flex items-center">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Previous Topic
                        </Button>
                    )}
                </div>

                <div className="flex space-x-3">
                    {/* {!currentTopic.completed && (
                        <Button onClick={handleComplete}>
                            {currentTopic.nextTopic ? "Complete & Continue" : "Complete Module"}
                        </Button>
                    )} */}

                    {typeof moduleTopics.get(Number(topicId)) === "number" && (moduleTopics.get(Number(topicId))! + 1 < sortedTopics.length) && (
                        <Button variant="outline" onClick={() => router.push(`/courses/${programId}/${moduleId}/${sortedTopics[moduleTopics.get(Number(topicId))! + 1]}`)} className="flex items-center">
                            Next Topic
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}