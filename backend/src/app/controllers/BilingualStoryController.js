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
    console.log('Script:', script);
    let stories = [];
    try {
      stories = JSON.parse(script);
      // If AI returned a single object, wrap it into an array for iteration
      if (!Array.isArray(stories) && stories && typeof stories === 'object') {
        stories = [stories];
      }
    } catch (e) {
      console.error('Error parsing bilingual story script:', e);
      return res.status(500).json({ error: 'AI trả về dữ liệu không hợp lệ.', raw: script });
    }
    // Sinh audio cho content_en của từng truyện
    for (const story of stories) {
      let audio_en = '';
      try {
        let englishText = story.content_en;
        console.log('TTS ENGLISH:', englishText);
        if (englishText.length > 500) englishText = englishText.slice(0, 500);
        // synthesizeGradioSpeech returns an object { url, mimeType }
        const ttsResult = englishText
          ? await synthesizeGradioSpeech(englishText, 'en-US-AvaNeural (en-US, Female)')
          : null;
        audio_en = ttsResult?.url || (typeof ttsResult === 'string' ? ttsResult : '') || '';
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
  console.log('Word:', word);
  const { script } = await generateScript(word, [], 'meaningWord');
  console.log('Response:', script);
  let audio = '';
  try {
    const audioResult = await synthesizeGradioSpeech(word, 'en-US-AvaNeural (en-US, Female)');
    audio = audioResult?.url || (typeof audioResult === 'string' ? audioResult : '') || '';
    console.log('Audio:', audio);
  } catch (e) {
    console.error('Lỗi sinh audio:', e);
    audio = '';
  }
  let words = [];
  try {
    words = JSON.parse(script);
  } catch {
    return res.status(500).json({ error: 'AI trả về dữ liệu không hợp lệ.', raw: script });
  }
  for (const w of words) {
    w.audio = audio;
    console.log('WordInfo:', w);
  }

  res.json({ wordInfo: words });
}

// Lấy thông tin nhiều từ/cụm tiếng Anh cùng lúc
async function getMultipleWordInfo(req, res) {
  const { words } = req.body;
  if (!words || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Thiếu danh sách từ hoặc không đúng định dạng.' });
  }

  console.log('Multiple words:', words);

  try {
    const wordInfoPromises = words.map(async (word) => {
      console.log('Processing word:', word);
      try {
        const { script } = await generateScript(word, [], 'meaningWord');
        let audio = '';
        try {
          const audioResult = await synthesizeGradioSpeech(word, 'en-US-AvaNeural (en-US, Female)');
          audio = audioResult?.url || (typeof audioResult === 'string' ? audioResult : '') || '';
        } catch (e) {
          console.error('Lỗi sinh audio cho từ:', word, e);
          audio = '';
        }

        let wordData = [];
        try {
          wordData = JSON.parse(script);
        } catch {
          console.error('Lỗi parse JSON cho từ:', word, script);
          return { word, error: 'Dữ liệu không hợp lệ' };
        }

        if (wordData.length > 0) {
          wordData[0].audio = audio;
          return { word, data: wordData[0] };
        } else {
          return { word, error: 'Không tìm thấy thông tin' };
        }
      } catch (err) {
        console.error('Lỗi xử lý từ:', word, err);
        return { word, error: 'Lỗi xử lý' };
      }
    });

    const results = await Promise.all(wordInfoPromises);
    res.json({ wordInfoList: results });
  } catch (err) {
    console.error('Lỗi tổng khi lấy thông tin nhiều từ:', err);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin từ.' });
  }
}

export { getBilingualStories, getWordInfo, getMultipleWordInfo };
