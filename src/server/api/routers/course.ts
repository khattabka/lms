import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

import Mux from "@mux/mux-node";

const { video } = new Mux(
  process.env.MUX_TOKEN_ID,
  // @ts-ignore
  process.env.MUX_TOKEN_SECRET!,
);

export const courseRouter = createTRPCRouter({
  createCourse: privateProcedure
    .input(z.object({ title: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const { userId, user, db } = ctx;

      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const course = await db.course.create({
        data: {
          title: input.title,
          userId,
        },
      });
      return course;
    }),

  getCourseById: privateProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const { db, userId, user } = ctx;

      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const course = await db.course.findUnique({
        where: { id: input, userId },
        include: {
          attachments: {
            orderBy: {
              createdAt: "desc",
            },
          },
          chapters: {
            orderBy: {
              position: "asc",
            },
          },
          category: true,
        },
      });

      return course;
    }),

  updateCourseTitle: privateProcedure
    .input(z.object({ id: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const course = await db.course.update({
        where: { id: input.id, userId },
        data: { title: input.title },
      });

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return course;
    }),

  updateCourseDescription: privateProcedure
    .input(z.object({ id: z.string(), description: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const course = await db.course.update({
        where: { id: input.id, userId },
        data: { description: input.description },
      });

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return course;
    }),

  uploadCourseImage: privateProcedure
    .input(z.object({ id: z.string(), imageUrl: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;

      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const course = await db.course.update({
        where: { id: input.id, userId },
        data: { imageUrl: input.imageUrl },
      });

      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return course;
    }),
  uploadCourseAttachment: privateProcedure
    .input(
      z.object({
        courseId: z.string(),
        attachmentUrl: z.string(),
        attachmentType: z.string(),
        attachmentName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const attachment = await db.attachment.create({
        data: {
          name: input.attachmentName.split(".").slice(0, -1).join("."),
          url: input.attachmentUrl,
          type: input.attachmentType.split("/")[1] as any,
          courseId: input.courseId,
          userId,
        },
      });
      return attachment;
    }),

  deleteSingleAttachment: privateProcedure
    .input(z.object({ attachmentId: z.string(), courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const attachment = await db.attachment.delete({
        where: { id: input.attachmentId, userId },
      });
      if (!attachment) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return attachment;
    }),
  deleteAllAttachments: privateProcedure
    .input(z.object({ courseId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const attachments = await db.attachment.deleteMany({
        where: { courseId: input.courseId, userId },
      });
      if (!attachments) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return attachments;
    }),
  setCategory: privateProcedure
    .input(z.object({ id: z.string(), categoryId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const course = await db.course.update({
        where: { id: input.id, userId },
        data: { categoryId: input.categoryId },
      });
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return course;
    }),

  getCategoryById: privateProcedure
    .input(z.any())
    .query(async ({ ctx, input }) => {
      const { db } = ctx;

      const category = await db.category.findUnique({
        where: { id: input },
      });
      if (!category) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return category;
    }),

  setCoursePrice: privateProcedure
    .input(z.object({ id: z.string(), price: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const course = await db.course.update({
        where: { id: input.id, userId },
        data: { price: input.price },
      });
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return course;
    }),

  createChapterTitle: privateProcedure
    .input(z.object({ courseId: z.string(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const lastChapter = await db.chapter.findFirst({
        where: {
          courseId: input.courseId,
        },
        orderBy: {
          position: "desc",
        },
      });

      const newPosition = lastChapter ? lastChapter.position + 1 : 1;
      const chapter = await db.chapter.create({
        data: {
          title: input.title,
          courseId: input.courseId,
          position: newPosition,
        },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return chapter;
    }),

  editChapterTitle: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
        title: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const chapter = await db.chapter.update({
        where: { id: input.chapterId, courseId: input.courseId },
        data: { title: input.title },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return chapter;
    }),
  editChapterDescription: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
        description: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const chapter = await db.chapter.update({
        where: { id: input.chapterId, courseId: input.courseId },
        data: { description: input.description },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return chapter;
    }),

  editChapterStatus: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
        status: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const chapter = await db.chapter.update({
        where: { id: input.chapterId, courseId: input.courseId },
        data: { isFree: input.status },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return chapter;
    }),

  addChapterVideoUrl: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
        videoUrl: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const chapter = await db.chapter.update({
        where: { id: input.chapterId, courseId: input.courseId },
        data: { videoUrl: input.videoUrl },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Handle Video Upload to Mux
      if (input.videoUrl) {
        const existingMuxData = await db.muxData.findFirst({
          where: {
            chapterId: input.chapterId,
          },
        });
        if (existingMuxData) {
          await video.assets.delete(existingMuxData?.assetId!);
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
            },
          });
        }
        const asset = await video.assets.create({
          input: [{ url: input.videoUrl }],
          playback_policy: ["public"],
          test: false,
        });

        await db.muxData.create({
          data: {
            chapterId: input.chapterId,
            assetId: asset.id,
            playbackId: asset.playback_ids?.[0]?.id,
          },
        });
      }
      return chapter;
    }),
  updateChaptersAfterReorder: privateProcedure
    .input(
      z.object({
        courseId: z.string(),
        chapterList: z.array(
          z.object({ id: z.string(), position: z.number() }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      for (let chapter of input.chapterList) {
        await db.chapter.update({
          where: { id: chapter.id },
          data: { position: chapter.position },
        });
      }

      return {
        success: true,
      };
    }),
  deleteChapterById: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const chapterToBeDeleted = await db.chapter.findUnique({
        where: { id: input.chapterId, courseId: input.courseId },
      });
      if (!chapterToBeDeleted) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      if (chapterToBeDeleted.videoUrl) {
        const existingMuxData = await db.muxData.findFirst({
          where: {
            chapterId: input.chapterId,
          },
        });

        if (existingMuxData) {
          await video.assets.delete(existingMuxData?.assetId!);
          await db.muxData.delete({
            where: {
              id: existingMuxData.id,
              assetId: existingMuxData.assetId,
            },
          });
        }
      }

      const deletedChapter = await db.chapter.delete({
        where: { id: input.chapterId, courseId: input.courseId },
      });

      const publishedChaptersInCourse = await db.chapter.findMany({
        where: { courseId: input.courseId, isPublished: true },
      });

      if (publishedChaptersInCourse.length === 0) {
        await db.course.update({
          where: { id: input.courseId },
          data: { isPublished: false },
        });
      }

      return deletedChapter;
    }),
  deleteCourseById: privateProcedure
    .input(
      z.object({
        courseId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !user.id) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const course = await db.course.findUnique({
        where: { id: input.courseId, userId },
        include: {
          chapters: {
            include: { MuxData: true },
          },
        },
      });
      if (!course) {
        console.log("COURSE TO BE DELETED NOT FOUND");
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      for (const chapter of course.chapters) {
        if (chapter.MuxData?.assetId) {
          await video.assets.delete(chapter.MuxData?.assetId);
        }
      }

      const deletedCourse = await db.course.delete({
        where: {
          id: input.courseId,
        },
      });

      return deletedCourse;
    }),
  getChapterById: privateProcedure
    .input(z.object({ chapterId: z.string(), courseId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { db, userId, user } = ctx;

      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const chapter = await db.chapter.findUnique({
        where: { id: input.chapterId, courseId: input.courseId },
        include: { MuxData: true },
      });

      if (!chapter) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return chapter;
    }),

  publishChapter: privateProcedure
    .input(
      z.object({
        chapterId: z.string(),
        courseId: z.string(),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const muxData = await db.muxData.findUnique({
        where: { chapterId: input.chapterId },
      });
      const chapter = await db.chapter.findUnique({
        where: { id: input.chapterId, courseId: input.courseId },
      });
      if (
        !chapter ||
        !muxData ||
        !chapter.videoUrl ||
        !chapter.title ||
        !chapter.description
      ) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }
      if (input.isPublished) {
        await db.chapter.update({
          where: { id: input.chapterId, courseId: input.courseId },
          data: { isPublished: false },
        });

        const publishedChaptersInCourse = await db.chapter.findMany({
          where: { courseId: input.courseId, isPublished: true },
        });
        if (publishedChaptersInCourse.length === 0) {
          await db.course.update({
            where: { id: input.courseId },
            data: { isPublished: false },
          });
        }
      }
      if (!input.isPublished) {
        await db.chapter.update({
          where: { id: input.chapterId, courseId: input.courseId },
          data: { isPublished: true },
        });
      }
    }),
  publishCourse: privateProcedure
    .input(
      z.object({
        courseId: z.string(),
        isPublished: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db, user, userId } = ctx;
      if (!user || !userId) {
        console.log("unauthorized");
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const courseOwner = await db.course.findUnique({
        where: { id: input.courseId, userId },
      });
      if (!courseOwner) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be the owner of the course to publish it",
        });
      }

      const course = await db.course.findUnique({
        where: { id: input.courseId },
        include: {
          chapters: {
            include: {
              MuxData: true,
            },
          },
        },
      });
      if (!course) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Course not found" });
      }
      if (input.isPublished) {
        await db.course.update({
          where: { id: input.courseId, userId },
          data: { isPublished: false },
        });
        return course;
      }

      if (!input.isPublished) {
        const hasPublishedChapter = course?.chapters.some(
          (chapter) => chapter.isPublished,
        );
        if (
          !course ||
          !course.price ||
          !course.categoryId ||
          !course.title ||
          !course.description ||
          !hasPublishedChapter
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "Course must have price, category, title, description and at least one chapter that's published",
          });
        }
        await db.course.update({
          where: { id: input.courseId, userId },
          data: { isPublished: true },
        });
        return course;
      }
    }),

  getCategories: privateProcedure.query(async ({ ctx }) => {
    const { db, user, userId } = ctx;

    if (!user || !user.id) {
      console.log("unauthorized");
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    const categories = await db.category.findMany({
      orderBy: { name: "asc" },
    });
    return categories;
  }),
  getAllCourses: privateProcedure.query(async ({ ctx }) => {
    const { db } = ctx;
    const courses = await db.course.findMany({
      orderBy: { createdAt: "desc" },
    });
    return courses;
  }),
});
