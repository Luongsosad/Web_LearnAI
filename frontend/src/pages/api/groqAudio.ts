import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import { Groq } from "groq-sdk";
import { promises as fs } from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

const groqClient = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ApiResponse {
  transcription?: string;
  error?: string;
  details?: string;
}

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Phương thức không được hỗ trợ" });
    }

    const { files } = await parseForm(req);
    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;

    if (!audioFile) {
      return res.status(400).json({ error: "Không có file âm thanh được tải lên" });
    }

    const supportedFormats = ["audio/wav", "audio/mp3", "audio/flac", "audio/mpeg", "audio/m4a", "audio/ogg", "audio/webm"];
    if (!audioFile.mimetype || !supportedFormats.includes(audioFile.mimetype)) {
      return res.status(400).json({ error: `Định dạng âm thanh không được hỗ trợ: ${audioFile.mimetype || "không xác định"}` });
    }

    const stats = await fs.stat(audioFile.filepath);
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (stats.size > maxSize) {
      return res.status(400).json({ error: `File âm thanh quá lớn: ${stats.size} bytes, tối đa ${maxSize} bytes` });
    }

    const buffer = await fs.readFile(audioFile.filepath);

    const file = new File([buffer], audioFile.originalFilename || "audio", {
      type: audioFile.mimetype || "audio/wav",
    });

    console.log("Gửi file đến Groq API:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const transcription = await groqClient.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      response_format: "json",
      // language: "vi", // Bỏ comment nếu cần chỉ định ngôn ngữ tiếng Việt
    });

    return res.status(200).json({ transcription: transcription.text });
  } catch (error) {
    // Thay 'any' bằng 'Error'
    console.error("Lỗi khi xử lý phiên âm:", (error as Error).message);
    return res.status(500).json({
      error: "Phiên âm thất bại",
      details: (error as Error).message,
    });
  }
}