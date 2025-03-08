# Camera Service

This service provides functionality to interact with cameras using the gphoto2 command-line tool.

## Prerequisites

- gphoto2 must be installed on your system
- For MacOS users, the service will automatically kill PTP services that might interfere with camera access
- For Linux/Unix users, the service will attempt to set appropriate USB permissions

## Installation

Make sure gphoto2 is installed on your system:

### MacOS
```bash
brew install gphoto2
```

### Linux
```bash
sudo apt-get install gphoto2
```

## API

### `listCameras(): Promise<Camera[]>`

Lists all connected cameras.

```typescript
import { listCameras } from './services/camera';

const cameras = await listCameras();
console.log(cameras);
// [{ model: 'Canon EOS 5D Mark IV', port: 'usb:001,004' }]
```

### `capturePhoto(options?: CaptureOptions | string): Promise<string>`

Captures a photo using the connected camera.

```typescript
import { capturePhoto } from './services/camera';

// Basic usage
const filepath = await capturePhoto();

// With options
const filepath = await capturePhoto({
  cameraPort: 'usb:001,004',
  filename: 'my-photo.jpg',
  directory: '/path/to/save'
});
```

### `startLivePreview(ws: WebSocket, cameraPort?: string): Promise<ChildProcess>`

Starts a live preview stream from the camera and sends frames to a WebSocket.

```typescript
import { startLivePreview } from './services/camera';
import { WebSocket } from 'ws';

// In a WebSocket server handler
wss.on('connection', (ws) => {
  startLivePreview(ws)
    .then((process) => {
      // Store process reference if needed
    })
    .catch((error) => {
      console.error('Failed to start preview:', error);
    });
});
```

### `setupCamera(): Promise<boolean>`

Sets up camera access by killing interfering processes and setting permissions.

### `checkGphoto2Installation(): Promise<boolean>`

Checks if gphoto2 is installed on the system.

## Error Handling

All functions include proper error handling and will throw descriptive errors when operations fail.

## Types

```typescript
interface Camera {
  model: string;
  port: string;
}

interface CaptureOptions {
  cameraPort?: string;
  filename?: string;
  directory?: string;
}
``` 