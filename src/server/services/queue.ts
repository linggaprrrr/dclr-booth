import dontenv from 'dotenv';
import Queue, { Job, JobOptions, QueueOptions } from 'bull';
import fs from 'fs';
import { HttpClientConfig } from '../../../utils/http';

dontenv.config();

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

// API configuration
const apiConfig: HttpClientConfig = {
  baseURL: process.env.API_URL as string,
  apiKey: process.env.API_KEY as string,
};

// Validate API configuration
if (!apiConfig.baseURL || !apiConfig.apiKey) {
  console.error('[UPLOAD] Missing required API configuration. Check your .env file.');
}

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

// Create a singleton queue instance
export const uploadPhotoQueue = new Queue<UploadJobData>(UPLOAD_QUEUE, REDIS_URL, queueOptions);

// Store API config on the queue client for access in the processor
(uploadPhotoQueue.client as any).apiConfig = apiConfig;

/**
 * Creates and configures a Bull queue for photo uploads
 * @returns Configured Bull queue
 */
export function createUploadQueue(): Queue.Queue<UploadJobData> {
  return uploadPhotoQueue;
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

  const queuePayload = {
    filepath,
    filename,
    trxId
  };
  
  const job = await queue.add(queuePayload);
  
  console.log(`[UPLOAD] [QUEUED] Picture ${filename} added to upload queue (Job ID: ${job.id})`);
  return job;
} 