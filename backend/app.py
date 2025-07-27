from flask import Flask, request, jsonify, send_file
from langchain_groq import ChatGroq
from gtts import gTTS
import os
import uuid
from flask import render_template
from flask_cors import CORS
from langchain_core.prompts import PromptTemplate
from murf import Murf
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from werkzeug.utils import secure_filename
from pdf import extract_text_from_pdf

app = Flask(__name__)


CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# === Setup LLM ===
llm = ChatGroq(
    model="llama3-70b-8192",
    groq_api_key="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",
)


# Define structured output
class ArogyaResponse(BaseModel):
    answer: str = Field(description="The assistant's spoken response.")
    voice_id: str = Field(description="Voice ID like 'en-US-terrell' or 'hi-IN-ayushi'.")
    report: dict = Field(description="Extracted structured data from report.")


parser = PydanticOutputParser(pydantic_object=ArogyaResponse)




MURF_API_KEY = "ap2_37bb727c-6074-499f-9032-9aa2f23b42a8"  # 🔐 put this in env in real setup


UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed extensions
ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10 MB limit

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

from supabase import create_client

url = "https://paqpnxpvvahcqkkxefxx.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhcXBueHB2dmFoY3Fra3hlZnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1ODQ5NzMsImV4cCI6MjA2OTE2MDk3M30.KvJ03Hc48hp6YK3WLSfbG2xFQE8yLomVJab_Nx8-xYM";  # 🔐 Keep this secret!
supabase = create_client(url, key)




@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_text = request.json.get("message")
        if not user_text:
            return jsonify({"error": "No text provided"}), 400
        
        prompt = PromptTemplate(
            template="""
        You are a helpful AI healthcare assistant.

        Your task is to:
        1. Understand the user's question or symptoms.
        2. Detect the language of the input (Hindi or English).
        3. Generate a detailed, empathetic, and helpful medical response in the **same language** as the user.
        4. Choose the correct Murf `voice_id`:
        - Use `"hi-IN-ayushi"` for Hindi.
        - Use `"en-US-terrell"` for English.

        ⚠️ IMPORTANT:
        - Your response **MUST be in the user's language**.
        - Output only a **valid JSON object**, containing:
        - "answer": the response text in the correct language.
        - "voice_id": correct Murf voice ID based on language.

        ❌ DO NOT include any explanation, preamble, intro, markdown, code blocks, or commentary.

        {format_instructions}

        User Question:
        {question}
        """,
            input_variables=["question"],
            partial_variables={"format_instructions": parser.get_format_instructions()},
        )

        chain = prompt | llm | parser

        # 🔁 Step 1: Invoke LLM for structured JSON output
        result: ArogyaResponse = chain.invoke({"question": user_text})
        print("🔍 LLM Structured Result:", result.voice_id)

        # 🔊 Step 2: Generate voice with Murf
        client = Murf(api_key=MURF_API_KEY)
        murf_res = client.text_to_speech.generate(
            text=result.answer,
            voice_id=result.voice_id
        )

        if not murf_res or not hasattr(murf_res, "audio_file"):
            raise Exception("Murf failed or missing audio_file")

        audio_url = murf_res.audio_file
        print("🎧 Audio URL:", audio_url)

        return jsonify({
            "response": result.answer,
            "audio_url": audio_url,
            "voice_id": result.voice_id
        })

    except Exception as e:
        print("❌ Error in /chat:", e)
        return jsonify({"error": str(e)}), 500
    
@app.route("/audio/<filename>")
def audio(filename):
    return send_file(os.path.join("audio", filename), mimetype="audio/mpeg")

@app.route("/upload", methods=["POST"])
def upload_file():
    print("📥 Upload route hit")
    print("Request files:", request.files)

    if 'file' not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files['file']
    user_id = request.form.get("user_id")  # 🧠 Get user ID from form

    if not user_id:
        return jsonify({"error": "User ID is missing"}), 400

    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        print(f"✅ Saved file to: {filepath}")

        # 1️⃣ Extract text from PDF
        extracted_text = extract_text_from_pdf(filepath)
        if not extracted_text.strip():
            return jsonify({"error": "No text found in document"}), 400

        # 2️⃣ Basic Medical Check
        medical_keywords = ["diagnosis", "hemoglobin", "prescription", "glucose", "x-ray", "ecg", "mri", "scan", "bp", "blood pressure", "sugar", "cbc", "medical", "patient", "doctor"]
        is_medical = any(keyword.lower() in extracted_text.lower() for keyword in medical_keywords)

        if not is_medical:
            return jsonify({
                "error": "⚠️ The uploaded file doesn't seem to be a valid medical report."
            }), 400

        # 3️⃣ AI Summary + Murf Audio
        try:
            print("🧠 Calling LLM to simplify extracted medical report...")
            prompt = PromptTemplate(
    template="""
You are a helpful AI medical assistant.

Your job:
1. Extract structured data from a medical report.
2. Summarize findings in the patient's language (Hindi or English).
3. Return a JSON object that includes:
   - "answer": plain language summary
   - "voice_id": matching Murf voice
   - "report": structured fields like name, date, age, blood group, hemoglobin, sugar, cholesterol, BP, etc.

⚠️ RULES:
- Your output must be ONLY valid JSON.
- ❌ Do NOT include 'Note:', explanation, markdown, or extra commentary.
- ✅ If a value is missing in the report, return an empty string "" for that field.
- 🚫 Do NOT include anything outside the JSON structure.

Here’s the format:
{{
  "answer": "...",
  "voice_id": "hi-IN-ayushi",
  "report": {{
    "name": "...",
    "age": "...",
    "blood_group": "...",
    "date": "...",
    "test_type": "...",
    "hemoglobin": "...",
    "blood_sugar": "...",
    "blood_pressure": "...",
    "cholesterol": "..."
  }}
}}

{format_instructions}

User Question:
{question}
""",
    input_variables=["question"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

            chain = prompt | llm | parser
            result: ArogyaResponse = chain.invoke({"question": extracted_text[:3000]})

            # 🗣 Murf Audio
            client = Murf(api_key=MURF_API_KEY)
            murf_res = client.text_to_speech.generate(
                text=result.answer,
                voice_id=result.voice_id
            )
            if not murf_res or not hasattr(murf_res, "audio_file"):
                raise Exception("Murf failed or missing audio_file")

            audio_url = murf_res.audio_file

            # 4️⃣ Save to Supabase
            
            print("💾 Saving report to Supabase..." )
            # insert to reports and also check for error and inserted data
            response = supabase.table("reports").insert({
                "user_id": user_id,
                "summary": result.answer,
                "audio_url": audio_url,
                "report": result.report  # 🆕 structured metadata
            }).execute()

            

            return jsonify({
                "message": "✅ File processed and summary generated",
                "filename": filename,
                "summary": result.answer,
                "voice_id": result.voice_id,
                "audio_url": audio_url
            })

        except Exception as e:

            print("❌ LLM/Murf error:", e)
            return jsonify({"error": "AI processing failed."}), 500

    return jsonify({"error": "❌ Invalid file type"}), 400

   


# Cleanup temp files (optional)
@app.after_request
def cleanup(response):
    for file in os.listdir():
        if file.startswith("voice_") and file.endswith(".mp3"):
            try:
                os.remove(file)
            except:
                pass
    return response


if __name__ == "__main__":
    app.run(debug=True)

