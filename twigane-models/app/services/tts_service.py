from TTS.api import TTS
from fastapi.responses import FileResponse
import os

class TTSService:
    def __init__(self):
        self.model = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")
        
    async def generate_speech(self, text, *args):
        try:
            # Generate speech from text
            audio_path = "temp_audio.wav"
            self.model.tts_to_file(text=text, file_path=audio_path)
            
            # Return the audio file path
            return {
                "audio_url": f"/audio/{os.path.basename(audio_path)}"
            }
            
        except Exception as e:
            raise Exception(f"Speech synthesis failed: {str(e)}")
        finally:
            # Clean up the temporary file after sending
            if os.path.exists(audio_path):
                os.remove(audio_path)