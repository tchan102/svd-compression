import numpy as np
from PIL import Image
import io

def ensure_grayscale(img: Image.Image) -> Image.Image:
    """
    Ensure image is in grayscale mode.
    """
    if img.mode != 'L':
        return img.convert('L')
    return img

def compute_svd_via_qr(A: np.ndarray, max_iterations: int = 1000, tol: float = 1e-6):
    """
    Compute the Singular Value Decomposition (SVD) using the QR algorithm.
    """
    # Initialize
    m, n = A.shape
    U = np.eye(m)  # Orthogonal matrix for left singular vectors
    Vt = np.eye(n) # Orthogonal matrix for right singular vectors
    A_k = A.copy()
    
    for i in range(max_iterations):
        # QR decomposition
        Q, R = np.linalg.qr(A_k)
        
        # Update U and Vt
        U = U @ Q
        A_k = R @ Vt.T
        Q, R = np.linalg.qr(A_k.T)
        Vt = Q.T @ Vt
        
        A_k = R.T
        # Check for convergence (small off-diagonal elements in A_k)
        off_diagonal = np.sqrt(np.sum((A_k - np.diag(np.diagonal(A_k)))**2))
        if off_diagonal < tol:
            break

    # The singular values are the diagonal entries of A_k
    singular_values = np.abs(np.diagonal(A_k))
    return U, singular_values, Vt

def compress_image(image_data: bytes, k: int) -> bytes:
    """
    Compress a grayscale image using SVD (Singular Value Decomposition) computed via QR algorithm.
    """
    # Load image from bytes
    img = Image.open(io.BytesIO(image_data))
    
    # Ensure grayscale
    img = ensure_grayscale(img)
    
    # Convert to numpy array
    img_array = np.array(img, dtype=float)
    
    # Compute SVD using the QR algorithm
    U, s, Vt = compute_svd_via_qr(img_array)
    
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
