# main.py
# Install the wordcloud library using: pip install wordcloud
from fastapi import FastAPI, HTTPException, File, UploadFile, Response
from starlette.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict
from wordcloud import WordCloud
import io
import matplotlib.pyplot as plt

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Review(BaseModel):
    book_name: str
    score: int
    content: str

reviews = []

@app.post("/add_review")
async def add_review(review: Review):
    reviews.append(review)
    return {"message": "Review added successfully"}

@app.post("/analyze_data")
async def analyze_data(review: Review):
    word_cloud_image = generate_word_cloud()

    # Convert the image to bytes
    img_byte_array = io.BytesIO()
    word_cloud_image.save(img_byte_array, format="PNG")
    img_byte_array = img_byte_array.getvalue()

    return StreamingResponse(io.BytesIO(img_byte_array), media_type="image/png")

def generate_word_cloud():
    all_reviews_content = ' '.join(review.content for review in reviews)
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(all_reviews_content)

    # Return the word cloud image
    return wordcloud.to_image()

@app.get("/average_scores")
async def average_scores():
    book_scores = defaultdict(list)
    for review in reviews:
        book_scores[review.book_name].append(review.score)

    average_scores = {}
    for book, scores in book_scores.items():
        average_scores[book] = sum(scores) / len(scores)

    return average_scores
