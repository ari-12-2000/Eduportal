import { useAuth } from '@/contexts/auth-context'
import { Brain, CheckCircle, Clock, Loader2, Trophy, XCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { Badge } from '../ui/badge'


const CourseQuiz = ({ quiz, index }: {
    quiz: {
        id: number,
        title: string,
        uniqueLinkToken: string,
        rules: any
    }, index: number
}) => {
    const { user, setUser } = useAuth()
    const completedQuizzes = user!.completedQuizzes
    const attemptedQuizzes = user!.attemptedQuizzes
    const quizCompleted = completedQuizzes[quiz.id]
    const quizAttempted = attemptedQuizzes[quiz.id]

    function getQuizStatus() {
        if (quizCompleted) {
            return { status: quizCompleted >= 0.7 ? "passed" : "failed" };
        }
        if (quizAttempted) {
            const { start, score } = quizAttempted;
            const timeLimit = quiz.rules.settings.time_limit_seconds;
            const expired = timeLimit ? start < new Date(Date.now() - timeLimit * 1000) : false;

            if (expired && score >= 0.7) {
                return { status: "passed", completedUpdate: { [quiz.id]: score } };
            }
            else if (!expired) {
                return { status: "inProgress" };
            } else {
                return { status: "failed", completedUpdate: { [quiz.id]: score } };
            }
        }
        return { status: "takeQuiz" };
    }

    const { status, completedUpdate } = getQuizStatus();

    // update completedQuizzes if needed
    useEffect(() => {
        if (completedUpdate) {
            setUser({
                ...user!,
                completedQuizzes: {
                    ...completedQuizzes,
                    ...completedUpdate
                }
            });
        }
    }, [completedUpdate]);

    const quizColors = [
        {
            bg: "bg-gradient-to-r from-violet-500 to-purple-600",
            cardBg: "bg-gradient-to-r from-violet-50 to-purple-50",
            border: "border-violet-200",
            shadow: "shadow-violet-100",
            accent: "text-violet-600"
        },
        {
            bg: "bg-gradient-to-r from-rose-500 to-pink-600",
            cardBg: "bg-gradient-to-r from-rose-50 to-pink-50",
            border: "border-rose-200",
            shadow: "shadow-rose-100",
            accent: "text-rose-600"
        },
        {
            bg: "bg-gradient-to-r from-emerald-500 to-teal-600",
            cardBg: "bg-gradient-to-r from-emerald-50 to-teal-50",
            border: "border-emerald-200",
            shadow: "shadow-emerald-100",
            accent: "text-emerald-600"
        },
        {
            bg: "bg-gradient-to-r from-amber-500 to-orange-600",
            cardBg: "bg-gradient-to-r from-amber-50 to-orange-50",
            border: "border-amber-200",
            shadow: "shadow-amber-100",
            accent: "text-amber-600"
        },
        {
            bg: "bg-gradient-to-r from-cyan-500 to-blue-600",
            cardBg: "bg-gradient-to-r from-cyan-50 to-blue-50",
            border: "border-cyan-200",
            shadow: "shadow-cyan-100",
            accent: "text-cyan-600"
        }
    ]
    const colorScheme = quizColors[index % quizColors.length]
    return (
        <Link key={quiz.id} href={`/quiz/${quiz.uniqueLinkToken}`}>
            <div
                className={`max-sm:p-4 cursor-pointer border-2 rounded-xl p-6 group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 ${status === "passed"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 ring-2 ring-green-400 ring-offset-2"
                    : `${colorScheme.cardBg} ${colorScheme.border}`
                    } ${colorScheme.shadow}`}
            >
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                        <div
                            className={`max-sm:w-3 max-sm:h-3 w-8 h-8 rounded-lg flex items-center justify-center mr-3 text-white font-bold text-sm ${status === "passed" ? "bg-gradient-to-r from-green-500 to-emerald-600" : colorScheme.bg
                                }`}
                        >
                            {status === "passed" ? <CheckCircle className="max-sm:w-1 max-sm:h-1 h-4 w-4" /> : index + 1}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 text-xl leading-tight">{quiz.title}</h3>
                        </div>
                    </div>

                    {/* <div className="flex flex-col items-end gap-2">
                        {status === "completed" && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completed
                            </Badge>
                        )}
                        {status === "inProgress" && (
                            <Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                In Progress
                            </Badge>
                        )}
                        {status === "takeQuiz" && (
                            <Badge className={`bg-white/80 ${colorScheme.accent} border-current hover:bg-white/90`}>
                                <Brain className="h-3 w-3 mr-1" />
                                Take Quiz
                            </Badge>
                        )}
                    </div> */}
                </div>

                {/* Time */}

                <div className="flex items-center gap-6 text-sm text-gray-600">
                    {quiz.rules.settings.time_limit_seconds && (<div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Time: {Math.floor(quiz.rules.settings.time_limit_seconds / 60)} min</span>
                    </div>)}
                    {(() => {
                        switch (status) {
                            case "passed":
                                return (
                                    <div className="flex items-center text-green-600">
                                        <Trophy className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Passed</span>
                                    </div>
                                );

                            case "failed":
                                return (
                                    <div className="flex items-center text-red-600">
                                        <XCircle className="h-4 w-4 mr-1" />
                                        <span className="font-medium">Failed</span>
                                    </div>
                                );

                            case "inProgress":
                                return (
                                    <div className="flex items-center text-gray-600">
                                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                        <span className="font-medium">In Progress</span>
                                    </div>
                                );

                            case "takeQuiz":
                                return (
                                    <Badge
                                        className={`bg-white/80 ${colorScheme.accent} border-current hover:bg-white/90`}
                                    >
                                        <Brain className="h-3 w-3 mr-1" />
                                        Take Quiz
                                    </Badge>
                                );

                            default:
                                return null;
                        }
                    })()}
                    {/* {status === "passed" && (
                        <div className="flex items-center text-green-600">
                            <Trophy className="h-4 w-4 mr-1" />
                            <span className="font-medium">Passed</span>
                        </div>
                    )}  */}
                </div>



                <div className="mt-4 p-3 bg-white/60 rounded-lg border border-white/40">
                    <div className="flex items-center justify-between text-xs text-gray-600">
                        <span>Ready to start</span>
                        <span className="font-medium">Click to begin →</span>
                    </div>
                </div>

            </div>
        </Link>
    );
}

export default CourseQuiz