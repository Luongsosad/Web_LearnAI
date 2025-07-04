import { generateScript } from '../../services/GroqChat.js';
import { synthesizeGradioSpeech } from '../../services/TTS.js';

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

    // // Tách tiếng Anh và tiếng Việt
    // const fullText = result.script;
    // const match = fullText.match(/^(.*?)(?:\s*\((.*?)\))?$/s);

    // let englishText = fullText;
    // let vietnameseTranslation = '';

    // if (match) {
    //   englishText = match[1].trim();
    //   vietnameseTranslation = match[2]?.trim() || '';
    // }

    // Lấy tất cả phần trong dấu ngoặc đơn
    const matches = result.script.match(/\((.*?)\)/gs); // 's' để bắt xuống dòng

    // Ghép lại làm bản dịch
    const vietnameseTranslation = matches
      ? matches.map((m) => m.slice(1, -1).trim()).join(' ')
      : '';

    // Loại bỏ tất cả phần trong dấu ngoặc đơn khỏi đoạn gốc
    let englishText = result.script.replace(/\s*\(.*?\)/gs, '').trim();
    englishText = englishText.replace(/"/g, '').trim();
    console.log('fullText:', result.script);
    console.log('Kịch bản tiếng Anh:', englishText);
    console.log('Phiên dịch tiếng Việt:', vietnameseTranslation);

    const Audio = await synthesizeGradioSpeech(englishText);

    return res
      .status(200)
      .json({ script: englishText, translatedScript: vietnameseTranslation, audioUrl: Audio });
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo kịch bản.' });
  }
};
