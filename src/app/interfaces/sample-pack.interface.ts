import { Producer } from './track.interface';

export interface AudioSample {
  id: string;
  name: string;
  fileUrl: string;
  previewUrl?: string;
  sizeBytes: number;
  durationSeconds: number;
  format: string;
  createdAt: string;
  updatedAt: string;
}

export interface SamplePack {
  id: string;
  title: string;
  description: string;
  price: number;
  producer: Producer;
  zipFileUrl: string;
  samples: AudioSample[];
  totalSizeBytes: number;
  sampleCount: number;
  published: boolean;
  previewEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SamplePackResponse {
  respType: string;
  status: {
    statusCode: number;
    statusMessage: string;
    statusMessageKey: string;
  };
  data: SamplePack;
}

export interface PublishedSamplePackResponse {
  respType: string;
  status: {
    statusCode: number;
    statusMessage: string;
    statusMessageKey: string;
  };
  data: SamplePack[];
}

/**
 * Interface for sample pack upload request
 * Matches the API requirements for /v1/sample-packs POST endpoint
 */
export interface SamplePackUploadRequest {
  /** ZIP file containing audio samples */
  file: File;
  
  /** Title of the sample pack */
  title: string;
  
  /** Description of the sample pack */
  description: string;
  
  /** Price of the sample pack */
  price: number;
  
  /** Whether to generate preview versions of samples (default: true) */
  enablePreviews: boolean;
}
