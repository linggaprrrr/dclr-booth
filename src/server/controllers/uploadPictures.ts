import { Request, Response } from "express";
import { listPictures } from "../services/camera";
import fs from "fs";
import path from 'path';
import dotenv from "dotenv";
import { createUploadQueue, queuePictureUpload } from "../services/queue";
import { HttpClientConfig } from "../../../utils/http";

// Initialize environment variables
dotenv.config();

// Type definition for API responses
interface ApiResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

// API configuration
const apiConfig: HttpClientConfig = {
  baseURL: process.env.API_URL as string,
  apiKey: process.env.API_KEY as string,
};

// Validate API configuration
if (!apiConfig.baseURL || !apiConfig.apiKey) {
  console.error('[UPLOAD] Missing required API configuration. Check your .env file.');
}

// Create queue instance once (outside of routes)
const uploadQueue = createUploadQueue(apiConfig);

/**
 * Controller to handle bulk upload of pictures
 * 
 * @param req - Express request object containing transactionId in body
 * @param res - Express response object
 */
const uploadPictures = async (req: Request, res: Response): Promise<void> => {
  // Validate request parameters
  if (!req.body.transactionId) {
    res.status(400).json({
      success: false,
      message: "Missing required parameter: transactionId",
    });
    return;
  }

  const errors: string[] = [];
  let queuedCount = 0;

  try {
    const photos = await listPictures();
    
    if (photos.length === 0) {
      res.status(200).json({
        success: true,
        message: "No photos found to upload",
      });
      return;
    }

    // Process each photo
    for (const photo of photos) {
      try {
        const filepath = path.join(__dirname, "..", "..", "..", photo.path);
        
        // Validate file exists
        if (!fs.existsSync(filepath)) {
          errors.push(`File not found: ${photo.filename}`);
          continue;
        }
        
        // Queue photo for upload
        await queuePictureUpload(
          uploadQueue, 
          filepath, 
          photo.filename, 
          req.body.transactionId
        );
        
        queuedCount++;
      } catch (photoError) {
        const errorMessage = photoError instanceof Error ? photoError.message : String(photoError);
        errors.push(`Failed to queue ${photo.filename}: ${errorMessage}`);
        console.error(`[UPLOAD] [ERROR] Failed to queue ${photo.filename}: ${errorMessage}`);
      }
    }

    // Construct response based on results
    const response: ApiResponse = {
      success: queuedCount > 0,
      message: `${queuedCount} of ${photos.length} photos queued for upload with retry capability`,
    };
    
    if (errors.length > 0) {
      response.errors = errors;
    }

    // Send appropriate response
    const statusCode = errors.length === photos.length ? 500 : 200;
    res.status(statusCode).json(response);
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[UPLOAD] [CONTROLLER] Error queuing photos: ${errorMessage}`);
    
    res.status(500).json({
      success: false,
      message: "Error processing upload request",
      errors: [errorMessage],
    });
  }
};

export default uploadPictures;