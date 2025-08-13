import { JsonValue } from "@/lib/generated/prisma/runtime/library";

export interface Course {
  id: number;
  authorId: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorAvatar: string | null;
  image: string | null;
  rating: number | null;
  level: string | null;
  price: string | null; // Changed from number to string to match Prisma schema
  type: string | null;
  totalTimeLimit: number | null;
  status: number | null;
  uniqueHash: string | null;
  startDate: Date | null;
  endDate: Date | null;
  surveyStartDate: Date | null;
  surveyEndDate: Date | null;
  maxParticipants: number | null;
  passingScore: number | null;
  studySettings: any; // You can replace 'any' with a more specific type if available
  clientId: number | null;
  packageId: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  programModules: ProgramModule[];
  enrollments: Enrollment[];
  quizzes: {

    id: number,
    title: string,
    uniqueLinkToken: string; // Include unique link token for quizzes
    rules: JsonValue

  }[]
}

export interface Enrollment {
  learnerId: number;
}

export interface ProgramModule {
  programId: number;
  moduleId: number;
  position: number;
  module: Module;
}

export interface Module {
  id: number;
  title: string;
  description: string | null;
  prerequisiteModuleId: number | null;
  status: number | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  moduleTopics: ModuleTopic[];
}

export interface ModuleTopic {
  topicId: number;
}
