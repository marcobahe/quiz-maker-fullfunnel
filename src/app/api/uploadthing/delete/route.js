import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UTApi } from "uploadthing/server";
import { handleApiError } from "@/lib/apiError";
import { checkRateLimit } from "@/lib/rateLimit";
import { deleteFilesSchema } from "@/lib/schemas/uploadthing.schema";

const utapi = new UTApi();

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 20 file deletions per user per minute
    const rl = checkRateLimit(`uploadthing:delete:${session.user.id}`, { max: 20, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em instantes." },
        { status: 429, headers: { "Retry-After": String(rl.retryAfter) } }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parsed = deleteFilesSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { fileKey, fileKeys } = parsed.data;

    const keys = fileKeys || (fileKey ? [fileKey] : []);
    if (keys.length === 0) {
      return NextResponse.json(
        { error: "fileKey or fileKeys required" },
        { status: 400 }
      );
    }

    // Verify ownership in DB before deleting
    const assets = await prisma.mediaAsset.findMany({
      where: {
        fileKey: { in: keys },
        userId: session.user.id,
      },
      select: { fileKey: true },
    });

    const ownedKeys = assets.map((a) => a.fileKey);
    if (ownedKeys.length === 0) {
      return NextResponse.json(
        { error: "No files found or not authorized" },
        { status: 403 }
      );
    }

    // Delete from Uploadthing CDN
    const deleteRes = await utapi.deleteFiles(ownedKeys);
    console.log("[UPLOADTHING] deleteFiles response:", JSON.stringify(deleteRes));

    // Delete from DB
    await prisma.mediaAsset.deleteMany({
      where: {
        fileKey: { in: ownedKeys },
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      deleted: ownedKeys,
      skipped: keys.filter((k) => !ownedKeys.includes(k)),
    });
  } catch (err) {
    return handleApiError(err, { route: '/api/uploadthing/delete', method: 'POST', userId: null });
  }
}
