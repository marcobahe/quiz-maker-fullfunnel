import { createUploadthing } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Image uploader - max 4MB
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Image upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),

  // Audio uploader - max 16MB
  audioUploader: f({ audio: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new Error("Unauthorized");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Audio upload complete for userId:", metadata.userId);
      console.log("File URL:", file.url);
      return { url: file.url };
    }),
};

export default ourFileRouter;
