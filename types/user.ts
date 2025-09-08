export interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  role: string
  profile_image?: string
  adminType?: string
  // qsnAttempts?: Record<number, { answer: string; isCorrect: boolean }>
  // quizId?:number,
  // score?: number
  //  enrolledCourses: Course[],
  enrolledCourseIDs: { [key: number]:boolean}
  completedTopics: { [key: number]:boolean}
  completedModules: { [key: number]:boolean}
  completedPrograms: { [key: number]:boolean}
  completedResources: { [key: number]:boolean}
  completedQuizzes: { [key: number]:number}
  attemptedQuizzes: { [key: number]: {start:Date, score:number} }
}