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

    static async createQuestionPaper(req: NextRequest) {
        try {
            const body = await req.json();

            if (!body.name) {
                return NextResponse.json({ error: 'Name is required' }, { status: 400 });
            }

            const newPaper = await prisma.questionPaper.create({
                data: {
                    name: body.name,
                },
            });

            return NextResponse.json({ success: true, paper: newPaper }, { status: 201 });
        } catch (error) {
            console.error('[CREATE_QUESTION_PAPER]', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    }


    static async deleteQuestionPaper(req: NextRequest) {
        try {
            const body = await req.json();
            const { id } = body;

            if (!id) {
                return NextResponse.json({ error: 'ID is required' }, { status: 400 });
            }

            const deleted = await prisma.questionPaper.delete({
                where: { id },
            });

            return NextResponse.json({ success: true, deleted });
        } catch (error) {
            console.error('[DELETE_QUESTION_PAPER]', error);
            return NextResponse.json({ error: 'Failed to delete question paper' }, { status: 500 });
        }
    }

    static async updateQuestionPaper(req: NextRequest) {
        try {
            const body = await req.json();
            const { id, name } = body;

            if (!id || !name) {
                return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
            }

            const updated = await prisma.questionPaper.update({
                where: { id },
                data: { name },
            });

            return NextResponse.json({ success: true, updated });
        } catch (error) {
            console.error('[UPDATE_QUESTION_PAPER]', error);
            return NextResponse.json({ error: 'Failed to update question paper' }, { status: 500 });
        }
    }

    //QUESTIONPAPER QUESTIONS
    static async addQuestionToPaper(req: NextRequest){
        try {
            const body = await req.json();
            const { questionPaperId, questionId } = body;

            if (!questionPaperId || !questionId) {
                return NextResponse.json({ error: 'Paper ID and Question ID are required' }, { status: 400 });
            }

            // Check if the question exists
            const questionExists = await prisma.questionPool.findUnique({
                where: { id: questionId },
            });

            if (!questionExists) {
                return NextResponse.json({ error: 'Question not found' }, { status: 404 });
            }

           //Add question to paper
           const addition= await prisma.questionPaperQuestion.create({
            data:{
                questionPaperId, questionId
            }
           })
           return NextResponse.json({ success: true, data: addition }, { status: 201 });
        } catch (error) {
            console.error('[ADD_QUESTION_TO_PAPER]', error);
            return NextResponse.json({ error: 'Failed to add question to paper' }, { status: 500 });
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
                    questionPaper: true, // include questionPool relation
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

            const assignment = await prisma.quizAssignment.findUnique({
                where: { uniqueLinkToken: assignmentId },
                include: {
                    questionPaper: {
                        include:{
                            questions:{
                                include: {
                                    question: true // include related question from questionPool
                                }
                            }
                        }
                    } // include related question from questionPool
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