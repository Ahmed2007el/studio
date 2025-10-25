'use server';
/**
 * @fileOverview Converts text to speech using Google's TTS model.
 *
 * - textToSpeech - A function that handles the text-to-speech conversion.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const TextToSpeechInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
});
type TextToSpeechInput = z.infer<typeof TextToSpeechInputSchema>;

const TextToSpeechOutputSchema = z.object({
  audio: z
    .string()
    .describe(
      "A data URI representing the audio. Expected format: 'data:audio/wav;base64,<encoded_data>'."
    ),
});
type TextToSpeechOutput = z.infer<typeof TextToSpeechOutputSchema>;

export async function textToSpeech(
  input: TextToSpeechInput
): Promise<TextToSpeechOutput> {
  return textToSpeechFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const textToSpeechFlow = ai.defineFlow(
  {
    name: 'textToSpeechFlow',
    inputSchema: TextToSpeechInputSchema,
    outputSchema: TextToSpeechOutputSchema,
  },
  async ({ text }) => {
    try {
      const { media } = await ai.generate({
          model: googleAI.model('gemini-2.5-flash-preview-tts'),
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Alloy' },
              },
            },
          },
          prompt: text,
      });
      
      if (!media?.url) {
        console.warn('TTS generation returned no media.');
        return { audio: '' };
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);
      
      // Note: The previous implementation returned { media: ... }, but the engineering assistant expects { audio: ... }
      return {
        audio: 'data:audio/wav;base64,' + wavBase64,
      };
    } catch (error) {
        console.error("Error in textToSpeechFlow, returning empty audio.", error);
        // If there's an error (e.g. quota exceeded), return empty audio to prevent crash
        return { audio: '' };
    }
  }
);
