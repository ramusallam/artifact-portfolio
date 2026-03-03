import { GoogleGenAI } from '@google/genai';

declare const process: { env: { GEMINI_API_KEY?: string } };

const getClient = (): GoogleGenAI => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('Gemini API key is missing. Add GEMINI_API_KEY to .env');
  return new GoogleGenAI({ apiKey: key });
};

async function retry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise((r) => setTimeout(r, delay));
    return retry(fn, retries - 1, delay * 2);
  }
}

export async function generateArtifactDescription(
  studentName: string,
  artifactTitle: string,
  url: string
): Promise<string> {
  return retry(async () => {
    const ai = getClient();
    const prompt = `You are an educational AI assistant. Given the following student artifact (a web resource), write exactly ONE sentence describing what this artifact showcases about the student's work. Start the sentence with "This artifact showcases ${studentName}'s"\n\nArtifact title: "${artifactTitle}"\nLink URL: ${url}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.3 },
    });
    return (
      response.text?.trim() ||
      `This artifact showcases ${studentName}'s work in "${artifactTitle}".`
    );
  });
}

export async function generateArtifactDescriptionFromPDF(
  studentName: string,
  artifactTitle: string,
  pdfFile: File
): Promise<string> {
  return retry(async () => {
    const ai = getClient();
    const buffer = await pdfFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: { mimeType: 'application/pdf', data: base64 },
            },
            {
              text: `You are an educational AI assistant. This is a student artifact (PDF document). Write exactly ONE sentence describing what this artifact showcases about the student's work. Start the sentence with "This artifact showcases ${studentName}'s"\n\nArtifact title: "${artifactTitle}"`,
            },
          ],
        },
      ],
      config: { temperature: 0.3 },
    });
    return (
      response.text?.trim() ||
      `This artifact showcases ${studentName}'s work in "${artifactTitle}".`
    );
  });
}
