import { Request, Response } from "express";

import dotenv from "dotenv"
dotenv.config()

import path from "path";
import fs from "fs";
import { capturePhoto } from "../services/camera";
import { HttpClient, HttpClientConfig } from "../../../utils/http";


const apiConfig: HttpClientConfig = {
  baseURL: process.env.API_URL as string,
  apiKey: process.env.API_KEY as string,
}

const uploadPicture = async (filepath: string, filename: string) => {
  try {
    const httpClient = new HttpClient(apiConfig);
    const fileBuffer = fs.readFileSync(filepath);
    const file = new Blob([fileBuffer]);
    await httpClient.uploadFile("/photos/upload", {
      fieldName: "photo",
      fileName: filename,
      file,
    });
    console.log("Picture uploaded successfully");
    fs.unlinkSync(filepath);
  } catch (error) {
    console.error("Error uploading picture:", error);
  }
}

const takePicture = async (req: Request, res: Response) => {
  try {
    // Ensure uploads directory exists with proper permissions
    const uploadsDir = path.join(process.cwd(), "uploads");
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

    // non blocking upload
    uploadPicture(filepath, filename);

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