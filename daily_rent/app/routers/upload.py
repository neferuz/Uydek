from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
import shutil
import uuid
import os

router = APIRouter()

UPLOAD_DIR = "app/static/uploads"

@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/static/uploads/{filename}"
    return JSONResponse(content={"url": url})
