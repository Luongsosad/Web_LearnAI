import { generateScript } from '../../services/GroqChat.js';
import { synthesizeGradioSpeech } from '../../services/TTS.js';

const TOPICS = ['family', 'school', 'travel', 'friendship', 'adventure'];

// Lấy danh sách truyện (id, title, content_en, content_vi, audio_en)
const getBilingualStories = async (req, res) => {
  const { topic } = req.query;
  if (!topic || !TOPICS.includes(topic)) {
    return res.status(400).json({ error: 'Chủ đề không hợp lệ.' });
  }
  try {
    const prompt = `Chủ đề: ${topic}`;
    const { script } = await generateScript(prompt, [], 'bilingualStory');
    let stories = [];
    try {
      stories = JSON.parse(script);
    } catch {
      return res.status(500).json({ error: 'AI trả về dữ liệu không hợp lệ.', raw: script });
    }
    // Sinh audio cho content_en của từng truyện
    for (const story of stories) {
      let audio_en = '';
      try {
        let englishText = story.content_en;
        console.log('TTS ENGLISH:', englishText);
        if (englishText.length > 500) englishText = englishText.slice(0, 500);
        audio_en = englishText
          ? await synthesizeGradioSpeech(englishText, 'en-US-AvaNeural (en-US, Female)')
          : '';
        if (!audio_en) {
          console.error('TTS EN failed:', englishText);
          audio_en = '';
        }
      } catch (e) {
        console.error('Lỗi sinh audio_en:', e);
        audio_en = '';
      }
      story.audio_en = audio_en;
    }
    res.json({ stories });
  } catch (err) {
    console.error('Lỗi tổng:', err);
    res.status(500).json({ error: 'Lỗi khi sinh truyện.' });
  }
};

// Lấy thông tin cụm tiếng Anh
async function getWordInfo(req, res) {
  const { word } = req.query;
  if (!word) return res.status(400).json({ error: 'Thiếu từ.' });
  const pronunciation = '/ˈsæmpl/';
  const meaning = `Nghĩa tiếng Việt của ${word}`;
  const audio = await synthesizeGradioSpeech(word, 'en-US-AvaNeural (en-US, Female)');
  res.json({ word, pronunciation, meaning, audio });
}

export { getBilingualStories, getWordInfo };
