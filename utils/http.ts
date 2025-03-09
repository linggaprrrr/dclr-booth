import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource } from 'axios';
import { FormData } from 'formdata-node';

/**
 * HTTP request methods supported by the client
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

/**
 * Configuration options for the HTTP client
 */
export interface HttpClientConfig {
  baseURL: string;
  apiKey?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * Request options for HTTP requests
 */
export interface RequestOptions<T = any> {
  params?: Record<string, any>;
  data?: T;
  headers?: Record<string, string>;
  timeout?: number;
  cancelToken?: CancelTokenSource;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  fieldName: string;
  fileName: string;
  file: File | Blob;
  additionalData?: Record<string, any>;
  onProgress?: (progress: number) => void;
}

/**
 * HTTP client for making API requests
 * @class HttpClient
 */
export class HttpClient {
  private readonly client: AxiosInstance;
  private readonly apiKey?: string;

  /**
   * Creates an instance of HttpClient.
   * @param {HttpClientConfig} config - The configuration for the HTTP client
   */
  constructor(config: HttpClientConfig) {
    const { baseURL, apiKey, timeout = 30000, headers = {} } = config;

    this.apiKey = apiKey;

    this.client = axios.create({
      baseURL,
      timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers,
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   * @private
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add API key if provided
        if (this.apiKey && config.headers) {
          config.headers['x-api-key'] = this.apiKey;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle errors globally
        if (error.response) {
          // Server responded with a status code outside of 2xx range
          console.error('Response error:', error.response.status, error.response.data);
        } else if (error.request) {
          // Request was made but no response received
          console.error('Request error:', error.request);
        } else {
          // Something happened in setting up the request
          console.error('Error:', error.message);
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create a cancel token source
   * @returns {CancelTokenSource} A cancel token source
   */
  public createCancelToken(): CancelTokenSource {
    return axios.CancelToken.source();
  }

  /**
   * Make an HTTP request
   * @template T - The type of the response data
   * @template D - The type of the request data
   * @param {HttpMethod} method - The HTTP method
   * @param {string} url - The URL to request
   * @param {RequestOptions<D>} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async request<T = any, D = any>(
    method: HttpMethod,
    url: string,
    options: RequestOptions<D> = {}
  ): Promise<T> {
    const { params, data, headers, timeout, cancelToken, responseType } = options;

    const config: AxiosRequestConfig = {
      method,
      url,
      params,
      data,
      headers,
      timeout,
      responseType,
    };

    if (cancelToken) {
      config.cancelToken = cancelToken.token;
    }

    try {
      const response: AxiosResponse<T> = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Make a GET request
   * @template T - The type of the response data
   * @param {string} url - The URL to request
   * @param {RequestOptions} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(HttpMethod.GET, url, options);
  }

  /**
   * Make a POST request
   * @template T - The type of the response data
   * @template D - The type of the request data
   * @param {string} url - The URL to request
   * @param {D} [data] - The request data
   * @param {RequestOptions} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async post<T = any, D = any>(
    url: string,
    data?: D,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T, D>(HttpMethod.POST, url, { ...options, data });
  }

  /**
   * Make a PUT request
   * @template T - The type of the response data
   * @template D - The type of the request data
   * @param {string} url - The URL to request
   * @param {D} [data] - The request data
   * @param {RequestOptions} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async put<T = any, D = any>(
    url: string,
    data?: D,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T, D>(HttpMethod.PUT, url, { ...options, data });
  }

  /**
   * Make a PATCH request
   * @template T - The type of the response data
   * @template D - The type of the request data
   * @param {string} url - The URL to request
   * @param {D} [data] - The request data
   * @param {RequestOptions} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async patch<T = any, D = any>(
    url: string,
    data?: D,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T, D>(HttpMethod.PATCH, url, { ...options, data });
  }

  /**
   * Make a DELETE request
   * @template T - The type of the response data
   * @param {string} url - The URL to request
   * @param {RequestOptions} [options] - The request options
   * @returns {Promise<T>} The response data
   */
  public async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, url, options);
  }

  /**
   * Upload a file
   * @template T - The type of the response data
   * @param {string} url - The URL to upload to
   * @param {FileUploadOptions} options - The file upload options
   * @param {RequestOptions} [requestOptions] - Additional request options
   * @returns {Promise<T>} The response data
   */
  public async uploadFile<T = any>(
    url: string,
    options: FileUploadOptions,
    requestOptions: RequestOptions = {}
  ): Promise<T> {
    const { fieldName, fileName, file, additionalData = {}, onProgress } = options;
    
    // Create FormData
    const formData = new FormData();
    formData.append(fieldName, file, fileName);
    
    // Add additional data if provided
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Create cancel token if not provided
    const cancelToken = requestOptions.cancelToken || this.createCancelToken();
    
    // Configure request
    const config: AxiosRequestConfig = {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...requestOptions.headers,
      },
      cancelToken: cancelToken.token,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );
            onProgress(percentCompleted);
          }
        : undefined,
    };

    try {
      const response: AxiosResponse<T> = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Upload multiple files
   * @template T - The type of the response data
   * @param {string} url - The URL to upload to
   * @param {Array<{ fieldName: string; fileName: string; file: File | Blob }>} files - The files to upload
   * @param {Record<string, any>} [additionalData] - Additional data to include in the form
   * @param {(progress: number) => void} [onProgress] - Progress callback
   * @param {RequestOptions} [requestOptions] - Additional request options
   * @returns {Promise<T>} The response data
   */
  public async uploadMultipleFiles<T = any>(
    url: string,
    files: Array<{ fieldName: string; fileName: string; file: File | Blob }>,
    additionalData: Record<string, any> = {},
    onProgress?: (progress: number) => void,
    requestOptions: RequestOptions = {}
  ): Promise<T> {
    // Create FormData
    const formData = new FormData();
    
    // Add files
    files.forEach(({ fieldName, fileName, file }) => {
      formData.append(fieldName, file, fileName);
    });
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Create cancel token if not provided
    const cancelToken = requestOptions.cancelToken || this.createCancelToken();
    
    // Configure request
    const config: AxiosRequestConfig = {
      method: 'POST',
      url,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...requestOptions.headers,
      },
      cancelToken: cancelToken.token,
      onUploadProgress: onProgress
        ? (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            onProgress(percentCompleted);
          }
        : undefined,
    };

    try {
      const response: AxiosResponse<T> = await this.client.request<T>(config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

/**
 * Create an HTTP client instance
 * @param {HttpClientConfig} config - The configuration for the HTTP client
 * @returns {HttpClient} An HTTP client instance
 */
export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  return new HttpClient(config);
};

// Usage example:
/*
const apiClient = createHttpClient({
  baseURL: 'https://api.example.com',
  apiKey: 'your-api-key',
});

// GET request
const getData = async () => {
  try {
    const response = await apiClient.get<{ data: string[] }>('/data');
    console.log(response);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// POST request with data
const createItem = async () => {
  try {
    const response = await apiClient.post<{ id: string }, { name: string }>('/items', {
      name: 'New Item',
    });
    console.log(response);
  } catch (error) {
    console.error('Error creating item:', error);
  }
};

// File upload with progress
const uploadFile = async (file: File) => {
  try {
    const response = await apiClient.uploadFile<{ fileUrl: string }>(
      '/upload',
      {
        fieldName: 'file',
        fileName: file.name,
        file,
        additionalData: { description: 'My file' },
        onProgress: (progress) => console.log(`Upload progress: ${progress}%`),
      }
    );
    console.log('File uploaded:', response.fileUrl);
  } catch (error) {
    console.error('Error uploading file:', error);
  }
};
*/
