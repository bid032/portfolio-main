import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const uploadType = (formData.get("type") as string) || "files";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Create target directory inside /public/uploads/
    const targetDir = path.join(process.cwd(), "public", "uploads", uploadType);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Clean filename: remove only illegal filesystem characters, preserving exact original name, spaces & Unicode
    const fileName = file.name.replace(/[/\:\\?%*:|"<>]/g, "_").trim();
    const filePath = path.join(targetDir, fileName);

    // Overwrite file directly if it exists, preserving the exact uploaded filename
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uploadType}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "File upload failed" }, { status: 500 });
  }
}
