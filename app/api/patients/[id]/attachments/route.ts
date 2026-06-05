import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { Storage, attachmentSelect, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "@/lib/storage";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const attachments = await prisma.attachment.findMany({
    where: { patientId: id },
    select: attachmentSelect,
    orderBy: { uploadedAt: "desc" },
  });
  return NextResponse.json(attachments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Falha ao ler o arquivo enviado" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file || typeof file === "string" || file.size === 0) {
    return NextResponse.json({ error: "Arquivo obrigatório" }, { status: 400 });
  }
  if (!type) return NextResponse.json({ error: "Tipo obrigatório" }, { status: 400 });
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de arquivo não permitido (JPEG, PNG, WebP, PDF)" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Arquivo muito grande (máx. 10MB)" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { storageKey, data } = await Storage.save(buffer, file.name, file.type);

    const attachment = await prisma.attachment.create({
      data: {
        patientId: id,
        type,
        fileName: file.name,
        storageKey,
        mimeType: file.type,
        sizeBytes: file.size,
        data,
        uploadedByUserId: session.user!.id!,
      },
      select: attachmentSelect,
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (err) {
    console.error("Attachment upload failed:", err);
    return NextResponse.json({ error: "Erro ao salvar o arquivo" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const attachmentId = searchParams.get("attachmentId");
  if (!attachmentId) return NextResponse.json({ error: "attachmentId required" }, { status: 400 });

  const attachment = await prisma.attachment.findUnique({ where: { id: attachmentId } });
  if (!attachment) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await Storage.delete(attachment.storageKey, attachment.data);
  await prisma.attachment.delete({ where: { id: attachmentId } });
  return NextResponse.json({ ok: true });
}
