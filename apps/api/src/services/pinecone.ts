import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

function getClient(): Pinecone {
  if (!pineconeClient) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  }
  return pineconeClient;
}

function getIndex() {
  return getClient().index(process.env.PINECONE_INDEX ?? 'ragol');
}

export interface ChunkMetadata {
  documentId: number;
  documentSetId: number;
  chunkIndex: number;
  text: string;
}

export async function upsertVectors(
  userId: number,
  vectors: { id: string; values: number[]; metadata: ChunkMetadata }[]
): Promise<void> {
  const ns = getIndex().namespace(`user-${userId}`);
  const BATCH = 100;
  for (let i = 0; i < vectors.length; i += BATCH) {
    await ns.upsert(vectors.slice(i, i + BATCH) as unknown as PineconeRecord<RecordMetadata>[]);
  }
}

export async function queryVectors(
  userId: number,
  queryVector: number[],
  documentSetId: number,
  topK = 5
): Promise<{ text: string; score: number }[]> {
  const ns = getIndex().namespace(`user-${userId}`);
  const result = await ns.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter: { documentSetId: { $eq: documentSetId } },
  });

  return (result.matches ?? []).map((m) => ({
    text: (m.metadata as unknown as ChunkMetadata).text,
    score: m.score ?? 0,
  }));
}

export async function deleteDocumentVectors(userId: number, documentId: number): Promise<void> {
  const ns = getIndex().namespace(`user-${userId}`);
  await ns.deleteMany({ documentId: { $eq: documentId } });
}
