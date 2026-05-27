from vector_store import db

data = db.get()

print("\nTOTAL CHUNKS:", len(data["documents"]))

for i, doc in enumerate(data["documents"][:5]):

    print(f"\nCHUNK {i+1}:\n")

    print(doc[:500])

    print("\n" + "="*80)