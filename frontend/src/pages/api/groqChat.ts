import { Groq } from 'groq-sdk';
import type { NextApiRequest, NextApiResponse } from 'next';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

type Message =
  | { role: 'system'; content: string }
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string }
  | { role: 'function'; name: string; content: string };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { prompt } = req.body;

  try {
    const messages: Message[] = [
      {
        role: 'system',
        content: `
Bạn là trợ lý thông minh, trả lời ngắn gọn, chính xác, bằng tiếng Việt hoàn toàn. 
Không dùng định dạng markdown, chỉ trả về văn bản thuần. 
Phần trả lời phải rõ ràng, có xuống dòng hợp lý để dễ đọc.
Nếu có danh sách, hãy đánh số và xuống dòng từng mục.
Không được để tiếng Anh xen lẫn nếu câu hỏi yêu cầu tiếng Việt.
`,
      },
      {
        role: 'user',
        content: `${prompt}. Vietnamese!`,  // trực tiếp câu hỏi người dùng gửi lên
      },
    ];

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages,
      temperature: 0.7,
    });

    const script = completion.choices[0]?.message?.content || 'Không tạo được kịch bản.';
    res.status(200).json({ script });
  } catch (error) {
    console.error('Lỗi khi gọi Groq:', error);
    res.status(500).json({ script: 'Lỗi khi tạo kịch bản.' });
  }
}
