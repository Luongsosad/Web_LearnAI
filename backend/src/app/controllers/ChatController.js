import { generateScript } from '../../services/GroqChat.js';
import { synthesizeGradioSpeech } from '../../services/TTS.js';

export const synthesizeChat = async (req, res) => {
  const { prompt, history } = req.body;

  // Kiểm tra prompt
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Thiếu hoặc không hợp lệ tiêu đề (prompt).' });
  }

  // Kiểm tra history
  if (history && !Array.isArray(history)) {
    return res.status(400).json({ error: 'Lịch sử tin nhắn không hợp lệ.' });
  }

  try {
    const result = await generateScript(prompt, history, 'chat');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo kịch bản.' });
  }
};

export const synthesizeCommunicate = async (req, res) => {
  const { prompt, history } = req.body;

  // Kiểm tra prompt    
  if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
    return res.status(400).json({ error: 'Thiếu hoặc không hợp lệ tiêu đề (prompt).' });
  }
  // Kiểm tra history
  if (history && !Array.isArray(history)) {
    return res.status(400).json({ error: 'Lịch sử tin nhắn không hợp lệ.' });
  }
  try {
    const result = await generateScript(prompt, history, 'communicate');
    const Audio = await synthesizeGradioSpeech(result.script);
    return res.status(200).json({ script: result.script, audioUrl: Audio });
  }
  catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo kịch bản.' });
  }
}
