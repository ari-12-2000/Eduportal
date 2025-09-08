import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma';
import { Admin} from "@/lib/generated/prisma";
import { GlobalVariables } from "@/globalVariables";

export class AuthController {
  static async getUserData(email:string) {
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
            let rules:any=attempt.assignment.rules
            if(rules.time_limit_seconds){
               let timeLimit=rules.time_limit_seconds
               if(attempt.startedAt<new Date(Date.now() - timeLimit * 1000))  
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

      if (!isGuest && !password?.trim()) {
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

  // static async refreshUser(req: NextRequest) {
  //   try {
  //     const token = req.headers.get("Authorization")?.split(" ")[1]
  //     if (!token) {
  //       return NextResponse.json({ error: "No token provided" }, { status: 401 })
  //     }
  //     const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, role: string, adminType?: string }
  //     const learner = await prisma.learner.findUnique({
  //       where: { id: decoded.id },
  //       include: {
  //         enrollments: {
  //           include: {
  //             program: {
  //               include: {
  //                 programModules: {
  //                   include: {
  //                     module: {
  //                       include: {
  //                         moduleTopics: {
  //                           select: { topicId: true },
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //                 enrollments: {
  //                   select: { learnerId: true },
  //                 },
  //                 quizzes: {
  //                   select: {
  //                     id: true,
  //                     title: true,
  //                     uniqueLinkToken: true, // Include unique link token for quizzes
  //                     rules: true // Include rules for quizzes
  //                   }
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         measureProgress: {
  //           include: {
  //             program: {
  //               select: {
  //                 id: true
  //               }
  //             },
  //             module: {
  //               select: {
  //                 id: true
  //               }
  //             },
  //             resource: {
  //               select: {
  //                 id: true
  //               }
  //             },
  //             topic: {
  //               select: {
  //                 id: true
  //               }
  //             },
  //           }
  //         },
  //         quizAttempts: {
  //           select: {
  //             assignmentId: true,
  //             status: true,
  //           }
  //         }
  //       },
  //     })

  //     let userType = GlobalVariables.non_admin.role1
  //     let enrolledCourses: Course[] = []
  //     let enrolledCourseIDs: number[] = []
  //     let completedPrograms: number[] = []
  //     let completedModules: number[] = []
  //     let completedResources: number[] = []
  //     let completedTopics: number[] = []
  //     let completedQuizzes: number[] = []
  //     let attemptedQuizzes: number[] = []

  //     if (!learner) {
  //       return NextResponse.json({ error: "User not found" }, { status: 404 })
  //     }

  //     enrolledCourses = learner.enrollments.map(e => ({
  //       ...e.program,
  //       price: e.program.price !== null ? e.program.price.toString() : null
  //     }))
  //     enrolledCourseIDs = learner.enrollments.map(e => e.program.id)
  //     learner.measureProgress.forEach((progress: any) => {
  //       if (progress.program?.id) {
  //         completedPrograms.push(progress.program.id)
  //       }
  //       if (progress.module?.id) {
  //         completedModules.push(progress.module.id)
  //       }
  //       if (progress.resource?.id) {
  //         completedResources.push(progress.resource.id)
  //       }
  //       if (progress.topic?.id) {
  //         completedTopics.push(progress.topic.id)
  //       }
  //     })

  //     learner.quizAttempts.forEach((attempt: any) => {
  //       if (attempt.status === 'Completed')
  //         completedQuizzes.push(attempt.assignmentId)
  //       else if (attempt.status === 'In progress')
  //         attemptedQuizzes.push(attempt.assignmentId)
  //     })
  //     const userData = {
  //       id: learner.id,
  //       email: learner.email,
  //       first_name: learner.first_name,
  //       last_name: learner.last_name,
  //       profile_image: learner.profile_image || "",
  //       role: userType,
  //       enrolledCourses,
  //       enrolledCourseIDs,
  //       completedPrograms,
  //       completedModules,
  //       completedResources,
  //       completedTopics,
  //       completedQuizzes,
  //       attemptedQuizzes
  //     }

  //     return NextResponse.json({ user: userData }, { status: 200 })

  //   } catch (error) {
  //     console.error("Refresh user error:", error)
  //     return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  //   }
  // }
}
