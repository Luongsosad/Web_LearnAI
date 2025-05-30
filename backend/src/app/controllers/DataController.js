import fs from 'fs';
import path from 'path';

export const getVocabularyData = async (req, res) => {
  try {
    // Kiểm tra method
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Phương thức không được hỗ trợ.' });
    }

    const filePath = path.resolve('src/storage/data.json');

    // Đọc file JSON
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Lỗi khi đọc file:', err);
        return res.status(500).json({ error: 'Lỗi khi đọc file dữ liệu.' });
      }

      try {
        const jsonData = JSON.parse(data);
        return res.status(200).json(jsonData);
      } catch (parseErr) {
        console.error('Lỗi parse JSON:', parseErr);
        return res.status(500).json({ error: 'Dữ liệu JSON không hợp lệ.' });
      }
    });
  } catch (err) {
    console.error('Lỗi controller:', err.message);
    return res.status(500).json({ error: 'Lỗi server khi xử lý dữ liệu.' });
  }
};
