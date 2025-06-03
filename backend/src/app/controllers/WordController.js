import {
  getAllCategories as getAllCategoriesModel,
  createCategory as createCategoryModel,
  getTopicsByCategoryId as getTopicsByCategoryIdModel,
  createTopic as createTopicModel,
  getWordsByTopicId as getWordsByTopicIdModel,
  createWord as createWordModel
} from '../models/wordModels.js';
import { generateScript } from '../../services/GroqChat.js';


export const generateQuestions = async (req, res) => {
  const { category_id, topic_id } = req.query;

  console.log('Generating questions for category:', category_id, 'and topic:', topic_id);

  try {
    if (!topic_id || isNaN(topic_id)) {
      return res.status(400).json({ error: 'Topic ID không hợp lệ.' });
    }

    // Lấy danh sách từ vựng từ database
    const words = await getWordsByTopicIdModel(topic_id);

    if (!words || words.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy từ vựng cho topic này.' });
    }

    // Chuyển danh sách từ vựng thành mảng chuỗi (chỉ lấy word) và giữ word_id
    const wordList = words.map((word) => ({
      id: word.id,
      word: word.word,
    })).sort(() => Math.random() - 0.5);

    // Tạo câu hỏi cho từng từ
    const questions = await Promise.all(
      wordList.map(async ({ id, word }) => {
        const prompt = `
          Tạo câu hỏi kiểm tra cho từ vựng "${word}":
          1. Một câu tiếng Anh hay với từ "${word}" được thay bằng "_____".
          2. Dịch nghĩa câu tiếng Anh sang tiếng Việt.
          3. Đáp án là từ "${word}".
          4. Gợi ý (phát âm hoặc một phần nghĩa của từ).
          5. Hai câu tiếng Anh tham khảo sử dụng từ "${word}".
          Trả về định dạng:
          Câu tiếng Anh: [Câu với _____]
          Dịch nghĩa: [Dịch tiếng Việt]
          Đáp án: [Từ vựng]
          Gợi ý: [Phát âm hoặc nghĩa]
          Câu tham khảo:
          1. [Câu 1]
          2. [Câu 2]

          Hãy tuân thủ nghiệm ngặt format và không thêm bất kỳ nội dung nào khác ngoài yêu cầu trên.
        `;

        const { script } = await generateScript(prompt, [], 'words');

        // console.log(`Kết quả cho từ "${word}":`, script);

        // Regex để parse kết quả, linh hoạt hơn
        const regex = /Câu tiếng Anh:\s*(.*?)\n\s*Dịch nghĩa:\s*(.*?)\n\s*(?:Đáp án:\s*(.*?)\n\s*)?Gợi ý:\s*(.*?)\n\s*Câu tham khảo:\s*\n\s*1\.\s*(.*?)\n\s*2\.\s*(.*)/s;
        let match = script.match(regex);

        let english_sentence, vietnamese_translation, answer, hint, ref_sentence1, ref_sentence2;

        if (match) {
          [, english_sentence, vietnamese_translation, answer, hint, ref_sentence1, ref_sentence2] = match;
          answer = answer?.trim() || word; // Dùng word nếu Đáp án thiếu
        } else {
          // Logic dự phòng: parse từng dòng
          console.warn(`Regex thất bại cho từ "${word}", thử parse từng dòng`);
          const lines = script.split('\n').map(line => line.trim()).filter(line => line);

          english_sentence = lines.find(line => line.startsWith('Câu tiếng Anh:'))?.replace('Câu tiếng Anh:', '').trim() || '';
          vietnamese_translation = lines.find(line => line.startsWith('Dịch nghĩa:'))?.replace('Dịch nghĩa:', '').trim() || '';
          answer = lines.find(line => line.startsWith('Đáp án:'))?.replace('Đáp án:', '').trim() || word;
          hint = lines.find(line => line.startsWith('Gợi ý:'))?.replace('Gợi ý:', '').trim() || '';

          const refIndex = lines.findIndex(line => line.startsWith('Câu tham khảo:'));
          ref_sentence1 = lines[refIndex + 1]?.startsWith('1.') ? lines[refIndex + 1].replace('1.', '').trim() : '';
          ref_sentence2 = lines[refIndex + 2]?.startsWith('2.') ? lines[refIndex + 2].replace('2.', '').trim() : '';

          if (!english_sentence || !vietnamese_translation || !hint || !ref_sentence1 || !ref_sentence2) {
            console.error(`Lỗi parse dự phòng cho từ "${word}":`, script);
            return {
              word_id: id,
              error: 'Không thể tạo câu hỏi.',
            };
          }
        }

        return {
          word_id: id,
          english_sentence: english_sentence.trim(),
          vietnamese_translation: vietnamese_translation.trim(),
          answer: answer.trim(),
          hint: hint.trim(),
          reference_sentences: [ref_sentence1.trim(), ref_sentence2.trim()],
        };
      })
    );

    // Lọc bỏ các câu hỏi lỗi (nếu có)
    const validQuestions = questions.filter((q) => !q.error);
    // console.log('Valid questions:', validQuestions);

    return res.status(200).json({ questions: validQuestions });
  } catch (error) {
    console.error('Lỗi controller:', error);
    return res.status(500).json({ error: 'Lỗi server khi tạo câu hỏi.' });
  }
};

// category
export async function getAllCategories(req, res) {
  try {
    const categories = await getAllCategoriesModel();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createCategory(req, res) {
  try {
    const { name } = req.body;
    const category = await createCategoryModel(name);
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// topic
export async function getTopicsByCategoryId(req, res) {
  try {
    const { categoryId } = req.params;
    const topics = await getTopicsByCategoryIdModel(categoryId);
    res.json(topics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createTopic(req, res) {
  try {
    const { name, categoryId } = req.body;
    const topic = await createTopicModel(name, categoryId);
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// word
export async function getWordsByTopicId(req, res) {
  try {
    const { topicId } = req.params;
    const words = await getWordsByTopicIdModel(topicId);
    res.json(words);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function createWord(req, res) {
  try {
    const wordData = req.body;
    const word = await createWordModel(wordData);
    res.status(201).json(word);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
