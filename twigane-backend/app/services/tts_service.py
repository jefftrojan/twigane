from gtts import gTTS
import io
import base64

class TextToSpeechService:
    def __init__(self):
        self.language = 'rw'  # Kinyarwanda language code
        
    async def generate_speech(self, text: str) -> str:
        # Create gTTS object
        tts = gTTS(text=text, lang=self.language, slow=False)
        
        # Save to bytes buffer
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        
        # Convert to base64 for easy transmission
        audio_base64 = base64.b64encode(fp.read()).decode()
        
        return {
            "audio_data": audio_base64,
            "content_type": "audio/mp3"
        }