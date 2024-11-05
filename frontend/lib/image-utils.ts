// Function to convert image to grayscale using Canvas
export async function convertToGrayscale(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
  
        canvas.width = img.width;
        canvas.height = img.height;
  
        // Draw image and get pixel data
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
  
        // Convert to grayscale
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = avg;     // red
          data[i + 1] = avg; // green
          data[i + 2] = avg; // blue
        }
  
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
  
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }
  
  // Cache for compressed images
  export const compressionCache = new Map<string, Map<number, string>>();
  
  // Function to get cached image or compress
  export async function getCachedOrCompressImage(
    imageId: string, 
    values: number, 
    compressFunction: (values: number) => Promise<string>
  ): Promise<string> {
    // Get or create cache for this image
    let imageCache = compressionCache.get(imageId);
    if (!imageCache) {
      imageCache = new Map<number, string>();
      compressionCache.set(imageId, imageCache);
    }
  
    // Check if we have this compression level cached
    const cached = imageCache.get(values);
    if (cached) {
      return cached;
    }
  
    // If not cached, compress and cache
    const compressed = await compressFunction(values);
    imageCache.set(values, compressed);
    return compressed;
  }