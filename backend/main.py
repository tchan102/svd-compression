from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
import uuid
import os
from pathlib import Path
from functools import lru_cache
from svd import compress_image

app = FastAPI()
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB in bytes
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}

# Store uploaded images temporarily
UPLOAD_DIR = Path("temp_uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def validate_image(file: UploadFile) -> None:
    """Validate image file size and extension"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size
    file.file.seek(0, 2)  # Seek to end of file
    file_size = file.file.tell()  # Get current position (file size)
    file.file.seek(0)  # Reset file position
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"File size too large. Maximum size allowed is 5 MB"
        )

@app.post("/api/upload")
async def upload_image(image: UploadFile = File(...)):
    """Handle image upload and return an ID for later compression"""
    try:
        # Validate uploaded file
        validate_image(image)
        
        # Generate unique ID
        image_id = str(uuid.uuid4())
        
        # Save image
        image_path = UPLOAD_DIR / f"{image_id}.png"
        with open(image_path, "wb") as f:
            content = await image.read()
            f.write(content)
        
        print(f"Successfully saved image: {image_id}")  # Debug log
        return {"id": image_id}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error during upload: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/image/{image_id}")
async def get_original_image(image_id: str):
    """Return the original image"""
    try:
        image_path = UPLOAD_DIR / f"{image_id}.png"
        
        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
        
        with open(image_path, "rb") as f:
            content = f.read()
            print(f"Successfully read original image: {image_id}")  # Debug log
            return Response(content=content, media_type="image/png")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error getting original image: {str(e)}")  # Debug log
        raise HTTPException(status_code=500, detail=str(e))

@lru_cache(maxsize=1000)  # Cache last 1000 compressions
def get_cached_compression(image_id: str, values: int) -> bytes:
    image_path = UPLOAD_DIR / f"{image_id}.png"
    with open(image_path, "rb") as f:
        image_data = f.read()
    return compress_image(image_data, values)

@app.get("/api/compress/{image_id}")
async def compress(image_id: str, values: int):
    """Compress image using SVD with caching"""
    try:
        image_path = UPLOAD_DIR / f"{image_id}.png"
        
        if not image_path.exists():
            raise HTTPException(status_code=404, detail="Image not found")
        
        # Get compressed data from cache or compute
        compressed_data = get_cached_compression(image_id, values)
        return Response(content=compressed_data, media_type="image/png")
    except Exception as e:
        print(f"Error during compression: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)