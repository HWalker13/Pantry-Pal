import os
import json
from groq import Groq
from fastapi import HTTPException


def get_recipe_suggestions(pantry_summary: str) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, detail="AI service not configured")

    prompt = (
        f"I have these ingredients in my pantry: {pantry_summary}.\n\n"
        "Suggest 3 recipes I can make, prioritizing ingredients I already have. "
        "For each recipe, use only ingredients that are realistic to combine. "
        "Return a JSON object with this exact structure — no markdown, no extra text:\n"
        '{"recipes": [{"name": "...", "description": "...", "ingredients": ["..."], '
        '"instructions": "...", "uses_from_pantry": ["..."]}]}'
    )

    client = Groq(api_key=api_key)
    message = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=1024,
    )

    raw = message.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=502, detail="AI returned malformed response")
