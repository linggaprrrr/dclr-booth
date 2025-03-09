import { Request, Response } from "express";
import fs from 'fs'
import path from "path";

const listPictures = async (_req: Request, res: Response) => {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error("Error reading uploads directory:", err);
      return res.status(500).json({ error: "Failed to read photos" });
    }

    const photos = files
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
      .map((filename) => ({
        filename,
        path: `/uploads/${filename}`,
      }));

    res.json({ photos });
  });
}

export default listPictures;
