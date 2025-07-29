export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  resource_type: 'image' | 'video' | 'raw';
  format: string;
  version: number;
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  created_at: string;
  original_filename: string;
  [key: string]: any; // Keep for optional future-proofing
}
