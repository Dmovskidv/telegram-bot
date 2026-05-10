import Groq from 'groq-sdk';

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const generate = async (messages) => {
  const res = await client.chat.completions.create({
    messages,
    model: 'openai/gpt-oss-20b',
  });

  return res.choices?.[0]?.message?.content || '';
};

export default { generate };
