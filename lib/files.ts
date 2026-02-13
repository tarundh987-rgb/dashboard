import { writeFile, mkdir, unlink, stat } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function saveFile(file: File): Promise<string> {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const name = file.name || "uploaded-file";
    const ext = name.split(".").pop() || "bin";
    const uniqueName = `${Date.now()}-${randomUUID()}.${ext}`;

    const filePath = join(uploadDir, uniqueName);
    await writeFile(filePath, buffer);

    return `/api/file/${uniqueName}`;
  } catch (error) {
    console.error("Error saving file:", error);
    throw new Error("Failed to save file");
  }
}

export async function deleteFile(fileUrl: string): Promise<void> {
  try {
    const filename = fileUrl.split("/").pop();
    if (!filename) return;

    const filePath = join(process.cwd(), "public", "uploads", filename);

    try {
      await stat(filePath);
      await unlink(filePath);
    } catch (error: any) {
      if (error.code !== "ENOENT") {
        console.error("Error deleting file:", error);
      }
    }
  } catch (error) {
    console.error("Error in deleteFile:", error);
  }
}
