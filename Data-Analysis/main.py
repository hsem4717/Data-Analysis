# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from collections import defaultdict

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
    analysis_result = {
        "average_score": sum(r.score for r in reviews) / len(reviews),
        "review_count": len(reviews),
    }
    return analysis_result

@app.get("/get_reviews")
async def get_reviews():
    return reviews

@app.get("/average_scores")
async def average_scores():
    book_scores = defaultdict(list)
    for review in reviews:
        book_scores[review.book_name].append(review.score)

    average_scores = {}
    for book, scores in book_scores.items():
        average_scores[book] = sum(scores) / len(scores)

    return average_scores
