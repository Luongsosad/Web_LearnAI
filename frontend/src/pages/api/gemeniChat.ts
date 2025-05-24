import type { NextApiRequest, NextApiResponse } from 'next'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { prompt } = req.body

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Bạn là trợ lý thông minh, trả lời ngắn gọn, chính xác, bằng tiếng Việt hoàn toàn.
Không dùng định dạng markdown, chỉ trả về văn bản thuần.
Phần trả lời phải rõ ràng, có xuống dòng hợp lý để dễ đọc.
Nếu có danh sách, hãy đánh số và xuống dòng từng mục.
Không được để tiếng Anh xen lẫn nếu câu hỏi yêu cầu tiếng Việt.
Câu hỏi: ${prompt}. Vietnamese!`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
      },
    })

    const script = result.response.text()
    res.status(200).json({ script })
  } catch (error) {
    console.error('Lỗi khi gọi Gemini:', error)
    res.status(500).json({ script: 'Lỗi khi tạo kịch bản.' })
  }
}
