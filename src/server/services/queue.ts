import Queue, { Job, JobOptions, QueueOptions } from 'bull';
import fs from 'fs';
import { HttpClient, HttpClientConfig } from '../../../utils/http';

// Type definitions for job data
interface UploadJobData {
  filepath: string;
  filename: string;
  trxId: string;
}

interface UploadJobResult {
  success: boolean;
  filename: string;
  error?: string;
}

// Queue configuration
const UPLOAD_QUEUE = 'photo-upload';
const MAX_RETRY_ATTEMPTS = 5;

// Redis configuration
const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const defaultJobOptions: JobOptions = {
  attempts: MAX_RETRY_ATTEMPTS,
  backoff: {
    type: 'exponential',
    delay: 3000, // Start with 3 seconds
  },
  removeOnComplete: false,
  removeOnFail: false,
};

const queueOptions: QueueOptions = {
  defaultJobOptions,
  limiter: {
    max: 2, // Maximum number of jobs processed concurrently
    duration: 1000, // Per second
  },
};

/**
 * Process a photo upload job
 * @param job The Bull job containing upload data
 * @returns Promise resolving to the upload result
 */
async function processUploadJob(job: Job<UploadJobData>): Promise<UploadJobResult> {
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
    
    // Get API config from job data or throw error
    const httpClient = job.queue.client as unknown as { apiConfig: HttpClientConfig };
    if (!httpClient.apiConfig) {
      throw new Error('API configuration not available');
    }
    
    const client = new HttpClient(httpClient.apiConfig);
    const fileBuffer = fs.readFileSync(filepath);
    const file = new Blob([fileBuffer]);
    
    await client.uploadFile("/photos/upload/" + trxId, {
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
    console.error(`[UPLOAD] [ATTEMPT ${job.attemptsMade + 1}/${MAX_RETRY_ATTEMPTS}] Error uploading ${filename}: ${errorMessage}`);
    
    // If this is the final attempt, delete the file to avoid clutter
    if (job.attemptsMade + 1 >= MAX_RETRY_ATTEMPTS) {
      await cleanupFile(filepath, true);
    }
    
    throw error; // This will trigger a retry if attempts remain
  }
}

/**
 * Helper function to safely clean up a file
 * @param filepath Path of the file to clean up
 * @param isFinalAttempt Whether this is the final upload attempt
 */
async function cleanupFile(filepath: string, isFinalAttempt = false): Promise<void> {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      if (isFinalAttempt) {
        console.log(`[UPLOAD] [CLEANUP] Deleted file ${filepath} after ${MAX_RETRY_ATTEMPTS} failed upload attempts`);
      } else {
        console.log(`[UPLOAD] [CLEANUP] Deleted file ${filepath} after successful upload`);
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[UPLOAD] [ERROR] Failed to delete file ${filepath}: ${errorMessage}`);
  }
}

/**
 * Creates and configures a Bull queue for photo uploads
 * @param apiConfig The API configuration for uploads
 * @returns Configured Bull queue
 */
export function createUploadQueue(apiConfig: HttpClientConfig): Queue.Queue<UploadJobData> {
  const uploadQueue = new Queue<UploadJobData>(UPLOAD_QUEUE, REDIS_URL, queueOptions);
  
  // Store API config on the queue client for access in the processor
  (uploadQueue.client as any).apiConfig = apiConfig;
  
  // Process jobs in the queue
  uploadQueue.process(processUploadJob);

  // Handle job completion
  uploadQueue.on('completed', (job: Job<UploadJobData>, result: UploadJobResult) => {
    console.log(`[UPLOAD] [JOB ${job.id}] Completed for file: ${job.data.filename}`);
  });

  // Handle failed jobs (after all retries)
  uploadQueue.on('failed', (job: Job<UploadJobData>, error: Error) => {
    console.error(`[UPLOAD] [JOB ${job.id}] Failed after ${MAX_RETRY_ATTEMPTS} attempts for file: ${job.data.filename}`, error.message);
  });
  
  // Handle queue errors
  uploadQueue.on('error', (error: Error) => {
    console.error(`[UPLOAD] [QUEUE] Error in upload queue: ${error.message}`);
  });
  
  // Log when queue is ready
  uploadQueue.on('ready', () => {
    console.log('[UPLOAD] [QUEUE] Upload queue is ready');
  });

  return uploadQueue;
}

/**
 * Adds a picture to the upload queue
 * @param queue Bull queue instance
 * @param filepath Path to the file to upload
 * @param filename Name of the file
 * @param trxId Transaction ID for the upload
 * @returns Promise for the added job
 */
export async function queuePictureUpload(
  queue: Queue.Queue<UploadJobData>,
  filepath: string,
  filename: string,
  trxId: string
): Promise<Job<UploadJobData>> {
  // Validate inputs
  if (!filepath || !filename || !trxId) {
    throw new Error('Invalid upload parameters: filepath, filename, and trxId are required');
  }
  
  // Check that file exists before queuing
  if (!fs.existsSync(filepath)) {
    throw new Error(`Cannot queue file ${filepath} for upload: file not found`);
  }
  
  const job = await queue.add({
    filepath,
    filename,
    trxId,
  });
  
  console.log(`[UPLOAD] [QUEUED] Picture ${filename} added to upload queue (Job ID: ${job.id})`);
  return job;
} 