import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
export class QuizController {

    //QUESTIONPOOL 
    static async createQuestionPool(req: NextRequest) {
        try {
            const data = await req.json();
            if (!data.authorId || !data.questionText || !data.questionType)
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            if (data.points && isNaN(Number(data.points)))
                return NextResponse.json({ error: "Invalid input" }, { status: 400 })
            const question = await prisma.questionPool.create({ data });
            return NextResponse.json({ success: true, data: question }, { status: 201 });
        } catch (err) {
            console.error("Create question error", err);
            return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
        }
    }

    static async updateQuestion(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
        try {
            const { questionId } = await params;

            if (isNaN(Number(questionId))) {
                return NextResponse.json({ error: 'Invalid question ID' }, { status: 400 });
            }

            const data = await req.json();
            if (data.points && isNaN(Number(data.points)))
                return NextResponse.json({ error: "Invalid input" }, { status: 400 })
            const updated = await prisma.questionPool.update({ where: { id: Number(questionId) }, data });

            return NextResponse.json({ success: true, data: updated }, { status: 200 });

        } catch (err) {
            console.error("Update question error", err);
            return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
        }
    }

    static async deleteQuestion(req: NextRequest, { params }: { params: Promise<{ questionId: string }> }) {
        try {
            const { questionId } = await params;
            const id = Number(questionId);
            if (isNaN(id)) {
                return NextResponse.json({ error: 'Missing question ID' }, { status: 400 });
            }

            await prisma.questionPool.delete({ where: { id } });
            return NextResponse.json({ success: true, message: 'Question deleted' }, { status: 200 });
        } catch (error) {
            console.error("Delete program error:", error);
            return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
        }
    }

    //QUESTIONPAPER -(questions are added from question pool)

    static async addAssignmentQuestion(req: NextRequest) {
        try {
            const data = await req.json();
            const questionId = Number(data.questionId);
            const assignmentId = Number(data.assignmentId)
            if (isNaN(assignmentId) || isNaN(questionId))
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            const addedquestion = await prisma.assignmentQuestion.create({ data: { questionId, assignmentId } });
            return NextResponse.json({ success: true, data: addedquestion }, { status: 201 });
        } catch (err) {
            console.error("adding question error", err);
            return NextResponse.json({ error: "Failed to add question" }, { status: 500 });
        }
    }

    static async deleteAssignmentQuestion(req:NextRequest) {
        try {
            let { questionId, assignmentId } = await req.json();
            questionId = Number(questionId);
            assignmentId= Number(assignmentId);
            if (isNaN(questionId)||isNaN(assignmentId)) {
                return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
            }

            await prisma.assignmentQuestion.delete({ where: { questionId_assignmentId: { questionId, assignmentId } } });
            return NextResponse.json({ success: true, message: 'Question deleted' }, { status: 200 });
        } catch (error) {
            console.error("Delete program error:", error);
            return NextResponse.json({ error: 'Failed to delete program' }, { status: 500 });
        }
    }

    //ASSIGNMENT RELATED
    static async createAssignment(req: NextRequest) {
        try {
            const data = await req.json();

            if (!data.title || !data.description || !data.rules) {
                return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
            }

            const assignment = await prisma.quizAssignment.create({
                data,
            });

            return NextResponse.json({ success: true, data: assignment }, { status: 201 });

        } catch (error) {
            console.error("Create assignment error:", error);
            return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 });
        }
    }

    // UPDATE
    static async updateAssignment(req: NextRequest, { params }: { params: Promise<{ assignmentId: string }> }) {
        try {
            const { assignmentId } = await params;

            if (isNaN(Number(assignmentId))) {
                return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
            }

            const data = await req.json();

            const updated = await prisma.quizAssignment.update({
                where: { id: Number(assignmentId) },
                data,
            });

            return NextResponse.json({ success: true, data: updated }, { status: 200 });

        } catch (error) {
            console.error("Update assignment error:", error);
            return NextResponse.json({ error: "Failed to update assignment" }, { status: 500 });
        }
    }

    // DELETE (soft delete)
    static async deleteAssignment(req: NextRequest, { params }: { params: Promise<{ assignmentId: string }> }) {
        try {
            const { assignmentId } = await params;
            const id = Number(assignmentId);

            if (isNaN(id)) {
                return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
            }

            const deleted = await prisma.quizAssignment.update({
                where: { id },
                data: {
                    isDeleted: true,
                    deletedAt: new Date(),
                },
            });

            return NextResponse.json({ success: true, message: 'Assignment soft-deleted', data: deleted }, { status: 200 });

        } catch (error) {
            console.error("Delete assignment error:", error);
            return NextResponse.json({ error: 'Failed to delete assignment' }, { status: 500 });
        }
    }

    // GET (fetch all enabled & not deleted)
    static async getAllAssignments() {
        try {
            const assignments = await prisma.quizAssignment.findMany({
                where: {
                    isDeleted: false,
                    enabled: true,
                },
                include: {
                    questions: true, // include questionPool relation
                }
            });

            return NextResponse.json({ success: true, data: assignments }, { status: 200 });

        } catch (error) {
            console.error("Fetch assignments error:", error);
            return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
        }
    }

    static async getAssignmentById({ params }: { params: Promise<{ assignmentId: string }> }) {
        try {
            const { assignmentId } = await params;

            if (isNaN(Number(assignmentId))) {
                return NextResponse.json({ error: 'Invalid assignment ID' }, { status: 400 });
            }

            const assignment = await prisma.quizAssignment.findUnique({
                where: { id: Number(assignmentId) },
                include: {
                    questions: true, // include related question from questionPool
                },
            });

            if (!assignment || assignment.isDeleted) {
                return NextResponse.json({ error: "Assignment not found or deleted" }, { status: 404 });
            }

            return NextResponse.json({ success: true, data: assignment }, { status: 200 });

        } catch (error) {
            console.error("Get assignment by ID error:", error);
            return NextResponse.json({ error: "Failed to fetch assignment" }, { status: 500 });
        }
    }


}