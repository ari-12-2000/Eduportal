import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { prisma } from '@/lib/prisma';
import { Admin, Program } from "@/lib/generated/prisma";
import { GlobalVariables } from "@/globalVariables";
import { Course } from "@/types/course";

const JWT_SECRET = process.env.JWT_SECRET!

export class AuthController {
  static async login(req: NextRequest) {
    try {
      const { email, password } = await req.json()

      if (!email?.trim() || !password?.trim()) {
        return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
      }

      let learner = await prisma.learner.findUnique({
        where: { email },
        include: {
          enrollments: {
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
          }
        }
      })

      let userType = GlobalVariables.non_admin.role1;
      let enrolledCourses: Course[] = []
      let enrolledCourseIDs: number[] = []
      let completedPrograms: number[] = []
      let completedModules: number[] = []
      let completedResources: number[] = []
      let completedTopics: number[] = []
      let admin

      if (!learner) {
        admin = await prisma.admin.findUnique({ where: { email } })
        if (!admin) {
          return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
        }
        userType = GlobalVariables.admin
      } else {
        enrolledCourses = learner.enrollments.map(e => ({
          ...e.program,
          price: e.program.price !== null ? e.program.price.toString() : null
        }))
        enrolledCourseIDs = learner.enrollments.map(e => e.program.id)
        learner.measureProgress.forEach((progress: any) => {
          if (progress.program?.id) {
            completedPrograms.push(progress.program.id)
          }
          if (progress.module?.id) {
            completedModules.push(progress.module.id)
          }
          if (progress.resource?.id) {
            completedResources.push(progress.resource.id)
          }
          if (progress.topic?.id) {
            completedTopics.push(progress.topic.id)
          }
        })
      }

      const user = admin || learner
      const isPasswordValid = await bcrypt.compare(password, user!.password!)
      if (!isPasswordValid) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      if (userType === GlobalVariables.admin) {
        await prisma.admin.update({
          where: { email },
          data: { lastLogin: new Date() },
        })
      }

      const token = jwt.sign(
        {
          id: user!.id,
          email: user!.email,
          role: userType,
          adminType: userType === GlobalVariables.admin ? (user as Admin).adminType : undefined,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      )

      const userData = {
        id: user!.id,
        email: user!.email,
        first_name: user!.first_name,
        last_name: user!.last_name,
        profile_image: user!.profile_image || "",
        role: userType,
        adminType: userType === GlobalVariables.admin ? (user as Admin).adminType : undefined,
        enrolledCourses,
        enrolledCourseIDs,
        completedPrograms,
        completedModules,
        completedResources,
        completedTopics
      }

      return NextResponse.json({ success: true, user: userData, token }, { status: 200 })

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

      const token = jwt.sign(
        {
          id: newUser.id,
          email: newUser.email,
          role
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      )


      const userData = {
        id: newUser.id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email,
        role,
        profile_image: newUser.profile_image || "",
        enrolledCourses: [],
        completedPrograms: [],
        completedModules: [],
        completedResources: [],
        completedTopics: []
      }

      return NextResponse.json({
        success: true,
        user: userData,
        token,
        message: "Account created successfully",
      }, { status: 201 })

    } catch (error) {
      console.error("Signup error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  static async refreshUser(req: NextRequest) {
    try {
      const token = req.headers.get("Authorization")?.split(" ")[1]
      if (!token) {
        return NextResponse.json({ error: "No token provided" }, { status: 401 })
      }
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number, email: string, role: string, adminType?: string }
      const learner = await prisma.learner.findUnique({
        where: { id: decoded.id },
        include: {
          enrollments: {
            include: {
              program: {
                include: {
                  programModules: {
                    include: {
                      module: {
                        include: {
                          moduleTopics: {
                            select: { topicId: true },
                          },
                        },
                      },
                    },
                  },
                  enrollments: {
                    select: { learnerId: true },
                  },
                },
              },
            },
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
          }
        },
      })

      let userType = GlobalVariables.non_admin.role1
      let enrolledCourses: Course[] = []
      let enrolledCourseIDs: number[] = []
      let completedPrograms: number[] = []
      let completedModules: number[] = []
      let completedResources: number[] = []
      let completedTopics: number[] = []

      if (!learner) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      enrolledCourses = learner.enrollments.map(e => ({
        ...e.program,
        price: e.program.price !== null ? e.program.price.toString() : null
      }))
      enrolledCourseIDs = learner.enrollments.map(e => e.program.id)
      learner.measureProgress.forEach((progress: any) => {
          if (progress.program?.id) {
            completedPrograms.push(progress.program.id)
          }
          if (progress.module?.id) {
            completedModules.push(progress.module.id)
          }
          if (progress.resource?.id) {
            completedResources.push(progress.resource.id)
          }
          if (progress.topic?.id) {
            completedTopics.push(progress.topic.id)
          }
        })

      const userData = {
        id: learner.id,
        email: learner.email,
        first_name: learner.first_name,
        last_name: learner.last_name,
        profile_image: learner.profile_image || "",
        role: userType,
        enrolledCourses,
        enrolledCourseIDs,
        completedPrograms,
        completedModules,
        completedResources,
        completedTopics
      }

      return NextResponse.json({ user: userData }, { status: 200 })

    } catch (error) {
      console.error("Refresh user error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
