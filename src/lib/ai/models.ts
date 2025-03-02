// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'gpt-4o-mini',
    label: 'GPT 4o mini',
    apiIdentifier: 'gpt-4o-mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'gpt-4o',
    label: 'GPT 4o',
    apiIdentifier: 'gpt-4o',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'deepseek-chat',
    label: 'DeepSeek',
    apiIdentifier: 'deepseek-chat',
    description: 'For complex, multi-step tasks',
  },
  {
    id: 'llama-3.3-70B-instruct',
    label: 'Llama 3.3 ( Powered By Atoma Network )',
    apiIdentifier: 'llama-3.3-70B-instruct',
    description: 'For simple tasks',
  }
] as const;

export const DEFAULT_MODEL_NAME: string = 'llama-3.3-70B-instruct';