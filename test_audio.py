import webbrowser
import requests

def play_audio():
    # Make request to your TTS endpoint
    response = requests.post('http://localhost:8000/api/tts/generate', 
                           json={"text": "Hello, this is a test"})
    
    # Print response for debugging
    print("Response:", response.json())
    
    # Get audio URL from response
    audio_url = response.json().get('audio_url')
    if not audio_url:
        print("Error: No audio URL in response")
        return
    
    # Open audio in default browser/media player
    webbrowser.open(f"http://localhost:8000{audio_url}")

if __name__ == "__main__":
    play_audio()