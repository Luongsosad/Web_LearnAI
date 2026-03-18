import { Client } from '@gradio/client'; // Import Client từ @gradio/client
import dotenv from 'dotenv';

import process from 'process';
// Khởi tạo biến môi trường
dotenv.config({ path: './src/app/config/.env' });

export async function synthesizeGradioSpeech(
  text,
  voice = 'en-US-AvaNeural - en-US (Female)',
  rate = 1.0,
  pitch = 1.0,
  num_lines = 2
) {
  try {
    const normalizedVoice =
      voice.includes('(') && voice.includes(',')
        ? voice.replace(' (', ' - ').replace(', ', ' (').replace(')', ')')
        : voice;
    const hfToken = process.env.HF_TOKEN || '';
    const client = await Client.connect(
      'Luongsosad/edge-tts',
      hfToken ? { hf_token: hfToken } : undefined
    );
    console.log('Gradio TTS client connected ', num_lines);
    const result = await client.predict('/tts_interface', {
      text,
      voice: normalizedVoice,
      rate,
      pitch,
    });
    // console.log(result) // mô tả script không ổn lắm
    // Lọc bỏ giá trị null và lấy URL file âm thanh
    const audioData = result.data?.filter((item) => item !== null)[0];
    if (!audioData || !audioData.url) {
      throw new Error('Audio URL not found');
    }

    return audioData.url;
  } catch (err) {
    console.error('Gradio TTS error:', err);
    return null;
  }
}
