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

function parseForm(req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const form = formidable({ multiples: false });
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { files } = await parseForm(req);
    const audioFile = Array.isArray(files.audioFile) ? files.audioFile[0] : files.audioFile;

    if (!audioFile) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    const supportedFormats = ["audio/wav", "audio/mp3", "audio/flac", "audio/mpeg", "audio/m4a", "audio/ogg", "audio/webm"];
    if (!audioFile.mimetype || !supportedFormats.includes(audioFile.mimetype)) {
      return res.status(400).json({ error: `Unsupported audio format: ${audioFile.mimetype || "unknown"}` });
    }

    const stats = await fs.stat(audioFile.filepath);
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (stats.size > maxSize) {
      return res.status(400).json({ error: `Audio file too large: ${stats.size} bytes, max ${maxSize} bytes` });
    }

    const buffer = await fs.readFile(audioFile.filepath);

    const file = new File([buffer], audioFile.originalFilename || "audio", {
      type: audioFile.mimetype || "audio/wav",
    });

    console.log("Sending file to Groq API:", {
      name: file.name,
      size: file.size,
      type: file.type,
    });

    const transcription = await groqClient.audio.transcriptions.create({
      file,
      model: "whisper-large-v3",
      response_format: "json",
    //   language: "vi", // Điều chỉnh ngôn ngữ nếu cần
    });

    return res.status(200).json({ transcription: transcription.text });
  } catch (error: any) {
    console.error("Error processing transcription:", error.message, error.response?.data);
    return res.status(error.response?.status || 400).json({
      error: "Transcription failed",
      details: error.response?.data?.error?.message || error.message,
    });
  }
}