from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from app.services.translation_service import TranslationService

class ChatbotService:
    def __init__(self):
        self.translation_service = TranslationService()
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
        self.conversation_history = {}
        
    async def get_response(self, user_id: str, message: str) -> str:
        try:
            # Add basic response logic here
            return {
                "response": f"Echo: {message}",
                "original_message": message,
                "processed": True
            }
        except Exception as e:
            raise Exception(f"Failed to process chat message: {str(e)}")
        # Translate user message to English
        english_message = await self.translation_service.translate_text(
            message, source_lang="kin_Latn", target_lang="eng_Latn"
        )
        
        # Get or initialize conversation history
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
            
        # Encode the input and add to history
        new_input_ids = self.tokenizer.encode(
            english_message + self.tokenizer.eos_token, 
            return_tensors='pt'
        )
        
        # Append to history and maintain context window
        bot_input_ids = torch.cat([self.conversation_history[user_id], new_input_ids], dim=-1) \
            if len(self.conversation_history[user_id]) > 0 else new_input_ids
            
        # Generate response
        chat_response_ids = self.model.generate(
            bot_input_ids,
            max_length=1000,
            pad_token_id=self.tokenizer.eos_token_id,
            no_repeat_ngram_size=3,
            do_sample=True,
            top_k=100,
            top_p=0.7,
            temperature=0.8
        )
        
        # Decode and get response
        response = self.tokenizer.decode(
            chat_response_ids[:, bot_input_ids.shape[-1]:][0],
            skip_special_tokens=True
        )
        
        # Translate response to Kinyarwanda
        kinyarwanda_response = await self.translation_service.translate_text(
            response, source_lang="eng_Latn", target_lang="kin_Latn"
        )
        
        # Update conversation history
        self.conversation_history[user_id] = chat_response_ids
        
        return {
            "original_message": message,
            "response": kinyarwanda_response,
            "emotion_context": await self._analyze_response_emotion(response)
        }
        
    async def _analyze_response_emotion(self, response: str) -> dict:
        emotion_service = EmotionService()
        return await emotion_service.analyze_emotion(response)