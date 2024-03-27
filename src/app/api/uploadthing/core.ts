import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
 
const f = createUploadthing();
 
 
// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  //* COURSE IMAGE UPLOAD
  courseImage: f({ image: { maxFileSize: "8MB", maxFileCount: 1 } })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      const user =  auth()
      if (!user || !user.userId) throw new UploadThingError("Unauthorized");
      return { userId: user.userId };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);
 
      console.log("file url", file.url);
 
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

//* COURSE ATTTACHMENTS UPLOAD
courseAttachments: f(['text','image', 'pdf', 'video', "audio" ])
.middleware(async ({ req }) => {
  const user =  auth()
  if (!user || !user.userId) throw new UploadThingError("Unauthorized");
  return { userId: user.userId };
}).onUploadComplete(async ({ metadata, file }) => {

  console.log("Upload complete for userId:", metadata.userId);
}),
  
//* COURSE CHAPTER VIDEO UPLOAD
chapterVideo: f({ video: { maxFileSize: "512GB", maxFileCount: 1 } })
.middleware(async ({ req }) => {
  const user =  auth()
  if (!user || !user.userId) throw new UploadThingError("Unauthorized");
  return { userId: user.userId };
}).onUploadComplete(async ({ metadata, file }) => {

  console.log("Upload complete for userId:", metadata.userId);
})

} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;