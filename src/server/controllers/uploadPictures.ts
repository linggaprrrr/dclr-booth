import { Request, Response } from "express";
import { HttpClient, HttpClientConfig } from "../../../utils/http";
import { listPictures } from "../services/camera";
import fs from "fs";
import path from 'path';
import dotenv from "dotenv"
dotenv.config()

const apiConfig: HttpClientConfig = {
  baseURL: process.env.API_URL as string,
  apiKey: process.env.API_KEY as string,
}


const uploadPictures = async (req: Request, res: Response) => {
  try {
    const httpClient = new HttpClient(apiConfig);
    const photos = await listPictures();

    await Promise.all(photos.map(async (photo) => {
      const fileBuffer = fs.readFileSync(path.join(__dirname, "..", "..", "..", photo.path));
      const file = new Blob([fileBuffer]);
      await httpClient.uploadFile("/photos/upload", {
        fieldName: "photo",
        fileName: photo.filename,
        file,
        additionalData: {
          transactionId: req.body.transactionId,
        },
      });
    }));

    res.status(200).json({
      success: true,
      message: "Photos uploaded successfully",
    });
  } catch (error) {
    console.error("Error uploading photos:", error);
    res.status(500).json({
      success: false,
      message: "Error uploading photos",
    });
  }
}
export default uploadPictures;