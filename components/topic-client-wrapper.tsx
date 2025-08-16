"use client"

import { ArrowLeft, ArrowRight, Clock, BookOpen, Sparkles, ChevronLeft, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo } from "react"
import TopicResourceRenderer from "@/components/topic-resource-renderer"
import NotFound from "./not-found"

export default function TopicClientWrapper({
  programId,
  moduleId,
  topicId,
  topicData,
  moduleData,
}: {
  programId: string
  moduleId: string
  topicId: string
  topicData: any
  moduleData: any
}) {
  const router = useRouter()
  const currentTopic = topicData

  const sortedTopics = useMemo(() => {
    if (!moduleData) return []
    return moduleData.moduleTopics?.sort((a: any, b: any) => a.position - b.position).map((t: any) => t.topicId) || []
  }, [moduleData])

  const moduleTopics = useMemo(() => {
    const map = new Map<number, number>()
    sortedTopics.forEach((topicId: number, index: number) => {
      map.set(topicId, index)
    })
    return map
  }, [sortedTopics])

  if (!currentTopic) {
    return <NotFound resource="topic" />
  }

  const currentIndex = moduleTopics.get(Number(topicId)) ?? 0
  const totalTopics = sortedTopics.length
  const progressPercentage = totalTopics > 0 ? ((currentIndex + 1) / totalTopics) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Link
            href={`/courses/${programId}`}
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors duration-200 mb-6 group"
          >
            <ChevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to course
          </Link>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-indigo-600" />
                  </div>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    Topic {currentIndex + 1} of {totalTopics}
                  </Badge>
                </div>

                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 bg-clip-text text-transparent leading-tight">
                  {currentTopic.title}
                </h1>

                <div className="flex items-center space-x-6">
                  {currentTopic.duration ? (
                    <div className="flex items-center text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
                      <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                      <span className="font-medium">{currentTopic.duration}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
                      <Target className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="font-medium">Self-paced</span>
                    </div>
                  )}
                  <div className="flex items-center text-slate-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-full border border-slate-200">
                    <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                    <span className="font-medium">Interactive Content</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="space-y-8">
              {currentTopic.topicResources
                .sort((a: any, b: any) => a.position - b.position)
                .map((prop: any, index: number) => (
                  <div key={index} className="relative">
                    {index > 0 && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-px h-4 bg-gradient-to-b from-slate-200 to-transparent" />
                    )}
                    <TopicResourceRenderer
                      resources={currentTopic.topicResources}
                      topicId={topicId}
                      topics={sortedTopics}
                      moduleId={moduleId}
                      resource={prop.resource}
                    />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation Section */}
        <div className="flex items-center justify-between">
          <div>
            {typeof moduleTopics.get(Number(topicId)) === "number" && moduleTopics.get(Number(topicId))! - 1 >= 0 && (
              <Button
                variant="outline"
                onClick={() =>
                  router.push(
                    `/courses/${programId}/${moduleId}/${sortedTopics[moduleTopics.get(Number(topicId))! - 1]}`,
                  )
                }
                className="group bg-white/80 backdrop-blur-sm border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 px-6 py-3 h-auto"
              >
                <ArrowLeft className="h-4 w-4 mr-3 group-hover:-translate-x-1 transition-transform duration-200" />
                <div className="text-left">
                  <div className="text-xs text-slate-500 font-medium">Previous</div>
                  <div className="font-semibold">Topic {currentIndex}</div>
                </div>
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {typeof moduleTopics.get(Number(topicId)) === "number" &&
              moduleTopics.get(Number(topicId))! + 1 < sortedTopics.length && (
                <Button
                  onClick={() =>
                    router.push(
                      `/courses/${programId}/${moduleId}/${sortedTopics[moduleTopics.get(Number(topicId))! + 1]}`,
                    )
                  }
                  className="group bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 px-6 py-3 h-auto shadow-lg hover:shadow-xl"
                >
                  <div className="text-right mr-3">
                    <div className="text-xs text-indigo-100 font-medium">Next</div>
                    <div className="font-semibold text-white">Topic {currentIndex + 2}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  )
}
