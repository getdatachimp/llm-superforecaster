import Anthropic from '@anthropic-ai/sdk'

import APIConcurrencyQueue from './apiConcurrencyQueue'

const anthropicPool = new APIConcurrencyQueue({
  maxConnections: 1,
  buffer: 4_000,
})

const anthropic = new Anthropic({
  apiKey: process.env['ANTHROPIC_API_KEY']
})

// https://docs.anthropic.com/claude/docs/models-overview#model-comparison
const CLAUDE_OPUS_MODEL_NAME = 'claude-3-opus-20240229'
const CLAUDE_HAIKU_MODEL_NAME = 'claude-3-haiku-20240307'

export const promptClaudeOpus = async (
  prompt: string,
): Promise<string> => {
  return promptClaude({ prompt, model: CLAUDE_OPUS_MODEL_NAME })
}

export const promptClaudeHaiku = async (
  prompt: string,
): Promise<string> => {
  return promptClaude({ prompt, model: CLAUDE_HAIKU_MODEL_NAME })
}

const promptClaude = async ({
  prompt,
  model,
}: {
  prompt: string,
  model: string
}): Promise<string> => {
  const chatRequest = async () => {
    // https://docs.anthropic.com/claude/reference/messages_post
    const message = await anthropic.messages.create({
      model,
      max_tokens: 4096, // Max output tokens.
      messages: [
        { role: "user", content: prompt }
      ]
    })
    return message.content[0].text
  }

  return anthropicPool.queueWithRetries({
    task: chatRequest,
    name: `prompt Anthropic model ${model}`,
  })
}
