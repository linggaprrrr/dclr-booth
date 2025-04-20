import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { capturePhoto } from "../services/camera";
import { HttpClientConfig } from "../../../utils/http";
import { createUploadQueue, queuePictureUpload } from "../services/queue";

// Initialize environment variables
dotenv.config();

// Type definition for API response
interface ApiResponse {
  success: boolean;
  file?: {
    path: string;
  };
  error?: string;
}

// API configuration
const apiConfig: HttpClientConfig = {
  baseURL: process.env.API_URL as string,
  apiKey: process.env.API_KEY as string,
};

// Validate API configuration
if (!apiConfig.baseURL || !apiConfig.apiKey) {
  console.error('[CAMERA] Missing required API configuration. Check your .env file.');
}

// Create queue instance once (outside of routes)
const uploadQueue = createUploadQueue();

/**
 * Controller to handle taking a picture and queueing it for upload
 * 
 * @param req - Express request object containing transaction ID in params
 * @param res - Express response object
 */
const takePicture = async (req: Request, res: Response): Promise<void> => {
  // Validate transaction ID
  if (!req.params.id) {
    res.status(400).json({
      success: false,
      error: "Missing required parameter: transaction ID",
    });
    return;
  }

  try {
    // Ensure uploads directory exists with proper permissions
    const trxId = req.params.id;
    const uploadsDir = path.join(process.cwd(), "uploads", trxId);
    await ensureDirectoryExists(uploadsDir);
    console.log('upload dir', uploadsDir)
    // Capture photo with the camera service
    const filepath = await capturePhoto({
      directory: uploadsDir
    }, trxId);
    
    if (!filepath) {
      throw new Error("Failed to capture photo: no filepath returned");
    }
    
    const filename = path.basename(filepath);
    
    // Ensure the file has proper permissions
    fs.chmodSync(filepath, 0o666); // 666 permissions for the file (read, write for all)

    // Queue the upload
    await queuePictureUpload(uploadQueue, filepath, filename, trxId);

    // Send success response
    const response: ApiResponse = {
      success: true,
      file: {
        path: "/uploads/" + trxId + "/" + filename,
      },
    };
    
    res.json(response);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CAMERA] [ERROR] Error capturing photo: ${errorMessage}`);
    
    const response: ApiResponse = {
      success: false,
      error: errorMessage,
    };
    
    res.status(500).json(response);
  }
};

/**
 * Ensures a directory exists with proper permissions
 * 
 * @param dirPath - Path to the directory
 * @returns Promise resolving when directory is ready
 */
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      // Set directory permissions to 777 (read, write, execute for all)
      fs.chmodSync(dirPath, 0o777);
      console.log(`[CAMERA] [SETUP] Created directory: ${dirPath}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[CAMERA] [SETUP] Error creating directory ${dirPath}: ${errorMessage}`);
    throw new Error(`Failed to create uploads directory: ${errorMessage}`);
  }
}

export default takePicture;