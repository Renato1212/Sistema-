import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Storage } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { key } = await params;

  const attachment = await prisma.attachment.findUnique({ where: { storageKey: key } });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let buffer: Buffer;
  try {
    buffer = await Storage.get(key, attachment.data);
  } catch {
    return NextResponse.json({ error: "Arquivo não encontrado" }, { status: 404 });
  }

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      "Content-Type": attachment.mimeType,
      "Content-Disposition": `inline; filename="${attachment.fileName}"`,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
