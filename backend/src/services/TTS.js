import { Client } from '@gradio/client'; // Import Client từ @gradio/client

export async function synthesizeGradioSpeech(
  text,
  voice = 'en-US-AvaNeural (en-US, Female)',
  rate = 1.0,
  pitch = 1.0,
  num_lines = 2
) {
  try {
    const client = await Client.connect('Luongsosad/tts');
    const result = await client.predict('/tts_interface', {
      text,
      voice,
      rate,
      pitch,
      num_lines,
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
