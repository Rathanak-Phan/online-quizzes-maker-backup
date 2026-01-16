"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Clock, BookOpen, ArrowRight } from "lucide-react"
import Link from "next/link"

interface QuizCardProps {
  quiz: {
    _id: string
    title: string
    description: string
    category: string
    timeLimit: number
    questions: { _id: string }[]
    createdBy: { name: string }
  }
}

export default function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="hover:shadow-lg transition">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{quiz.title}</CardTitle>
            <CardDescription>{quiz.category}</CardDescription>
          </div>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-primary/10 text-primary">
            {quiz.questions.length} Q
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {quiz.description || "No description provided"}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{quiz.timeLimit} min</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>By {quiz.createdBy.name}</span>
          </div>
        </div>

        <Link href={`/student/quiz/${quiz._id}`}>
          <Button className="w-full" variant="default">
            Start Quiz <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
