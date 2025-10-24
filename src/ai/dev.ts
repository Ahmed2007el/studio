import { config } from 'dotenv';
config();

import '@/ai/flows/generate-preliminary-designs.ts';
import '@/ai/flows/explain-engineering-concepts.ts';
import '@/ai/flows/project-type-and-code-suggestion.ts';
import '@/ai/flows/simulate-structural-analysis.ts';
import '@/ai/flows/engineering-assistant.ts';
