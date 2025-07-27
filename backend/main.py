import speech_recognition as sr
import wave
from langchain_groq import ChatGroq
from gtts import gTTS
from playsound import playsound
import os
import uuid

# === Setup Groq LLM ===
llm = ChatGroq(
    model="llama3-70b-8192",
    groq_api_key="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",  # replace this
    temperature=0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)


def speak_with_gtts(text, lang="en"):
    filename = f"voice_{uuid.uuid4().hex[:8]}.mp3"
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(filename)
        playsound(filename)
    finally:
        if os.path.exists(filename):
            os.remove(filename)


# === Function to get voice input ===
def listen_and_transcribe(save_audio_as="output.wav", language="hi-IN"):
    recognizer = sr.Recognizer()

    with sr.Microphone() as source:
        print("🎙️ Speak now...")
        recognizer.adjust_for_ambient_noise(source, duration=1)
        print(f"Mic energy threshold: {recognizer.energy_threshold}")

        try:
            audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
        except sr.WaitTimeoutError:
            print("❌ No speech detected.")
            return None

    # Save audio for verification
    with wave.open(save_audio_as, "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(16000)
        f.writeframes(audio.get_raw_data())

    print(f"🔉 Audio saved to {save_audio_as}")

    try:
        print("⏳ Transcribing...")
        text = recognizer.recognize_google(audio, language=language)
        print("📝 You said:", text)
        return text
    except sr.UnknownValueError:
        print("❌ Could not understand audio.")
        return None
    except sr.RequestError as e:
        print(f"❌ API error: {e}")
        return None


# === Main Voice-to-LLM Loop ===
if __name__ == "__main__":
    transcript = listen_and_transcribe(language="hi-IN")  # Or "en-IN"

    if transcript:
        print("🔁 Sending to Groq LLaMA...")
        ai_msg = llm.invoke(transcript)
        print("🤖 AI says:", ai_msg.content)
        speak_with_gtts(ai_msg.content, lang="hi")
