import { AzureOpenAI } from 'openai';
import { embedTexts } from './embedder';
import { queryVectors } from './pinecone';
import { getRecentMessages, insertMessage } from '../db/queries/chat';

let azureClient: AzureOpenAI | null = null;

function getAzureClient(): AzureOpenAI {
  if (!azureClient) {
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_MODEL;
    if (!deployment) throw new Error('Azure OpenAI deployment not configured (AZURE_OPENAI_DEPLOYMENT or AZURE_OPENAI_DEPLOYMENT_NAME or AZURE_OPENAI_MODEL)');

    azureClient = new AzureOpenAI({
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiKey: process.env.AZURE_OPENAI_KEY!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION!,
      deployment,
    });
  }
  return azureClient;
}

export async function runRAG(
  userId: number,
  documentSetId: number,
  chatSessionId: number,
  userMessage: string
): Promise<string> {
  // 1. Embed query
  const [queryVector] = await embedTexts([userMessage]);

  // 2. Retrieve top-5 chunks from Pinecone
  const chunks = await queryVectors(userId, queryVector, documentSetId, 5);

  // 3. Build context
  const context = chunks.map((c, i) => `[${i + 1}] ${c.text}`).join('\n\n');

  // 4. Fetch recent history (last 10 messages)
  const history = await getRecentMessages(chatSessionId, 10);

  // 5. Build messages array
  const systemPrompt = `You are a helpful assistant. Answer the user's question using the provided document context. If the answer is not in the context, say so honestly.

Context:
${context}`;

  type OAIMessage = { role: 'system' | 'user' | 'assistant'; content: string };
  const messages: OAIMessage[] = [{ role: 'system', content: systemPrompt }];

  for (const msg of history) {
    messages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
  }
  messages.push({ role: 'user', content: userMessage });

  // 6. Call Azure OpenAI
  const client = getAzureClient();
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT ?? process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_MODEL;
  const completion = await client.chat.completions.create({
    model: deployment!,
    messages,
    max_completion_tokens: 1024,
    temperature: 1.0,
  });

  const assistantContent = completion.choices[0]?.message?.content ?? '';

  // 7. Persist messages
  await insertMessage(chatSessionId, 'user', userMessage);
  await insertMessage(chatSessionId, 'assistant', assistantContent);

  return assistantContent;
}
