export async function chatWithTTS(message: string): Promise<{ reply: string; audioUrl: string }> {
  try {
    const response = await fetch('http://127.0.0.1:5000/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Return both response text and audio URL
    return {
      reply: data.response,
      audioUrl: `${data.audio_url}`, // build full URL
    };

  } catch (err) {
    console.error("❌ chatWithTTS ERROR:", err);
    return { reply: "⚠️ Failed to connect to backend.", audioUrl: "" };
  }
}
