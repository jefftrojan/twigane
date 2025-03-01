import webbrowser
import requests

response = requests.post('http://localhost:8000/api/tts/generate', 
                        json={"text": "Hello, this is a test"})
audio_url = response.json()['audio_url']['audio_url']
webbrowser.open(f"http://localhost:8000{audio_url}")