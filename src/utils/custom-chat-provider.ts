import { createOpenAICompatible } from '@ai-sdk/openai-compatible';

export const atomaNetworkModelProvider = createOpenAICompatible({
    name: 'atoma-network',
    baseURL: 'https://api.atoma.network/v1',
    apiKey: process.env.ATOMA_NETWORK_API_KEY,
});