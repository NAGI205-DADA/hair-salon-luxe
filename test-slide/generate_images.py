import os
import base64
from pathlib import Path
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

SLIDES = [
    {"index": 1,  "image_prompt": "A global tire manufacturer logo presentation, red and white corporate theme, professional business slide, flat illustration, clean modern style"},
    {"index": 3,  "image_prompt": "Modern corporate office building in Tokyo, Japan, professional business headquarters, architectural photography style, clean white background"},
    {"index": 4,  "image_prompt": "A timeline infographic showing company history milestones from 1931 to 2021, flat illustration style, red and white color scheme, professional business"},
    {"index": 5,  "image_prompt": "Various types of tires for cars, trucks, and heavy machinery, product showcase, flat illustration, white background, professional"},
    {"index": 6,  "image_prompt": "World map infographic showing global business presence in 150 countries, blue and red color scheme, flat illustration, clean modern style"},
    {"index": 7,  "image_prompt": "Premium tire brand lineup display, Bridgestone BLIZZAK ECOPIA POTENZA, product branding, flat illustration, white background"},
    {"index": 8,  "image_prompt": "Sustainability and green energy vision 2050, carbon neutral concept, electric vehicle and nature, flat illustration, green and white color scheme"},
    {"index": 9,  "image_prompt": "Corporate summary infographic, global company achievements, professional business presentation, flat illustration, red and white"},
    {"index": 10, "image_prompt": "Thank you closing slide, corporate red theme, professional, flat illustration, clean minimal design"},
]

OUTPUT_DIR = Path("slides/images")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

for slide in SLIDES:
    idx = slide["index"]
    prompt = slide["image_prompt"]
    out_path = OUTPUT_DIR / f"slide_{idx:02d}.png"

    if out_path.exists():
        print(f"[skip] slide_{idx:02d}.png already exists")
        continue

    print(f"[generating] slide_{idx:02d}.png ...")
    response = client.models.generate_content(
        model="gemini-2.5-flash-image",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["IMAGE"],
        ),
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            out_path.write_bytes(part.inline_data.data)
            print(f"[saved] {out_path}")
            break
    else:
        print(f"[warn] no image returned for slide_{idx:02d}")

print("\nDone.")
