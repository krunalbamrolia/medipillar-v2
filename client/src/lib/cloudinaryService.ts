/**
 * Cloudinary Upload Service
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const API_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  resourceType?: "image" | "video" | "auto";
  maxRetries?: number;
}

export interface UploadResult {
  url: string;
  publicId: string;
  format: string;
  type: "image" | "video";
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function uploadToCloudinary(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { onProgress, resourceType = "auto", maxRetries = 3 } = options;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration is missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  
  // Basic optimization params for unsigned presets
  if (file.type.startsWith("image/")) {
    // If we want to force compression via upload preset, we'd configure that in Cloudinary dashboard.
    // We can also pass folder name here if allowed by the unsigned preset.
    formData.append("folder", "medipillar/campaigns");
  } else if (file.type.startsWith("video/")) {
    formData.append("folder", "medipillar/campaigns");
  }

  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      return await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable && onProgress) {
            const progress = Math.round((e.loaded / e.total) * 100);
            onProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              // Optimize image URLs on the fly if needed
              let finalUrl = response.secure_url;
              if (response.resource_type === "image") {
                // Insert q_auto,f_auto for images
                const parts = finalUrl.split("/upload/");
                if (parts.length === 2) {
                  finalUrl = `${parts[0]}/upload/q_auto,f_auto/${parts[1]}`;
                }
              }

              resolve({
                url: finalUrl,
                publicId: response.public_id,
                format: response.format,
                type: response.resource_type as "image" | "video",
              });
            } catch (err) {
              reject(new Error("Invalid response from Cloudinary"));
            }
          } else {
            let errorMessage = `Upload failed with status ${xhr.status}`;
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              if (errorResponse.error && errorResponse.error.message) {
                errorMessage = errorResponse.error.message;
              }
            } catch (e) {
              // Ignore parse error on error response
            }
            reject(new Error(errorMessage));
          }
        };

        xhr.onerror = () => reject(new Error("Network error occurred during upload"));
        xhr.onabort = () => reject(new Error("Upload aborted"));

        // Determine correct endpoint based on file type
        const uploadUrl = resourceType === "auto" 
          ? API_URL.replace("/upload", `/${file.type.startsWith("video/") ? "video" : "image"}/upload`)
          : API_URL.replace("/upload", `/${resourceType}/upload`);

        xhr.open("POST", uploadUrl);
        xhr.send(formData);
      });
    } catch (error) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      // Exponential backoff
      await sleep(1000 * Math.pow(2, attempt - 1));
    }
  }

  throw new Error("Upload failed after max retries");
}
