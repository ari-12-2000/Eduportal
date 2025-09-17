import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma';
import { Admin } from "@/lib/generated/prisma";
import { GlobalVariables } from "@/globalVariables";
import crypto from "crypto";
import { render } from "@react-email/render";
import ResetPasswordEmail from "@/app/emails/ResetPasswordEmail";
import nodemailer from "nodemailer";
import React from "react";

export class AuthController {
  static async getUserData(email: string) {
    try {
      let learner = await prisma.learner.findUnique({
        where: { email },
        include: {
          enrollments: {
            include: {
              program: {
                include: {
                  enrollments: {
                    select: { learnerId: true }
                  },
                },
              }
            }
          },

          measureProgress: {
            include: {
              program: {
                select: {
                  id: true
                }
              },
              module: {
                select: {
                  id: true
                }
              },
              resource: {
                select: {
                  id: true
                }
              },
              topic: {
                select: {
                  id: true
                }
              },
            }
          },

          quizAttempts: {
            include: {
              assignment: {
                select: { rules: true }
              }
            }
          }
        }
      })

      let userType = GlobalVariables.non_admin.role1;
      let enrolledCourseIDs: { [key: number]: boolean } = {}
      let completedPrograms: { [key: number]: boolean } = {}
      let completedModules: { [key: number]: boolean } = {}
      let completedResources: { [key: number]: boolean } = {}
      let completedTopics: { [key: number]: boolean } = {}
      let completedQuizzes: { [key: number]: number } = {}
      let attemptedQuizzes: { [key: number]: { start: Date, score: number } } = {}
      let admin

      if (!learner) {
        admin = await prisma.admin.findUnique({ where: { email } })
        if (!admin) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }
        userType = GlobalVariables.admin
      } else {

        learner.enrollments.map(e => enrolledCourseIDs[e.program.id] = true)
        learner.measureProgress.forEach((progress: any) => {
          if (progress.program?.id) {
            completedPrograms[progress.program.id] = true
          }
          if (progress.module?.id) {
            completedModules[progress.module.id] = true
          }
          if (progress.resource?.id) {
            completedResources[progress.resource.id] = true
          }
          if (progress.topic?.id) {
            completedTopics[progress.topic.id] = true
          }
        })

        learner.quizAttempts.forEach((attempt) => {
          let score = attempt.score !== null && typeof attempt.score === 'object' && 'toNumber' in attempt.score
            ? attempt.score.toNumber()
            : attempt.score ?? 0

          console.log(attempt.status)
          if (attempt.status === 'Completed')
            completedQuizzes[attempt.assignmentId] = score
          else if (attempt.status === 'In progress') {
            attemptedQuizzes[attempt.assignmentId] = {
              start: attempt.startedAt,
              score,
            }
            let rules: any = attempt.assignment.rules
            if (rules.time_limit_seconds) {
              let timeLimit = rules.time_limit_seconds
              if (attempt.startedAt < new Date(Date.now() - timeLimit * 1000))
                completedQuizzes[attempt.assignmentId] = score
            }
          }
        })

        console.log('Attempted', attemptedQuizzes, 'Completed', completedQuizzes)
      }

      const user = admin || learner

      if (userType === GlobalVariables.admin) {
        await prisma.admin.update({
          where: { email },
          data: { lastLogin: new Date() },
        })
      }

      const userData = {
        id: user!.id,
        email: user!.email,
        first_name: user!.first_name,
        last_name: user!.last_name,
        profile_image: user!.profile_image || "",
        role: userType,
        adminType: userType === GlobalVariables.admin ? (user as Admin).adminType : undefined,
        enrolledCourseIDs,
        completedPrograms,
        completedModules,
        completedResources,
        completedTopics,
        completedQuizzes,
        attemptedQuizzes
      }

      return NextResponse.json({ success: true, user: userData }, { status: 200 })

    } catch (error) {
      console.error("Login error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  static async signup(req: NextRequest) {
    try {
      const {
        first_name = "",
        last_name = "",
        email = "",
        password = "",
        role = GlobalVariables.non_admin.role1,
      } = await req.json()

      if (!first_name.trim() || !last_name.trim() || !email.trim()) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
      }

      const isGuest = role === GlobalVariables.non_admin.role2

      if (!isGuest && !password.trim()) {
        return NextResponse.json({ error: "Password is required" }, { status: 400 })
      }

      const existingUser = await prisma.learner.findUnique({ where: { email } })
      const existingAdmin = await prisma.admin.findUnique({ where: { email } })

      if (existingUser || existingAdmin) {
        return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
      }

      let hashedPassword = ""
      if (!isGuest) {
        hashedPassword = await bcrypt.hash(password, 10)
      }

      const newUser = await prisma.learner.create({
        data: {
          first_name: first_name.trim(),
          last_name: last_name.trim(),
          email: email.trim(),
          role,
          password: hashedPassword,
        },
      })

      const userData = {
        id: newUser.id,
        email: newUser.email,
        role,
      }

      return NextResponse.json({
        success: true,
        user: userData,
        message: "Account created successfully",
      }, { status: 201 })

    } catch (error) {
      console.error("Signup error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  static async createPasswordReset(req: NextRequest) {
    try {
      const { email } = await req.json();
      const learner = await prisma.learner.findUnique({ where: { email } });
      if (!learner) return NextResponse.json({ error: "Invalid Credentials" }, { status: 404 });
      const rawToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expires = new Date(Date.now() + 3600_000); // 1 hour

      await prisma.passwordReset.create({
        data: {
          learnerId: learner.id,
          token: hashedToken,
          expires,
        },
      });
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${rawToken}`;
      console.log("Reset Link:", resetLink);
      await this.sendResetEmail(learner.email, learner.first_name, resetLink);

      return NextResponse.json(
        { message: "Password reset email sent" },
        { status: 200 }
      );
    } catch (error) {
      console.error("Forgot password error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }

  static async sendResetEmail(userEmail: string, userName: string, resetLink: string) {
    try {
      const emailHtml = await render(
        React.createElement(ResetPasswordEmail, { userName, resetLink })
      );
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: '"Edu-Portal" <no-reply@eduportal.com>',
        to: userEmail,
        subject: "Reset your password",
        html: emailHtml,
      });

      return { success: true, message: "Reset email sent" };
    } catch (error: any) {
      throw new Error(error);
    }

  }

  static async resetPassword(req: NextRequest) {
    try {
      const { token, newPassword } = await req.json()
      if (!token || !newPassword) {
        return NextResponse.json({ error: "All fields are required" }, { status: 400 })
      }
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const resetEntry = await prisma.passwordReset.findFirst({
        where: {
          token: hashedToken,
          expires: { gt: new Date() },
        },
        include: { learner: true } // get learner info safely from DB
      });

      if (!resetEntry || !resetEntry.learner) { return NextResponse.json({ error: "Invalid or expired reset token" }, { status: 409 }) }

      const hash = await bcrypt.hash(newPassword, 10);
      await prisma.learner.update({
        where: { id: resetEntry.learner.id },
        data: { password: hash },
      })

      await prisma.passwordReset.deleteMany({ where: { learnerId: resetEntry.learner.id } });

      return NextResponse.json({ sucess: true, message: "Password reset successful" }, { status: 200 })

    } catch (error) {
      console.error("Reset password error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }




}
