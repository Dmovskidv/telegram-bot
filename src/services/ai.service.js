import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function askAI(messages) {
  const response = await groq.chat.completions.create({
    messages,
    model: "openai/gpt-oss-20b",
  });
  return response.choices?.[0].message?.content || '';
}

export default askAI;