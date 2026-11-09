import os
import json
import urllib.request
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")
key = os.getenv("NASA_API_KEY", "").strip('"').strip("'")
print(f"Checking NASA API Key: {key[:4]}...{key[-4:]}")

try:
    url = f"https://api.nasa.gov/planetary/apod?api_key={key}"
    req = urllib.request.Request(url, headers={"User-Agent": "UrbanIQ/2.4"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = json.loads(resp.read().decode())
        print("✓ NASA Open API Key is VALID and ACTIVE!")
        print(f"  Connected to NASA Open API Gateway (Code: {resp.status})")
except Exception as e:
    print(f"✗ NASA API Error: {e}")

