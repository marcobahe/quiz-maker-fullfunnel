import { UTApi } from "uploadthing/server";
import prisma from "./prisma";

const utapi = new UTApi();

/**
 * Extract fileKeys from a canvasData JSON string by looking for utfs.io URLs.
 * @param {string} canvasDataJson
 * @returns {string[]}
 */
export function extractUtfsKeys(canvasDataJson) {
  if (!canvasDataJson) return [];
  try {
    const data = typeof canvasDataJson === "string" ? JSON.parse(canvasDataJson) : canvasDataJson;
    const keys = new Set();

    const collect = (obj) => {
      if (!obj || typeof obj !== "object") return;
      for (const val of Object.values(obj)) {
        if (typeof val === "string" && val.includes("utfs.io")) {
          const key = val.split("/f/")[1]?.split("?")[0];
          if (key) keys.add(key);
        } else if (typeof val === "object") {
          collect(val);
        }
      }
    };

    collect(data);
    return Array.from(keys);
  } catch {
    return [];
  }
}

/**
 * Delete Uploadthing files and their DB records for a given list of fileKeys.
 * Non-blocking: logs errors but does not throw.
 *
 * @param {string[]} fileKeys
 * @param {string} userId
 */
export async function deleteUploadAssets(fileKeys, userId) {
  if (!fileKeys?.length) return;

  try {
    await utapi.deleteFiles(fileKeys);
  } catch (err) {
    console.error("[UPLOADTHING] cleanup deleteFiles failed:", err.message);
  }

  try {
    await prisma.mediaAsset.deleteMany({
      where: {
        fileKey: { in: fileKeys },
        userId,
      },
    });
  } catch (err) {
    console.error("[UPLOADTHING] cleanup DB delete failed:", err.message);
  }
}

/**
 * Clean up all Uploadthing assets belonging to a quiz (and its variants).
 * @param {string} quizId
 * @param {string} userId
 */
export async function cleanupQuizUploads(quizId, userId) {
  const quizzes = await prisma.quiz.findMany({
    where: {
      OR: [{ id: quizId }, { parentId: quizId }],
      userId,
    },
    select: { canvasData: true },
  });

  const allKeys = quizzes.flatMap((q) => extractUtfsKeys(q.canvasData));
  if (allKeys.length === 0) return;

  // Deduplicate
  const uniqueKeys = [...new Set(allKeys)];
  await deleteUploadAssets(uniqueKeys, userId);
}
