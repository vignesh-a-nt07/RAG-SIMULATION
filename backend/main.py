from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, File
from pydantic import BaseModel

from vector_store import db
from langchain_ollama import ChatOllama

from pdf_reader import extract_text
from chunker import chunk_text

import shutil

# FastAPI app
app = FastAPI()

# Local LLM
llm = ChatOllama(
    model="tinyllama"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class ChatRequest(BaseModel):
    question: str

class DeleteRequest(BaseModel):
    filename: str

# Home Route
@app.get("/")
def home():
    return {
        "message": "Legal RAG API Running"
    }

# Upload PDF
@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text
    text = extract_text(file_path)

    # Chunk text
    chunks = chunk_text(text)

    # Store in vector DB
    db.add_texts(
        chunks,
        metadatas=[
            {"source": file.filename}
            for _ in chunks
        ]
    )

    return {
        "message": f"{file.filename} uploaded successfully",
        "chunks": len(chunks)
    }

# Delete PDF
@app.post("/delete")
def delete_pdf(req: DeleteRequest):

    data = db.get()

    ids_to_delete = []

    for i, meta in enumerate(data.get("metadatas", [])):

        if (
            meta
            and meta.get("source", "").lower().strip()
            ==
            req.filename.lower().strip()
        ):

            ids_to_delete.append(
                data["ids"][i]
            )

    if not ids_to_delete:

        return {
            "message": f"No entries found for '{req.filename}'",
            "deleted": 0
        }

    db.delete(ids=ids_to_delete)

    return {
        "message": f"{req.filename} deleted successfully",
        "deleted": len(ids_to_delete)
    }

# List Documents
@app.get("/documents")
def list_documents():
    data = db.get()
    names = []

    for meta in data.get("metadatas", []):
        name = meta.get("source") if meta else None
        if name and name not in names:
            names.append(name)

    return {"documents": names}

# Chat Endpoint
@app.post("/chat")
def chat(req: ChatRequest):

    # Semantic search
    results = db.similarity_search(
        req.question,
        k=3
    )

    # Context
    context = "\n\n".join(
        [doc.page_content for doc in results]
    )

    # Prompt
    prompt = f"""
    Answer ONLY using the provided context.

    Context:
    {context}

    Question:
    {req.question}
    """

    # LLM response
    response = llm.invoke(prompt)

    return {
        "question": req.question,
        "answer": response.content
    }