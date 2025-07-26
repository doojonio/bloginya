import pykakasi
from dragonmapper import hanzi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --- Pydantic Models for Request/Response ---


class TextRequest(BaseModel):
    """Request model for input text."""

    text: str = Field(..., min_length=1, description="The text to be converted.")


class PinyinResponse(BaseModel):
    """Response model for Pinyin conversion."""

    pinyin: str


class HiraganaResponse(BaseModel):
    """Response model for Hiragana conversion."""

    hiragana: str


# --- FastAPI Application ---

app = FastAPI(
    title="Language Translator Service",
    description="A microservice to convert Chinese characters to Pinyin and Japanese Kanji to Hiragana.",
    version="0.1.0",
)

# Initialize pykakasi converter
kks = pykakasi.kakasi()


@app.post("/to-pinyin", response_model=PinyinResponse)
async def convert_to_pinyin(request: TextRequest):
    """
    Converts Chinese text (Hanzi) to Pinyin.
    """
    try:
        print(request.text)
        pinyin_text = hanzi.to_pinyin(request.text)
        return PinyinResponse(pinyin=pinyin_text)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred during Pinyin conversion: {e}"
        )


@app.post("/to-hiragana", response_model=HiraganaResponse)
async def convert_to_hiragana(request: TextRequest):
    """
    Converts Japanese text (containing Kanji) to Hiragana.
    """
    try:
        result = kks.convert(request.text)
        hiragana_text = "".join([item["hira"] for item in result])
        return HiraganaResponse(hiragana=hiragana_text)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred during Hiragana conversion: {e}"
        )


@app.get("/", summary="Health Check")
async def root():
    return {"message": "Translator service is running."}
