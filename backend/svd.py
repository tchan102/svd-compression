import numpy as np
from PIL import Image
import io
from scipy import linalg

def ensure_grayscale(img: Image.Image) -> Image.Image:
    """
    Ensure image is in grayscale mode.
    """
    if img.mode != 'L':
        return img.convert('L')
    return img

def compress_image(image_data: bytes, k: int) -> bytes:
    """
    Compress a grayscale image using SVD (Singular Value Decomposition).
    """
    # Load image from bytes
    img = Image.open(io.BytesIO(image_data))
    
    # Ensure grayscale
    img = ensure_grayscale(img)
    
    # Convert to numpy array
    img_array = np.array(img)
    
    # Compute SVD
    U, s, Vt = linalg.svd(img_array, full_matrices=False)
    
    # Keep only k singular values
    k = min(k, len(s))
    compressed = U[:, :k] @ np.diag(s[:k]) @ Vt[:k, :]
    
    # Ensure values are in valid range
    compressed = np.clip(compressed, 0, 255)
    compressed = compressed.astype(np.uint8)
    
    # Convert back to image
    compressed_img = Image.fromarray(compressed, mode='L')
    
    # Save to bytes
    output = io.BytesIO()
    compressed_img.save(output, format='PNG')
    return output.getvalue()