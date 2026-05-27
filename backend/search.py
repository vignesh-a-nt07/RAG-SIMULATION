from vector_store import db

query = "vector databases for legal documents"

results = db.similarity_search(query, k=3)

print("\nTOP RESULTS:\n")

for i, result in enumerate(results):

    print(f"\nRESULT {i+1}\n")

    print(result.page_content[:500])

    print("\n" + "="*80)