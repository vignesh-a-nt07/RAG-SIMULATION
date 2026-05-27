from vector_store import db
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="tinyllama"
)

query = input("Ask Question: ")

results = db.similarity_search(query, k=3)

context = "\n\n".join(
    [doc.page_content for doc in results]
)

prompt = f"""
Answer ONLY using the provided context.

Context:
{context}

Question:
{query}
"""

response = llm.invoke(prompt)

print("\nAI ANSWER:\n")

print(response.content)