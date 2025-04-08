import { exec, spawn, ChildProcess } from 'child_process';
import path from 'path';
import { WebSocket } from 'ws';
import fs from 'fs';
import { promisify } from 'util';

// Define types
export interface Camera {
  model: string;
  port: string;
}

export interface CaptureOptions {
  cameraPort?: string;
  filename?: string;
  directory?: string;
}

// Convert exec to promise-based
const execAsync = promisify(exec);

/**
 * Kills MacOS PTP services that might interfere with camera access
 * @returns Promise that resolves when the services are killed
 */
export async function killPTPServices(): Promise<void> {
  try {
    // Kill PTP processes (MacOS specific)
    await execAsync('pkill PTPCamera; pkill VDCAssistant');
  } catch (error) {
    // We don't care about errors here as processes might not exist
    console.debug('PTP services not running or already killed');
  }
}

/**
 * Sets up camera access by killing interfering processes and setting permissions
 * @returns Promise that resolves to true if setup was successful
 */
export async function setupCamera(): Promise<boolean> {
  try {
    // Kill PTP services first
    await killPTPServices();

    // Wait a moment for processes to be killed
    await new Promise<void>((resolve) => setTimeout(() => resolve(), 1000));

    // Set USB permissions (for Linux/Unix systems)
    try {
      await execAsync('sudo chmod 777 /dev/usb/*, /dev/bus/usb/*/*');
      //allow photo to write into folder by default without ask permission
      await execAsync('sudo chmod 777 uploads');
    } catch (error) {
      // Ignore errors as paths might not exist on all systems
      console.debug('USB permission setting skipped - paths may not exist on this system');
    }

    return true;
  } catch (error) {
    console.error('Error setting up camera:', error);
    return false;
  }
}

/**
 * Captures a photo using gphoto2
 * @param options Capture options including camera port, filename, and directory
 * @returns Promise that resolves to the filepath of the captured image
 */
export async function capturePhoto(options: string | CaptureOptions = {}, trxId: string): Promise<string> {
  try {
    // Handle legacy string parameter (cameraPort)
    const opts: CaptureOptions = typeof options === 'string' 
      ? { cameraPort: options } 
      : options;
    
    const { cameraPort = '', filename, directory } = opts;

    const setupSuccess = await setupCamera();
    if (!setupSuccess) {
      throw new Error('Failed to set up camera');
    }

    // Enable viewfinder
    await execAsync('gphoto2 --set-config viewfinder=1');

    // Ensure uploads directory exists with proper permissions
    const uploadsDir = directory || path.join(__dirname, 'uploads', trxId);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      // Set directory permissions to 777 (read, write, execute for all)
      fs.chmodSync(uploadsDir, 0o777);
    }

    const photoFilename = filename || `photo-${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, photoFilename);
    
    const cameraCommand = cameraPort
      ? `gphoto2 --port "${cameraPort}" --capture-image-and-download --filename ${filepath}`
      : `gphoto2 --capture-image-and-download --filename ${filepath}`;

    const { stderr } = await execAsync(cameraCommand);
    
    if (stderr?.includes('ERROR')) {
      throw new Error(`gphoto2 error: ${stderr}`);
    }
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Photo capture failed: File not created');
    }
    
    // Set file permissions to 666 (read, write for all)
    fs.chmodSync(filepath, 0o666);
    
    return filepath;
  } catch (error) {
    console.error('Error capturing photo:', error);
    throw new Error(`Failed to capture photo: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Lists all connected cameras
 * @returns Promise that resolves to an array of camera objects
 */
export async function listCameras(): Promise<Camera[]> {
  try {
    const setupSuccess = await setupCamera();
    if (!setupSuccess) {
      throw new Error('Failed to set up camera');
    }
    const { stdout, stderr } = await execAsync('gphoto2 --auto-detect');
    
    if (stderr?.includes('ERROR')) {
      throw new Error(`gphoto2 error: ${stderr}`);
    }
    
    const cameras = stdout
      .split('\n')
      .filter((line) => line.includes('usb:'))
      .map((line) => {
        const [model, port] = line.trim().split('usb:');
        return {
          model: model.trim(),
          port: `usb:${port.trim()}`,
        };
      });

    return cameras;
  } catch (error) {
    console.error('Error listing cameras:', error);
    throw new Error(`Failed to list cameras: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export const listPictures = async (): Promise<{ filename: string, path: string }[]> => {
  try {
    const uploadsDir = path.join(process.cwd(), "uploads");
    
    // Create directory if it doesn't exist and set proper permissions
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      // Set directory permissions to 777 (read, write, execute for all)
      fs.chmodSync(uploadsDir, 0o777);
    }
    
    const files = await fs.promises.readdir(uploadsDir);
    
    const photos = files
      .filter((file) => /\.(jpg|jpeg|png)$/i.test(file))
      .map((filename) => ({
        filename,
        path: `/uploads/${filename}`,
      }));

    return photos;
  } catch (err) {
    console.error("Error reading uploads directory:", err);
    throw new Error(`Failed to read photos, ${err instanceof Error ? err.message : String(err)}`);
  }
};

/**
 * Checks if gphoto2 is installed on the system
 * @returns Promise that resolves to true if gphoto2 is installed
 */
export async function checkGphoto2Installation(): Promise<boolean> {
  try {
    await execAsync('which gphoto2');
    return true;
  } catch (error) {
    console.error('gphoto2 is not installed on this system');
    return false;
  }
}