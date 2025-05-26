import formidable from 'formidable';
import { generateTextFromAudio } from '../../services/GroqAudioToText.js';

// Hàm parseForm để xử lý file upload
function parseForm(req) {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export const synthesizeAudio = async (req, res) => {
  try {
    // Kiểm tra phương thức
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
    }

    // Parse file từ request
    const { files } = await parseForm(req);
    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;

    // Kiểm tra file âm thanh
    if (!audioFile) {
      return res.status(400).json({ error: 'Không có file âm thanh được cung cấp.' });
    }

    // Gọi hàm generateTextFromAudio từ dịch vụ
    const result = await generateTextFromAudio(audioFile);

    // Trả về kết quả
    if (result.error) {
      return res.status(400).json(result);
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi controller:', error.message);
    return res.status(500).json({ error: 'Lỗi server khi xử lý phiên âm.' });
  }
};