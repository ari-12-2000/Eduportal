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
  static async unenrollFromCourse(req: NextRequest, { params }: { params: { learnerId: string } }) {
    try {
      const learnerId = Number(params.learnerId);
      const { programId } = await req.json();
      const parsedProgramId = Number(programId);

      if (isNaN(learnerId) || isNaN(parsedProgramId)) {
        return NextResponse.json({ error: 'Invalid learner or program ID' }, { status: 400 });
      }

      const enrollment = await prisma.enrollment.findFirst({
        where: { learnerId, programId: parsedProgramId }
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
}
