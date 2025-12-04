// api/chat.js
export default async function handler(req, res) {
  // 1. Pastikan hanya menerima method POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // 2. Ambil data dari Frontend
    const { message, history, systemPrompt } = req.body;

    // 3. Ambil API KEY dari Environment Variable Vercel (Aman di server)
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "API Key not configured on server" });
    }

    // 4. Panggil Google Gemini dari Server (Bukan dari Browser user)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }], // Simplifikasi: pesan user saat ini
          // Jika ingin history chat lengkap, sesuaikan struktur 'contents'
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            response_mime_type: "application/json",
          },
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    // 5. Kirim balik jawaban bersih ke Frontend
    return res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
