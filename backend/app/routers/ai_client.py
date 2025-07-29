import os
import dotenv
from pathlib import Path

env_path = Path(__file__).parent.parent.parent / '.env'
dotenv.load_dotenv(dotenv_path=env_path)

try:
    from openai import AsyncOpenAI
except ImportError:
    AsyncOpenAI = None

def get_ai_client():
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("Warning: OPENROUTER_API_KEY is not set in the environment variables. AI features will be disabled.")
        return None

    if AsyncOpenAI is None:
        print("Error: openai package is not installed. Please install it to enable AI features.")
        return None

    print(f"OPENROUTER_API_KEY loaded successfully: {api_key[:4]}...")
    try:
        return AsyncOpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key
        )
    except Exception as e:
        print(f"Error initializing OpenAI client: {e}")
        return None