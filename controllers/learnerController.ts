import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export class LearnerController {
  // 1. Get all enrolled courses for a learner
  static async getEnrolledCourses({ params }: { params: { learnerId: string } }) {
    try {
      const learnerId = Number(params.learnerId);

      if (isNaN(learnerId)) {
        return NextResponse.json({ error: 'Invalid learner ID' }, { status: 400 });
      }

      const enrollment = await prisma.enrollment.findMany({
        where: { learnerId },
        include: {
          program: {
            include: {
              programModules: {
                include: {
                  module: {
                    include: {
                      moduleTopics: {
                        select: { topicId: true }
                      }
                    }
                  }
                }
              },
              enrollments: {
                select: { learnerId: true }
              },

              quizzes: {
                select: {
                  id: true
                }
              }
            }
          }
        }
      });

      return NextResponse.json({ success: true, data: enrollment }, { status: 200 });
    } catch (error) {
      console.error("Get enrolled courses error:", error);
      return NextResponse.json({ error: 'Failed to fetch the learner enrolled courses' }, { status: 500 });
    }
  }

  // 2. Enroll a learner in a course
  static async enrolInCourses(req: NextRequest) {
    try {
      const { programId, learnerId } = await req.json();
      const parsedProgramId = Number(programId);
      const parsedLearnerId = Number(learnerId);
      if (isNaN(parsedLearnerId) || isNaN(parsedProgramId)) {
        return NextResponse.json({ error: 'Invalid learner or program ID' }, { status: 400 });
      }

      const existingEnrollment = await prisma.enrollment.findFirst({
        where: { learnerId: parsedLearnerId, programId: parsedProgramId }
      });

      if (existingEnrollment) {
        return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
      }

      const enrollment = await prisma.enrollment.create({
        data: { learnerId: parsedLearnerId, programId: parsedProgramId }
      });

      return NextResponse.json({ success: true, data: enrollment }, { status: 201 });
    } catch (error) {
      console.error("Enroll in course error:", error);
      return NextResponse.json({ error: 'Failed to enroll in course' }, { status: 500 });
    }
  }

  // 3. Unenroll a learner from a course
  static async unenrollFromCourse(req: NextRequest) {
    try {
      const { learnerId, programId } = await req.json();
      const parsedProgramId = Number(programId);
      const parsedLearnerId = Number(learnerId);

      if (isNaN(parsedLearnerId) || isNaN(parsedProgramId)) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: { learnerId: parsedLearnerId, programId: parsedProgramId }
      });

      if (!enrollment) {
        return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
      }

      await prisma.enrollment.delete({ where: { id: enrollment.id } });

      return NextResponse.json({ success: true, message: 'Unenrolled successfully' }, { status: 200 });
    } catch (error) {
      console.error("Unenroll from course error:", error);
      return NextResponse.json({ error: 'Failed to unenroll from course' }, { status: 500 });
    }
  }

  static async createProgress(req: NextRequest) {
    try {
      const {
        learnerId,
        programId,
        moduleId,
        resourceId,
        topicId
      }: {
        learnerId: number | string;
        programId?: number | string;
        moduleId?: number | string;
        resourceId?: number | string;
        topicId?: number | string;
      } = await req.json();

      const parsedLearnerId = Number(learnerId);
      if (isNaN(parsedLearnerId)) {
        return NextResponse.json({ error: 'Invalid learner ID' }, { status: 400 });
      }

      // Helper function to safely parse optional values
      const parseOptionalNumber = (val: any): number | undefined => {
        const num = Number(val);
        return isNaN(num) ? undefined : num;
      };

      const parsedProgramId = parseOptionalNumber(programId);
      const parsedModuleId = parseOptionalNumber(moduleId);
      const parsedResourceId = parseOptionalNumber(resourceId);
      const parsedTopicId = parseOptionalNumber(topicId);

      const progressType = parsedProgramId
        ? 'program'
        : parsedModuleId
          ? 'module'
          : parsedResourceId
            ? 'resource'
            : parsedTopicId
              ? 'topic'
              : null;

      if (!progressType) {
        return NextResponse.json({ error: 'At least one content ID (program/module/resource/topic) is required' }, { status: 400 });
      }

      const progressData: any = {
        learnerId: parsedLearnerId,
        progressType, // automatically inferred
        status: 'Completed'
      };
      if (parsedProgramId !== undefined) progressData.programId = parsedProgramId;
      if (parsedModuleId !== undefined) progressData.moduleId = parsedModuleId;
      if (parsedResourceId !== undefined) progressData.resourceId = parsedResourceId;
      if (parsedTopicId !== undefined) progressData.topicId = parsedTopicId;

      const progress = await prisma.measureProgress.create({
        data: progressData
      });

      return NextResponse.json({ success: true, data: progress }, { status: 201 });

    } catch (error) {
      console.error("Create progress error:", error);
      return NextResponse.json({ error: 'Failed to create progress' }, { status: 500 });
    }
  }


  // static async updateProgress(req: NextRequest) {
  //   const { learnerId, programId?, moduleId?, resourceId?, topicId?} = await req.json();
  //   try{
  //     if (!learnerId || !topicId) {
  //       return NextResponse.json({ error: 'Learner ID and Topic ID are required' }, { status: 400 });
  //     }
  //     const parsedLearnerId = Number(learnerId);
  //     const parsedTopicId = Number(topicId);
  //     const parsedProgramId = programId ? Number(programId) : undefined;
  //     const parsedModuleId = moduleId ? Number(moduleId) : undefined;
  //     const parsedResourceId = resourceId ? Number(resourceId) : undefined;

  //     const progress = await prisma.measureProgress.updateMany({
  //       where: {
  //         learnerId: parsedLearnerId,
  //         topicId: parsedTopicId,
  //         programId: parsedProgramId,
  //         moduleId: parsedModuleId,
  //         resourceId: parsedResourceId
  //       },
  //       data: {
  //         status: 'Completed',
  //         completedAt: new Date()
  //       }
  //     });

  //     if (progress.count === 0) {
  //       return NextResponse.json({ error: 'No progress found to update' }, { status: 404 });
  //     }

  //     return NextResponse.json({ success: true, data: progress }, { status: 200 });
  //   }catch (error) {
  //     console.error("Update progress error:", error);
  //     return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  //   }
  // }


  //  4. Quiz Progress

  static async saveQuizAttempt(
    req: NextRequest,
    { params }: { params: Promise<{ assignmentId: string, learnerId: string }> }
  ) {
    try {
      const data = await req.json();
      const { questionAttempts: _, ...quizAttemptData } = data;
      const { assignmentId, learnerId } = await params;

      const assignmentIdNum = Number(assignmentId);
      const learnerIdNum = Number(learnerId);
      const status = data.status;
      const questionAttempts: Record<number, { answer: string; isCorrect: boolean }> = data.questionAttempts || {};

      if (isNaN(assignmentIdNum) || isNaN(learnerIdNum) || !status) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      // Step 1: Find the latest attempt for this learner + assignment
      let latestAttempt = await prisma.quizAttempt.findFirst({
        where: {
          assignmentId: assignmentIdNum,
          learnerId: learnerIdNum
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      let quizAttempt;

      quizAttempt = await prisma.quizAttempt.update({
        where: { id: latestAttempt!.id },
        data: { ...quizAttemptData }
      });

      // Delete previous question attempts for this attempt (overwrite)
      await prisma.questionAttempt.deleteMany({
        where: { attemptId: quizAttempt.id }
      });

      // Step 2: Add new questionAttempts
      const questionAttemptData = Object.entries(questionAttempts).map(([questionIdStr, value]) => ({
        attemptId: quizAttempt.id,
        questionId: Number(questionIdStr),
        answerText: value.answer,
        isCorrect: value.isCorrect,
      }));

      if (questionAttemptData.length > 0) {
        await prisma.questionAttempt.createMany({
          data: questionAttemptData
        });
      }

      return NextResponse.json({ success: true, data: quizAttempt }, { status: 201 });

    } catch (err: any) {
      console.error("Error saving quiz attempt:", err);
      return NextResponse.json({ error: "Failed to save quiz attempt" }, { status: 500 });
    }
  }



  static async getQuizAttempt({ params }: { params: Promise<{ assignmentId: string, learnerId: string, timeLimit?: string }> }) {
    try {
      const { assignmentId, learnerId, timeLimit } = await params;

      const learnerIdNum = Number(learnerId);
      const assignmentIdNum = Number(assignmentId);

      if (isNaN(assignmentIdNum) || isNaN(learnerIdNum)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }

      const whereCondition: any = {
        assignmentId: assignmentIdNum,  // ✅ number
        learnerId: learnerIdNum,        // ✅ number
        status: "In progress",
        OR: []
      };

      // Only add time limit condition if time_limit query param is present
      if (timeLimit) {
        const startedAfter = new Date(Date.now() - Number(timeLimit));
        whereCondition.OR.push({ startedAt: { gt: startedAfter } });
      }

      const quizAttempt = await prisma.quizAttempt.findFirst({
        where: whereCondition,
        orderBy: {
          createdAt: "desc"
        },
        include: {
          questionAttempts: true
        }
      });

      if (!quizAttempt) {
        return NextResponse.json({ error: "Quiz attempt not found" }, { status: 404 });
      }

      const attempts: Record<number, { answer: string; isCorrect: boolean }> = {};

      quizAttempt.questionAttempts.forEach((attempt) => {
        attempts[attempt.questionId] = {
          answer: attempt.answerText ?? '',
          isCorrect: attempt.isCorrect,
        };
      });


      return NextResponse.json({ data: { attempts, score: quizAttempt.score || 0, passed: quizAttempt.passed } }, { status: 200 });

    } catch (err: any) {
      console.error("Error fetching quiz attempts:", err);
      return NextResponse.json({ error: "Error fetching quiz attempts" }, { status: 500 });
    }
  }

  static async createQuizAttempt(req: NextRequest, { params }: { params: Promise<{ assignmentId: string, learnerId: string }> }) {
    try {
      const { assignmentId, learnerId } = await params;

      const assignmentIdNum = Number(assignmentId);
      const learnerIdNum = Number(learnerId);
      if (isNaN(assignmentIdNum) || isNaN(learnerIdNum)) {
        return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
      }
      const data = await req.json();
      const res = await prisma.quizAttempt.create({
        data: {
          ...data, // ✅ merges request body fields into the data object
          assignmentId: assignmentIdNum,
          learnerId: learnerIdNum
        }
      });
      return NextResponse.json({ success: true, data: res }, { status: 201 });

    } catch (err: any) {
      console.error("Error creating quiz attempt:", err);
      return NextResponse.json({ error: "Failed to create quiz attempt" }, { status: 500 });
    }
  }

}
