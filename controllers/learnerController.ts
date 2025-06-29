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
        where: { learnerId:parsedLearnerId, programId: parsedProgramId }
      });

      if (existingEnrollment) {
        return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
      }

      const enrollment = await prisma.enrollment.create({
        data: { learnerId:parsedLearnerId, programId: parsedProgramId }
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
}
