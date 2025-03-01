from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import io

class EssayService:
    def __init__(self):
        self.processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
        self.model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")

    async def process_handwritten_essay(self, image_bytes):
        try:
            # Convert bytes to PIL Image
            image = Image.open(io.BytesIO(image_bytes))
            
            # Preprocess the image
            pixel_values = self.processor(image, return_tensors="pt").pixel_values
            
            # Generate text
            generated_ids = self.model.generate(pixel_values)
            
            # Decode the generated ids
            transcribed_text = self.processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            
            return {
                "original_text": transcribed_text,
                "analysis": {
                    "pros": ["Text successfully extracted"],
                    "cons": [],
                    "suggestions": []
                }
            }

        except Exception as e:
            raise Exception(f"Essay processing failed: {str(e)}")