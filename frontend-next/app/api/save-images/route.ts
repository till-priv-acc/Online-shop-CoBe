import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const uploadDir = path.join(process.cwd(), "public/product-images");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    const savedFiles: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Filename: z.B. timestamp + original name
      const filename = file.name;
      const filepath = path.join(uploadDir, filename);

      fs.writeFileSync(filepath, buffer);
      savedFiles.push(filename);
    }

    return NextResponse.json({ savedFiles });
  } catch (err: any) {
    return NextResponse.json({ message: "Upload fehlgeschlagen", error: err.message }, { status: 500 });
  }
}