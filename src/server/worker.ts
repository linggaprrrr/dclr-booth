import { uploadPhotoQueue } from './services/queue';
import { config } from 'dotenv';
import fs from 'fs';
import { HttpClient } from '../../utils/http';

config();

// Start the worker process
console.log('[WORKER] Starting upload queue worker...');

// The worker only processes the queue and doesn't create new instances
uploadPhotoQueue.process(async (job) => {
  const { filepath, filename, trxId } = job.data;
  
  try {
    // Validate inputs
    if (!filepath || !filename || !trxId) {
      throw new Error('Invalid job data: missing required fields');
    }
    
    // Check if file exists before reading it
    if (!fs.existsSync(filepath)) {
      throw new Error(`File ${filepath} not found`);
    }

    const client = new HttpClient({
      baseURL: process.env.API_URL ?? '',
      apiKey: process.env.API_KEY,
    });
    const fileBuffer = fs.readFileSync(filepath);
    const file = new Blob([fileBuffer]);
    
    await client.uploadFile("/photos/upload", {
      fieldName: "photo",
      fileName: filename,
      file,
      additionalData: {
        transactionId: trxId,
      },
    });
    
    console.log(`[UPLOAD] [SUCCESS] Picture ${filename} uploaded successfully`);
    
    // Delete file after successful upload
    await cleanupFile(filepath);
    
    return { success: true, filename };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[UPLOAD] [ATTEMPT ${job.attemptsMade + 1}] Error uploading ${filename}: ${errorMessage}`);
    
    throw error;
  }
});

// Handle events
uploadPhotoQueue.on('completed', (job, result) => {
  console.log(`[WORKER] [JOB ${job.id}] Completed for file: ${job.data.filename}`);
});

uploadPhotoQueue.on('failed', (job, error) => {
  console.error(`[WORKER] [JOB ${job.id}] Failed for file: ${job.data.filename}`, error.message);
});

uploadPhotoQueue.on('error', (error) => {
  console.error(`[WORKER] [QUEUE] Error in upload queue: ${error.message}`);
});

uploadPhotoQueue.on('ready', () => {
  console.log('[WORKER] Upload queue worker is ready');
});

// Helper function to clean up files
async function cleanupFile(filepath: string): Promise<void> {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      console.log(`[WORKER] [CLEANUP] Deleted file ${filepath} after successful upload`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[WORKER] [ERROR] Failed to delete file ${filepath}: ${errorMessage}`);
  }
} 