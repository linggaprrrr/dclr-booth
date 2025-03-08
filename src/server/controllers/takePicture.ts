import { Request, Response } from "express";
import path from "path";
import { capturePhoto } from "../services/camera";

const takePicture = async (req: Request, res: Response) => {
  try {
    const filepath = await capturePhoto();
    const filename = path.basename(filepath);

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