import fetch from "node-fetch"
import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
const uploadPomf = async (content) => {
  try {
    const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
    const timestamp = Date.now();
    const formData = new FormData();
    formData.append("file", content, `akaza-md-${timestamp}-upload.${ext || "bin"}`);

    const response = await fetch(
      "https://tmpfiles.org/api/v1/upload",
      {
        method: "POST",
        body: formData,
        headers: {
          ...formData.getHeaders(),
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      }
    );

    const result = await response.json();
    const match = /https?:\/\/tmpfiles\.org\/(.*)/.exec(result.data.url);

    if (!match) {
      throw new Error("Invalid URL format in response");
    }

    return `https://tmpfiles.org/dl/${match[1]}`;
  } catch (error) {
    console.error("Upload to tmpfiles.org failed:", error.message || error);
    throw error;
  }
};

export {
  uploadPomf
}