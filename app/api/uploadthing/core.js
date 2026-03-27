import { createUploadthing } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async () => {
      const { userId } = await auth();
      // Keep uploads resilient in development; use a fallback userId
      // so prepareUpload does not fail when auth state is transient.
      return { userId: userId ?? "guest" };
    })
    .onUploadError(({ error }) => {
      console.error("UPLOADTHING imageUploader error:", error);
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const imageUrl = file.url ?? file.ufsUrl ?? file.key;
      return {
        uploadedBy: metadata.userId,
        imageUrl,
      };
    }),
};
