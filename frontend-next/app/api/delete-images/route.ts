import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { files }: { files: string[] } = await req.json();

    const uploadDir = path.join(process.cwd(), "public/product-images");

    files.forEach((fileName) => {
      const filePath = path.join(uploadDir, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Datei löschen
      }
    });

    return NextResponse.json({ deleted: files });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Löschen fehlgeschlagen", error: err.message },
      { status: 500 }
    );
  }
}