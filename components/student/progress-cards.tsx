"use client"
import type React from "react"
import { BookOpen, Layers, FileQuestion, BookOpenCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface Prop {
  courseProgress: {
    courses: number
    completed: number
  }
  topicProgress: {
    topics: number
    completed: number
  }
  moduleProgress: {
    modules: number
    completed: number
  }
}

export function ProgressCards({ courseProgress, topicProgress, moduleProgress }: Prop) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-0">
      <ProgressCard
        icon={BookOpen}
        title="Courses Progress"
        current={courseProgress.completed}
        total={courseProgress.courses}
        label="Courses completed"
        color="bg-blue-600"
      />
      <ProgressCard
        icon={Layers}
        title="Modules Progress"
        current={moduleProgress.completed}
        total={moduleProgress.modules}
        label="Modules completed"
        color="bg-indigo-600"
      />
      <ProgressCard
        icon={BookOpenCheck}
        title="Topics Progress"
        current={topicProgress.completed}
        total={topicProgress.topics}
        label="Topics completed"
        color="bg-green-600"
      />
      <ProgressCard
        icon={FileQuestion}
        title="Quizzes Progress"
        current={18}
        total={25}
        label="Quizzes completed"
        color="bg-purple-600"
      />
    </div>
  )
}

interface ProgressCardProps {
  icon: React.ElementType
  title: string
  current: number
  total: number
  label: string
  color: string
}

function ProgressCard({ icon: Icon, title, current, total, label, color }: ProgressCardProps) {
  const percentage = (current / total) * 100
  return (
    <Card className="relative z-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${color.replace("bg-", "text-")}`} />
          </div>
        </div>
        <div className="flex items-baseline mb-2">
          <span className="text-2xl font-bold text-gray-900">
            {current}/{total}
          </span>
          <span className="ml-2 text-xs text-gray-500">{label}</span>
        </div>
        <Progress value={percentage} className="h-2 relative z-0" />
      </CardContent>
    </Card>
  )
}
