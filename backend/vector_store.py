from langchain_chroma import Chroma
from langchain_core.documents import Document
from sentence_transformers import SentenceTransformer

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)

class LocalEmbeddingFunction:
    def embed_documents(self, texts):
        return [embedding_model.encode(text).tolist() for text in texts]

    def embed_query(self, text):
        return embedding_model.encode(text).tolist()

embedding_function = LocalEmbeddingFunction()

db = Chroma(
    collection_name="legal_rag",
    persist_directory="./chroma_db",
    embedding_function=embedding_function
)