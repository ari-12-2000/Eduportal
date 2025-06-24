export interface Course {
  id: number;
  authorId: number;
  title: string;
  description: string;
  category: string;
  instructor: string;
  instructorAvatar: string | null;
  image: string;
  rating: number;
  level: string;
  price: string;
  type: string | null;
  totalTimeLimit: number;
  status: string | null;
  uniqueHash: string | null;
  startDate: string | null;
  endDate: string | null;
  surveyStartDate: string | null;
  surveyEndDate: string | null;
  maxParticipants: number | null;
  passingScore: number | null;
  studySettings: any; // You can replace 'any' with a more specific type if available
  clientId: number | null;
  packageId: number | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  programModules: ProgramModule[];
  enrollments: Enrollment[];
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
  description: string;
  prerequisiteModuleId: number | null;
  status: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  moduleTopics: ModuleTopic[];
}

export interface ModuleTopic {
  topicId: number;
}
