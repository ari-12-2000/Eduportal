import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export class CourseController {
  // 1. Get all courses
  static async getAllCourses() {
    try {
      const courses = await prisma.program.findMany({
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
        },
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json({ success: true, data: courses }, { status: 200 });
    } catch (error) {
      console.error("Get all courses error:", error);
      return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
  }

  // 2. Get a course by ID/price
  static async getCourseById({ params }: { params: Promise<{ programId: string }> }) {
    try {
      const { programId } = await params;
      const id = Number(programId);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
      }

      const program = await prisma.program.findUnique({
        where: { id },
        include: {
          programModules: {
            include: {
              module: {
                include: {
                  moduleTopics: {
                    include: {
                      topic: {
                        include: {
                          topicResources: {
                            include: {
                              resource: {
                                select: { resourceType: true }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          enrollments: {
            select: { learnerId: true }
          }
        }
      });

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: program }, { status: 200 });
    } catch (error) {
      console.error("Get program error:", error);
      return NextResponse.json({ error: 'Failed to fetch program' }, { status: 500 });
    }
  }

// 3. Create course
  static async createCourse(req: NextRequest) {
    try {
      const data = await req.json();

      if (!data.title || !data.description) {
        return NextResponse.json({ error: 'Name and description are required' }, { status: 400 });
      }

      const program = await prisma.program.create({ data });
      return NextResponse.json({ success: true, data: program }, { status: 201 });
    } catch (error) {
      console.error("Create program error:", error);
      return NextResponse.json({ error: 'Failed to create program' }, { status: 500 });
    }
  }

  // 4. Update course
  static async updateCourse(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    try {
      const { programId } = await params;
      const id = Number(programId);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
      }

      const data = await req.json();
      const updated = await prisma.program.update({ where: { id }, data });

      return NextResponse.json({ success: true, data: updated }, { status: 200 });
    } catch (error) {
      console.error("Update program error:", error);
      return NextResponse.json({ error: 'Failed to update program' }, { status: 500 });
    }
  }

  // 5. Delete course
  static async deleteCourse(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    try {
      const { programId } = await params;
      const id = Number(programId);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
      }

      await prisma.program.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Program deleted' }, { status: 200 });
    } catch (error) {
      console.error("Delete program error:", error);
      return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
    }
  }

  // 6. Get enrolled students for a course
  static async getEnrolledStudents(req: NextRequest, { params }: { params: Promise<{ programId: string }> }) {
    try {
      const { programId } = await params;
      const id = Number(programId);
      if (isNaN(id)) {
        return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
      }

      const enrollments = await prisma.enrollment.findMany({
        where: { programId: id },
        include: {
          learner: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              profile_image: true,
            }
          }
        }
      });

      return NextResponse.json({ success: true, data: enrollments }, { status: 200 });
    } catch (error) {
      console.error("Get enrolled students error:", error);
      return NextResponse.json({ error: 'Failed to fetch enrolled students' }, { status: 500 });
    }
  }

  // 7. Get all unique categories
  static async getCourseCategories() {
    try {
      const categories = await prisma.program.findMany({
        select: { category: true },
        distinct: ['category'],
      });
      return NextResponse.json({ success: true, data: categories }, { status: 200 });
    } catch (error) {
      console.error("Get categories error:", error);
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
    }
  }

  // 8. Map modules to programs
  static async mapProgramsandmodules(req: NextRequest, { params }: { params: Promise<{ programId: string, moduleId: string }> }) {
    try {
      const { programId, moduleId } = await params;
      const programIdNum = Number(programId);
      const moduleIdNum = Number(moduleId);

      if (isNaN(programIdNum) || isNaN(moduleIdNum)) {
        return NextResponse.json({ error: 'Invalid program or module ID' }, { status: 400 });
      }

      const { position } = await req.json();
      if (typeof position !== "number" || position < 0) {
        return NextResponse.json({ error: 'Invalid position value' }, { status: 400 });
      }

      const mapping = await prisma.programModule.create({
        data: {
          programId: programIdNum,
          moduleId: moduleIdNum,
          position
        },
      });

      return NextResponse.json({ success: true, data: mapping }, { status: 201 });
    } catch (error) {
      console.error("Map modules and programs error:", error);
      return NextResponse.json({ error: 'Failed to map modules and programs' }, { status: 500 });
    }
  }
}
