import pykakasi
from dragonmapper import hanzi
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

# --- Pydantic Models for Request/Response ---


class TextsRequest(BaseModel):
    """Request model for input texts."""

    texts: list[str] = Field(
        ..., min_length=1, description="The list of texts to be converted."
    )


class PinyinResponse(BaseModel):
    """Response model for Pinyin conversion."""

    pinyins: list[str]


class HiraganaResponse(BaseModel):
    """Response model for Hiragana conversion."""

    hiraganas: list[str]


# --- FastAPI Application ---

app = FastAPI(
    title="Language Translator Service",
    description="A microservice to convert Chinese characters to Pinyin and Japanese Kanji to Hiragana.",
    version="0.1.0",
)

# Initialize pykakasi converter
kks = pykakasi.kakasi()


@app.post("/api/cool_asia/pinyin", response_model=PinyinResponse)
async def convert_to_pinyin(request: TextsRequest):
    """
    Converts a list of Chinese texts (Hanzi) to Pinyin.
    """
    try:
        pinyin_texts = [hanzi.to_pinyin(text) for text in request.texts]
        return PinyinResponse(pinyins=pinyin_texts)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred during Pinyin conversion: {e}"
        )


@app.post("/api/cool_asia/hiragana", response_model=HiraganaResponse)
async def convert_to_hiragana(request: TextsRequest):
    """
    Converts a list of Japanese texts (containing Kanji) to Hiragana.
    """
    try:
        hiragana_texts = [
            "".join([item["hira"] for item in kks.convert(text)])
            for text in request.texts
        ]
        return HiraganaResponse(hiraganas=hiragana_texts)
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"An error occurred during Hiragana conversion: {e}"
        )


@app.get("/", summary="Health Check")
async def root():
    return {"message": "Translator service is running."}
