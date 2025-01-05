import { streamText } from 'ai';
import { groq } from '@ai-sdk/groq';

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
    system: 'You are an assistant that is used to generate coherant responses from data gievn to you from rag. Use only the data sources provided to you to generate your response. Do not be overly verbal or descriptive, and structure your response concisely',
    prompt,
  });
  return result.toDataStreamResponse();
}