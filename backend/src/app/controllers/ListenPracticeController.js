import { generateScript } from '../../services/GroqChat.js';
import { synthesizeGradioSpeech } from '../../services/TTS.js';

export const generatePracticeSentences = async (req, res) => {
  const { difficulty, wordCount, percentage } = req.body;

  // Validate input parameters
  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    return res.status(400).json({ error: 'Mức độ khó không hợp lệ.' });
  }

  if (!wordCount || !['3-7', 'percentage'].includes(wordCount)) {
    return res.status(400).json({ error: 'Loại số từ khuyết không hợp lệ.' });
  }

  if (wordCount === 'percentage' && (!percentage || percentage < 10 || percentage > 50)) {
    return res.status(400).json({ error: 'Phần trăm từ khuyết phải từ 10% đến 50%.' });
  }

  try {
    // Generate practice sentences using AI
    const prompt = `Tạo 5 câu tiếng Anh để luyện nghe chép chính tả với các yêu cầu:
    - Mức độ khó: ${difficulty === 'easy' ? 'dễ' : difficulty === 'medium' ? 'trung bình' : 'khó'}
    - Số từ khuyết: ${wordCount === '3-7' ? '3-7 từ mỗi câu' : `${percentage}% từ trong câu`}
    - Mỗi câu phải có độ dài phù hợp với mức độ khó
    - Trả về theo định dạng JSON array với cấu trúc:
    [
      {
        "id": 1,
        "text": "Câu tiếng Anh hoàn chỉnh",
        "missingWords": ["từ1", "từ2", "từ3"],
        "difficulty": "${difficulty}"
      }
    ]
    - Chỉ trả về JSON array, không có văn bản thêm`;

    const result = await generateScript(prompt, [], 'listen');

    // Parse the JSON response
    let sentences;
    try {
      sentences = JSON.parse(result.script);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ error: 'Lỗi khi xử lý dữ liệu từ AI.' });
    }

    // Generate audio for each sentence
    const sentencesWithAudio = [];
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i];
      console.log('TTS ENGLISH:', sentence.text);
      try {
        // Tạo audio tuần tự thay vì Promise.all
        const normalAudio = await synthesizeGradioSpeech(
          sentence.text,
          'en-US-AvaNeural (en-US, Female)',
          0,
          1,
          2
        );
        console.log('Normal audio generated:', normalAudio ? 'success' : 'failed');

        const fastAudio = await synthesizeGradioSpeech(
          sentence.text,
          'en-US-AvaNeural (en-US, Female)',
          5,
          1,
          2
        );
        console.log('Fast audio generated:', fastAudio ? 'success' : 'failed');

        sentencesWithAudio.push({
          ...sentence,
          audioUrl: normalAudio || '',
          fastAudioUrl: fastAudio || '',
          userAnswer: '',
          isCorrect: false,
        });
      } catch (audioError) {
        console.error(`Error generating audio for sentence ${i + 1}:`, audioError);
        sentencesWithAudio.push({
          ...sentence,
          audioUrl: '',
          fastAudioUrl: '',
          userAnswer: '',
          isCorrect: false,
        });
      }
    }

    return res.status(200).json({ sentences: sentencesWithAudio });
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo câu luyện tập.' });
  }
};

export const generateAudioWithSpeed = async (req, res) => {
  const { text, speed } = req.body;

  // Validate input
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Thiếu nội dung văn bản.' });
  }

  if (!speed || !['slow', 'normal', 'fast'].includes(speed)) {
    return res.status(400).json({ error: 'Tốc độ phát không hợp lệ.' });
  }

  try {
    // Map speed to pitch values
    const pitchMap = {
      slow: -10,
      normal: 1,
      fast: 12,
    };

    const rate = pitchMap[speed];
    const audioUrl = await synthesizeGradioSpeech(
      text,
      'en-US-AvaNeural (en-US, Female)',
      rate,
      1,
      2
    );

    if (!audioUrl) {
      return res.status(500).json({ error: 'Không thể tạo âm thanh.' });
    }

    return res.status(200).json({ audioUrl });
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo âm thanh.' });
  }
};

export const checkUserAnswer = async (req, res) => {
  const { sentenceId, userAnswer, correctWords } = req.body;

  // Validate input
  if (!sentenceId || !correctWords || !Array.isArray(correctWords)) {
    return res.status(400).json({ error: 'Dữ liệu không hợp lệ.' });
  }

  try {
    // Check if user answer contains any of the correct words
    const isCorrect = correctWords.some((word) =>
      userAnswer?.toLowerCase().includes(word.toLowerCase())
    );

    return res.status(200).json({
      isCorrect,
      correctWords,
      userAnswer: userAnswer || '',
    });
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi kiểm tra câu trả lời.' });
  }
};
