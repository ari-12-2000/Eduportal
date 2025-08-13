"use client"

import { Clock, ArrowLeft, FileText, Award, CheckCircle, Users, BookOpen, Star, Trophy, Video, Brain } from 'lucide-react'
import Link from "next/link"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useMemo, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Course, Module, ProgramModule } from "@/types/course"
import NotFound from "../not-found"
import CourseQuiz from './course-quiz'



const CourseClientWrapper = ({ courseData, enrolled }: { courseData: Course | null, enrolled: string | undefined }) => {
    const { toast } = useToast()
    const [activeModule, setActiveModule] = useState<string | undefined>(undefined)
    const { user, setUser } = useAuth()

    // Get completed items from user context
    const completedTopics = user!.completedTopics
    const completedModules = user!.completedModules

    const router = useRouter()

    useEffect(() => {
        if (enrolled === "true") {
            toast({
                title: "Enrollment Successful",
                description: (
                    <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>You have successfully enrolled in the course.</span>
                    </div>
                ),
            })
            
            const url = new URL(window.location.href)
            url.searchParams.delete("enrolled")
            router.replace(url.pathname, { scroll: false })
        }
        if (courseData)
            courseData.programModules.sort((a: ProgramModule, b: ProgramModule) => a.position - b.position)
    }, [])

    // Calculate progress statistics
    const calculateProgress = () => {
        if (!courseData)
            return { totalTopics: 0, completedTopicsCount: 0, totalModules: 0, completedModulesCount: 0, overallProgress: 0 }

        const courseModules = courseData.programModules.map((prop: ProgramModule) => prop.module)
        const totalTopics = courseModules.reduce((acc: number, module: Module) => acc + module.moduleTopics.length, 0)
        const completedTopicsCount = courseModules.reduce((acc: number, module: Module) => {
            return acc + module.moduleTopics.filter((prop: any) => completedTopics[prop.topic.id]).length
        }, 0)

        const totalModules = courseModules.length
        const completedModulesCount = courseModules.filter((module: Module) => completedModules[module.id]).length
        const overallProgress = totalTopics > 0 ? (completedTopicsCount / totalTopics) * 100 : 0

        return { totalTopics, completedTopicsCount, totalModules, completedModulesCount, overallProgress }
    }

    if (!courseData) {
        return <NotFound resource="Course" />
    }

    const courseModules = useMemo(() => courseData.programModules.map((prop: ProgramModule) => prop.module), [courseData])
    const progress = calculateProgress()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Enhanced Hero Section */}
                <div
                    className="relative rounded-2xl overflow-hidden mb-8 shadow-2xl"
                    style={{
                        backgroundImage: courseData.image
                            ? `linear-gradient(135deg, rgba(0,0,0,0.4), rgba(0,0,0,0.7)), url(${courseData.image})`
                            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        backgroundSize: 'cover',
                        backgroundBlendMode: 'multiply',
                        backgroundPosition: 'center',
                        minHeight: "320px",
                    }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="relative z-10 max-sm:p-4 p-8 h-full flex flex-col justify-end">
                        <Link
                            href="/courses/search"
                            className="inline-flex items-center text-sm text-white/90 hover:text-white mb-6 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full transition-all hover:bg-white/20 w-fit"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to courses
                        </Link>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                                {courseData.title || "Course Title"}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                {courseData.totalTimeLimit && (
                                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <Clock className="h-5 w-5 mr-2" />
                                        <span className="font-medium">{courseData.totalTimeLimit}</span>
                                    </div>
                                )}
                                {courseData.rating && (
                                    <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <Star className="h-5 w-5 mr-2 fill-yellow-400 text-yellow-400" />
                                        <span className="font-medium">{courseData.rating} Rating</span>
                                    </div>
                                )}
                                <div className="flex items-center bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    <span className="font-medium">{courseModules.length} Modules</span>
                                </div>
                                {progress.overallProgress > 0 && (
                                    <div className="flex items-center bg-green-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
                                        <Trophy className="h-5 w-5 mr-2 text-green-400" />
                                        <span className="font-medium">{Math.round(progress.overallProgress)}% Complete</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Enhanced Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Course Description Card */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                            <CardContent className="max-sm:p-4 p-8">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                                        <BookOpen className="h-6 w-6 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">About This Course</h2>
                                </div>
                                <p className="text-gray-700 leading-relaxed text-lg mb-8">
                                    {courseData.description || "No description available."}
                                </p>

                                {/* Progress Overview */}
                                {progress.totalTopics > 0 && (
                                    <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
                                            <span className="text-2xl font-bold text-blue-600">{Math.round(progress.overallProgress)}%</span>
                                        </div>
                                        <Progress value={progress.overallProgress} className="h-3 mb-4" />
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Topics:</span>
                                                <span className="font-medium text-gray-900">
                                                    {progress.completedTopicsCount}/{progress.totalTopics}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Modules:</span>
                                                <span className="font-medium text-gray-900">
                                                    {progress.completedModulesCount}/{progress.totalModules}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 text-center border border-blue-100">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">{progress.totalTopics || 0}</div>
                                        <div className="text-sm font-medium text-blue-800">Total Topics</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 text-center border border-purple-100">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">{courseModules.length}</div>
                                        <div className="text-sm font-medium text-purple-800">Modules</div>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 text-center border border-green-100">
                                        <div className="text-3xl font-bold text-green-600 mb-2">{courseData.enrollments?.length || 0}</div>
                                        <div className="text-sm font-medium text-green-800">Students</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Enhanced Course Modules */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                            {courseModules.length > 0 && (
                                <CardContent className="max-sm:p-4 p-8">
                                    <div className="flex items-center mb-8">
                                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center mr-4">
                                            <FileText className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Course Modules</h2>
                                    </div>
                                    <Accordion
                                        type="single"
                                        collapsible
                                        className="w-full space-y-4 max-sm:text-sm"
                                        value={activeModule}
                                        onValueChange={setActiveModule}
                                    >
                                        {courseModules.map((module: Module, moduleIndex: number) => {
                                            const moduleCompleted = completedModules[module.id]
                                            const moduleTopicsCompleted = module.moduleTopics.filter((prop: any) =>
                                                completedTopics[prop.topic.id],
                                            ).length
                                            const moduleProgress =
                                                module.moduleTopics.length > 0 ? (moduleTopicsCompleted / module.moduleTopics.length) * 100 : 0

                                            return (
                                                <AccordionItem
                                                    key={module.id}
                                                    value={module.id.toString()}
                                                    className={`border-0 rounded-xl overflow-hidden shadow-sm ${moduleCompleted
                                                        ? "bg-gradient-to-r from-green-50 to-emerald-50 ring-2 ring-green-200"
                                                        : "bg-gradient-to-r from-gray-50 to-slate-50"
                                                        }`}
                                                >
                                                    <AccordionTrigger className="hover:bg-white/50 px-6 max-sm:px-4 py-4 rounded-xl transition-all duration-200 [&[data-state=open]]:bg-white/70">
                                                        <div className="flex items-center justify-between w-full pr-4 max-sm:pr-2">
                                                            <div className="flex items-center justify-between">
                                                                <div
                                                                    className={`w-10 h-10 max-sm:w-6 max-sm:h-6 rounded-full flex items-center justify-center mr-4 text-white font-bold ${moduleCompleted
                                                                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                                                        : "bg-gradient-to-r from-blue-500 to-purple-600"
                                                                        }`}
                                                                >
                                                                    {moduleCompleted ? <CheckCircle className="h-5 w-5 max-sm:h-3 max-sm:w-3" /> : moduleIndex + 1}
                                                                </div>
                                                                <div className="text-left">
                                                                    <h3 className="font-semibold text-gray-900 text-lg flex items-center max-sm:justify-between">
                                                                        {module.title}
                                                                        {moduleCompleted && (
                                                                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                                                                Completed
                                                                            </Badge>
                                                                        )}
                                                                    </h3>
                                                                    {moduleProgress > 0 && !moduleCompleted && (
                                                                        <div className="mt-2 w-48">
                                                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                                                <Progress value={moduleProgress} className="h-1.5 flex-1" />
                                                                                <span>{Math.round(moduleProgress)}%</span>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="max-sm:hidden flex items-center gap-2">
                                                                <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium">
                                                                    {moduleTopicsCompleted}/{module.moduleTopics.length} Topics
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="px-6 pb-6 max-sm:px-4">
                                                        <div className="bg-white/50 rounded-lg p-4 mb-6">
                                                            <p className="text-gray-600 leading-relaxed">{module.description}</p>
                                                        </div>
                                                        <div className="space-y-6">
                                                            {module.moduleTopics
                                                                .sort((a: any, b: any) => a.position - b.position)
                                                                .map((prop: any, topicIndex: number) => {
                                                                    const topicCompleted = completedTopics[prop.topic.id]

                                                                    const colors = [
                                                                        {
                                                                            bg: "bg-gradient-to-r from-red-500 to-pink-500",
                                                                            border: "border-red-200",
                                                                            cardBg: "bg-gradient-to-r from-red-50 to-pink-50",
                                                                            shadow: "shadow-red-100",
                                                                        },
                                                                        {
                                                                            bg: "bg-gradient-to-r from-orange-500 to-yellow-500",
                                                                            border: "border-orange-200",
                                                                            cardBg: "bg-gradient-to-r from-orange-50 to-yellow-50",
                                                                            shadow: "shadow-orange-100",
                                                                        },
                                                                        {
                                                                            bg: "bg-gradient-to-r from-yellow-500 to-amber-500",
                                                                            border: "border-yellow-200",
                                                                            cardBg: "bg-gradient-to-r from-yellow-50 to-amber-50",
                                                                            shadow: "shadow-yellow-100",
                                                                        },
                                                                        {
                                                                            bg: "bg-gradient-to-r from-teal-500 to-cyan-500",
                                                                            border: "border-teal-200",
                                                                            cardBg: "bg-gradient-to-r from-teal-50 to-cyan-50",
                                                                            shadow: "shadow-teal-100",
                                                                        },
                                                                        {
                                                                            bg: "bg-gradient-to-r from-blue-500 to-indigo-500",
                                                                            border: "border-blue-200",
                                                                            cardBg: "bg-gradient-to-r from-blue-50 to-indigo-50",
                                                                            shadow: "shadow-blue-100",
                                                                        },
                                                                        {
                                                                            bg: "bg-gradient-to-r from-purple-500 to-violet-500",
                                                                            border: "border-purple-200",
                                                                            cardBg: "bg-gradient-to-r from-purple-50 to-violet-50",
                                                                            shadow: "shadow-purple-100",
                                                                        },
                                                                    ]

                                                                    const colorScheme = colors[topicIndex % colors.length]

                                                                    return (
                                                                        <Link
                                                                            key={prop.topic.id}
                                                                            href={`/courses/${courseData.id}/${module.id}/${prop.topic.id}`}
                                                                        >
                                                                            <div className="flex cursor-pointer mb-4 group max-sm:flex-col max-sm:gap-3">
                                                                                {/* Enhanced Timeline Circle and Line */}
                                                                                <div className="flex items-center flex-col mr-6 max-sm:mr-4">
                                                                                    <div
                                                                                        className={`p-3 max-sm:p-2 max-sm:w-10 max-sm:h-10 max-sm:flex-shrink-0 rounded-full flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 ${topicCompleted
                                                                                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                                                                            : colorScheme.bg
                                                                                            } ${colorScheme.shadow}`}
                                                                                    >
                                                                                        {topicCompleted ? (
                                                                                            <CheckCircle className="h-6 w-6 max-sm:h-4 max-sm:w-4" />
                                                                                        ) : prop.topic.topicResources[0]?.resource.resourceType === "document" ? (
                                                                                            <FileText className="h-6 w-6 max-sm:h-4 max-sm:w-4" />
                                                                                        ) : prop.topic.topicResources[0]?.resource.resourceType === "video" ? (
                                                                                            <Video className="h-6 w-6 max-sm:h-4 max-sm:w-4" />
                                                                                        ) : (
                                                                                            <Clock className="h-6 w-6 max-sm:h-4 max-sm:w-4" />
                                                                                        )}
                                                                                    </div>
                                                                                    {topicIndex < module.moduleTopics.length - 1 && (
                                                                                        <div className="w-1 h-full bg-gradient-to-b from-gray-300 to-gray-200 mt-3 rounded-full max-sm:hidden"></div>
                                                                                    )}
                                                                                </div>
                                                                                {/* Enhanced Content Card */}
                                                                                <div
                                                                                    className={`flex-1 max-sm:w-full border-2 rounded-xl p-6 max-sm:p-4 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 ${topicCompleted
                                                                                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ring-2 ring-green-400 ring-offset-2 max-sm:ring-1 max-sm:ring-offset-1"
                                                                                        : `${colorScheme.cardBg} ${colorScheme.border}`
                                                                                        } ${colorScheme.shadow}`}
                                                                                >
                                                                                    <div className="flex items-start justify-between mb-3 max-sm:flex-col max-sm:gap-2">
                                                                                        <h4 className="font-bold text-gray-900 text-lg leading-tight pr-4 max-sm:pr-0 flex items-center max-sm:flex-wrap">
                                                                                            {prop.topic.title}
                                                                                            {topicCompleted && (
                                                                                                <Badge
                                                                                                    variant="secondary"
                                                                                                    className="ml-2 max-sm:ml-0 max-sm:mt-1 bg-green-100 text-green-800 text-xs"
                                                                                                >
                                                                                                    Completed
                                                                                                </Badge>
                                                                                            )}
                                                                                        </h4>
                                                                                        {topicCompleted && (
                                                                                            <div className="bg-green-100 p-2 rounded-full max-sm:self-start">
                                                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                    {prop.topic.description && (
                                                                                        <p className="text-gray-700 leading-relaxed text-base">
                                                                                            {prop.topic.description}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </Link>
                                                                    )
                                                                })}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            )
                                        })}
                                    </Accordion>
                                </CardContent>
                            )}

                            {/* Enhanced Quiz Assignments Section */}
                            {courseData.quizzes?.length > 0 && (
                                <CardContent className="max-sm:p-4 p-8 border-t border-gray-100">
                                    <div className="flex items-center mb-8">
                                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                                            <Brain className="h-6 w-6 text-white" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-900">Quiz Assignments</h2>
                                    </div>

                                    <div className="space-y-6">
                                        {courseData.quizzes.map((quiz, index) => <CourseQuiz key={quiz.id} quiz={quiz} index={index} />)}
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Enhanced Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Progress Summary Card */}
                        {progress.totalTopics > 0 && (
                            <Card className="max-lg:hidden bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                            <Trophy className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Progress Summary</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600 mb-1">
                                                {Math.round(progress.overallProgress)}%
                                            </div>
                                            <div className="text-sm text-gray-600 mb-3">Overall Progress</div>
                                            <Progress value={progress.overallProgress} className="h-2" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-green-600">{progress.completedTopicsCount}</div>
                                                <div className="text-xs text-gray-600">Topics Done</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xl font-bold text-purple-600">{progress.completedModulesCount}</div>
                                                <div className="text-xs text-gray-600">Modules Done</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Enhanced Instructor Card */}
                        {courseData.instructor && (
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                                            <Users className="h-4 w-4 text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900">Instructor</h3>
                                    </div>
                                    <div className="flex items-center">
                                        <img
                                            src={courseData.instructorAvatar || "/placeholder.svg?height=56&width=56"}
                                            alt={courseData.instructor}
                                            className="w-14 h-14 rounded-full mr-4 object-cover border-3 border-white shadow-lg"
                                        />
                                        <div>
                                            <h4 className="font-semibold text-gray-900 text-lg">{courseData.instructor}</h4>
                                            <p className="text-gray-600 text-sm">Course Instructor</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Enhanced Course Stats */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center mb-6">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                        <Award className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Course Stats</h3>
                                </div>
                                <div className="space-y-6">
                                    {courseData.enrollments?.length > 0 && (
                                        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                                            <div className="flex items-center">
                                                <Users className="h-5 w-5 text-blue-600 mr-2" />
                                                <span className="text-gray-700 font-medium">Students Enrolled</span>
                                            </div>
                                            <span className="font-bold text-blue-600 text-lg">{courseData.enrollments.length}</span>
                                        </div>
                                    )}
                                    {courseData.totalTimeLimit && (
                                        <div className="max-lg:hidden flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                                            <div className="flex items-center">
                                                <Clock className="h-5 w-5 text-purple-600 mr-2" />
                                                <span className="text-gray-700 font-medium">Total Duration</span>
                                            </div>
                                            <span className="font-bold text-purple-600 text-lg">{courseData.totalTimeLimit}</span>
                                        </div>
                                    )}
                                    {courseData.rating && (
                                        <div className="max-lg:hidden flex justify-between items-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-100">
                                            <div className="flex items-center">
                                                <Star className="h-5 w-5 text-yellow-600 mr-2" />
                                                <span className="text-gray-700 font-medium">Rating</span>
                                            </div>
                                            {courseData.rating && (
                                                <div className="flex items-center">
                                                    <span className="font-bold text-yellow-600 text-lg mr-2">{courseData.rating}</span>
                                                    <div className="flex">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star
                                                                key={i}
                                                                className={`w-4 h-4 ${i < Math.floor(courseData.rating!) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CourseClientWrapper
