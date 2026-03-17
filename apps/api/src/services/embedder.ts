import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

let embedder: FeatureExtractionPipeline | null = null;

export async function getEmbedder(): Promise<FeatureExtractionPipeline> {
  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedder;
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  const pipe = await getEmbedder();
  const BATCH = 32;
  const allVectors: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const output = await pipe(batch, { pooling: 'mean', normalize: true });
    const data: number[][] = Array.from({ length: batch.length }, (_, idx) =>
      Array.from(output.data.slice(idx * 384, (idx + 1) * 384) as Float32Array)
    );
    allVectors.push(...data);
  }

  return allVectors;
}
