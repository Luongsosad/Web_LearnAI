import { Groq } from 'groq-sdk';
import { promises as fs } from 'fs';
import dotenv from 'dotenv';

// Khởi tạo biến môi trường
dotenv.config({ path: './src/app/config/.env' });

// Khởi tạo Groq API
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Hàm xử lý phiên âm âm thanh, nhận audioFile từ controller
export async function generateTextFromAudio(audioFile) {
  try {
    if (!audioFile) {
      throw new Error('Không có file âm thanh được cung cấp');
    }

    const supportedFormats = ['audio/wav', 'audio/mp3', 'audio/flac', 'audio/mpeg', 'audio/m4a', 'audio/ogg', 'audio/webm'];
    if (!audioFile.mimetype || !supportedFormats.includes(audioFile.mimetype)) {
      throw new Error(`Định dạng âm thanh không được hỗ trợ: ${audioFile.mimetype || 'không xác định'}`);
    }

    const stats = await fs.stat(audioFile.filepath);
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (stats.size > maxSize) {
      throw new Error(`File âm thanh quá lớn: ${stats.size} bytes, tối đa ${maxSize} bytes`);
    }

    const buffer = await fs.readFile(audioFile.filepath);

    const file = new File([buffer], audioFile.originalFilename || 'audio', {
      type: audioFile.mimetype || 'audio/wav',
    });

    console.log('Gửi file đến Groq API:', {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const transcription = await groq.audio.transcriptions.create({
      file,
      model: 'whisper-large-v3',
      response_format: 'json',
      // language: 'vi', // Bỏ comment nếu cần chỉ định ngôn ngữ tiếng Việt
    });

    console.log(transcription)

    return {
      text: transcription.text,
    };
  } catch (error) {
    console.error('Lỗi khi xử lý phiên âm:', error.message);
    return {
      error: 'Phiên âm thất bại',
      details: error.message,
    };
  }
}