import { config } from 'dotenv';
config();

import '@/ai/flows/generate-preliminary-designs.ts';
import '@/ai/flows/project-type-and-code-suggestion.ts';
import '@/ai/flows/simulate-structural-analysis.ts';
import '@/ai/flows/engineering-assistant.ts';
import '@/ai/flows/text-to-speech.ts';
