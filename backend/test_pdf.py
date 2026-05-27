from pdf_reader import extract_text
from chunker import chunk_text
from vector_store import db

text = extract_text("uploads/sample.pdf")

chunks = chunk_text(text)

print("TOTAL CHUNKS:", len(chunks))

db.add_texts(chunks)

print("\nChunks stored successfully in ChromaDB!")