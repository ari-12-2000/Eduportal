"use client"

import { ArrowLeft, ArrowRight, CheckCircle, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {  useMemo} from "react"
import TopicResourceRenderer from "@/components/topic-resource-renderer"
import NotFound from "./not-found"

export default function TopicClientWrapper({ programId, moduleId, topicId, topicData, moduleData }: {
    programId: string;
    moduleId: string;
    topicId: string;
    topicData: any;
    moduleData: any;
}) {
    const router = useRouter();
    const currentTopic = topicData;


    const sortedTopics = useMemo(() => {
        if (!moduleData) return [];
        return moduleData.moduleTopics?.sort((a: any, b: any) => a.position - b.position).map((t: any) => t.topicId) || [];
    }, [moduleData]);

    const moduleTopics = useMemo(() => {
        const map = new Map<number, number>();
        sortedTopics.forEach((topicId:number, index:number) => {
            map.set(topicId, index);
        });
        return map;
    }, [sortedTopics]);


    if (!currentTopic) {
        return (
            <NotFound resource="topic" />
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
                    {currentTopic.topicResources.sort((a: any, b: any) => a.position - b.position).map((prop: any, index: number) =>
                        <TopicResourceRenderer resources={currentTopic.topicResources} topicId={topicId} topics={sortedTopics} moduleId={moduleId} key={index} resource={prop.resource} />)}
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