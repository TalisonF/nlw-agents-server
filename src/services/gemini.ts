import { GoogleGenAI } from '@google/genai';
import { env } from '../env.ts';

const gemeni = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
});

const model = 'gemini-2.5-flash';

export async function transcribeAudio(audioAsBase64: string, mimeType: string) {
  const response = await gemeni.models.generateContent({
    model,
    contents: [
      {
        text: 'Transcreva o audio para português do Brasil. Seja preciso e natural na transcrição. Mantenha a pontuação adequada e divida o texto em parágrafos quando for apropriado.',
      },
      {
        inlineData: {
          mimeType,
          data: audioAsBase64,
        },
      },
    ],
  });
  if (!response.text) {
    throw new Error('Não foi possível transcrever o audio!');
  }
  return response.text;
}

export async function generateEmbeddings(text: string) {
  const response = await gemeni.models.embedContent({
    model: 'text-embedding-004',
    contents: [{ text }],
    config: {
      taskType: 'RETRIEVAL_DOCUMENT',
    },
  });

  if (!response.embeddings?.[0].values) {
    throw new Error('Não foi possível gerar os embeddings');
  }

  return response.embeddings[0].values;
}

export async function generateAnswer(question: string, textsContext: string[]) {
  const context = textsContext.join('\n\n');

  const prompt = `
    Com base no texto fornecido abaixo como contexto, responda a pergunta de forma clara e precisa em português do Brasil.
  
    CONTEXTO:
    ${context}

    PERGUNTA:
    ${question}

    INSTRUÇÕES:
    - Use apenas informações contidas no contexto enviado;
    - Se a resposta não for encontrada no contexto, apenas responda que não possui informações suficientes para responder;
    - Seja objetivo;
    - Mantenha um tom educativo e profissional;
    - Cite trechos relevantes do contexto se necessário;
    - Se for citar o contexto, utilize o termo "no seguinte trecho";
  `.trim();

  const response = await gemeni.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  });

  if (!response.text) {
    throw new Error('Não foi possível transcrever o audio!');
  }
  return response.text;
}

export async function generateQuickResume(textsContext: string[]) {
  const context = textsContext.join('\n\n');

  const prompt = `
    Por favor, resuma o seguinte textos: 

    ${context}

    INSTRUÇÕES:
    - O resumo será para uma sala de bate papo
    - Use apenas informações contidas no contexto enviado;
    - O resumo deve ser conciso e ter no máximo 3-4 frases principais.
    - Seja objetivo;
    - Mantenha um tom educativo e profissional;
  `.trim();

  const response = await gemeni.models.generateContent({
    model,
    contents: [
      {
        text: prompt,
      },
    ],
  });
  return response.text;
}
