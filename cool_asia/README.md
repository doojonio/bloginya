# Language Translator Service

A microservice to convert Chinese characters to Pinyin and Japanese Kanji to Hiragana.

## API Endpoints

### Pinyin Conversion

- **URL:** `/api/cool_asia/pinyin`
- **Method:** `POST`
- **Request Body:**
```json
{
  "texts": ["你好", "世界"]
}
```
- **Response:**
```json
{
  "pinyins": ["nǐhǎo", "shìjiè"]
}
```

### Hiragana Conversion

- **URL:** `/api/cool_asia/hiragana`
- **Method:** `POST`
- **Request Body:**
```json
{
  "texts": ["こんにちは", "世界"]
}
```
- **Response:**
```json
{
  "hiraganas": ["こんにちは", "せかい"]
}
```

## Running the Service

To run the service locally, you need to have Python and Poetry installed.

1. **Clone the repository:**
```bash
git clone <repository-url>
cd cool_asia
```

2. **Install dependencies:**
```bash
poetry install
```

3. **Run the service:**
```bash
poetry run uvicorn main:app --reload
```

The service will be available at `http://localhost:8000`.

## Dependencies

- `fastapi`
- `uvicorn`
- `dragonmapper`
- `pykakasi`
