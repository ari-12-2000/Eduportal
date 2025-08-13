import { QuizAssignment, QuestionPaper, QuestionPaperQuestion, QuestionPool } from "@/lib/generated/prisma"

export interface QuizAssignmentUI extends QuizAssignment {
    questionPaper: QuestionPaper & {
        questions: QuestionPaperQuestionUI[];
    };
}

export interface QuestionPaperQuestionUI extends QuestionPaperQuestion {
    question:QuestionPool
}

export type SliderConfig = {
  min_value?: number;
  max_value?: number;
  default_value?: number;
  step_value?: number;
  min_text?: string;
  max_text?: string;
};