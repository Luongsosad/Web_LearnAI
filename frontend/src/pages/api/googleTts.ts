import type { NextApiRequest, NextApiResponse } from "next";
import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required" });
    }

    // Kiểm tra biến môi trường
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error("GOOGLE_APPLICATION_CREDENTIALS not set");
    }

    const client = new TextToSpeechClient();
    const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: { languageCode: "vi-VN", name: "vi-VN-Wavenet-A" }, // Tiếng Việt
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    if (!response.audioContent) {
      throw new Error("No audio content returned");
    }

    res.setHeader("Content-Type", "audio/mpeg");
    res.status(200).send(response.audioContent);
  } catch (err: any) {
    console.error("Text-to-Speech error:", err.message, err.details);
    res.status(500).json({ error: "Text-to-Speech failed", details: err.message });
  }
}