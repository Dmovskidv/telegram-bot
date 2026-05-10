import Groq from 'groq-sdk';
import fs from 'fs';

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

const transcribe = async (audioFilePath) => {
  const res = await client.audio.transcriptions.create({
    file: fs.createReadStream(audioFilePath),
    model: 'whisper-large-v3-turbo',
  });

  return res.text || '';
};

export default { generate, transcribe };
