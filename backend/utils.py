import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def _get_client():
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        return None
    return Groq(api_key=api_key)

def get_groq_response(user_message, conversation_history=[]):
    """
    Get a response from Groq API
    
    Args:
        user_message (str): The user's message
        conversation_history (list): List of previous messages in format 
                                     [{"role": "user", "content": "..."}, ...]
    
    Returns:
        str: The bot's response
    """
    try:
        client = _get_client()
        if client is None:
            return "Groq API key is not set. Please configure GROQ_API_KEY in your environment or .env file."
        # Build messages array with conversation history
        messages = []
        
        # Add conversation history
        for msg in conversation_history:
            messages.append({
                "role": msg["role"],
                "content": msg["content"]
            })
        
        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        # Call Groq API
        chat_completion = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",  # You can change this to other Groq models
            temperature=0.7,
            max_tokens=1024,
            top_p=1,
            stream=False
        )
        
        # Extract and return the response
        response = chat_completion.choices[0].message.content
        return response
    
    except Exception as e:
        return f"Error communicating with Groq API: {str(e)}"

def get_available_models():
    """
    Get list of available Groq models
    """
    try:
        client = _get_client()
        if client is None:
            return []
        models = client.models.list()
        return [model.id for model in models.data]
    except Exception as e:
        return []