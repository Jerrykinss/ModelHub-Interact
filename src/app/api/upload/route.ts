import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import fs from "node:fs/promises";

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, since we're handling file uploads
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    // Process all files in the FormData
    const files = formData.getAll("files") as File[];
    const filePaths = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);
      const filePath = `./public/uploads/${file.name}`;
      await fs.writeFile(filePath, buffer);
      filePaths.push(filePath);
    }

    revalidatePath("/");

    return NextResponse.json({ status: "success", filePaths });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ status: "fail", error: e.message });
  }
}
