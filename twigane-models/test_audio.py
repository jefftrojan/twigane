import pygame
import requests

def play_audio():
    # Make request to your TTS endpoint
    response = requests.post('http://localhost:8000/api/tts/generate', 
                           json={"text": "Hello, this is a test"})
    
    audio_url = response.json()['audio_url']['audio_url']
    
    # Initialize pygame mixer
    pygame.mixer.init()
    
    # Load and play the audio
    pygame.mixer.music.load(f"http://localhost:8000{audio_url}")
    pygame.mixer.music.play()
    
    # Wait for the audio to finish
    while pygame.mixer.music.get_busy():
        pygame.time.Clock().tick(10)

if __name__ == "__main__":
    play_audio()