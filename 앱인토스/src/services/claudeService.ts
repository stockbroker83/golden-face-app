import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
});

export async function callClaude(message: string): Promise<string> {
  try {
    const response = await client.messages.create({
      model: "claude-opus-4.6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    const textContent = response.content.find((block) => block.type === "text");
    if (textContent && textContent.type === "text") {
      return textContent.text;
    }
    return "No response";
  } catch (error) {
    console.error("Claude API Error:", error);
    throw error;
  }
}
