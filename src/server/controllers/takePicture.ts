import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { capturePhoto } from "../services/camera";

const takePicture = async (req: Request, res: Response) => {
  try {
    // Ensure uploads directory exists with proper permissions
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      // Set directory permissions to 777 (read, write, execute for all)
      fs.chmodSync(uploadsDir, 0o777);
    }

    // Capture photo with the camera service
    const filepath = await capturePhoto({
      directory: uploadsDir
    });
    const filename = path.basename(filepath);
    
    // Ensure the file has proper permissions
    fs.chmodSync(filepath, 0o666); // 666 permissions for the file (read, write for all)

    res.json({
      success: true,
      file: {
        path: "/uploads/" + filename,
      },
    });
  } catch (error) {
    console.error("Error capturing photo:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export default takePicture;