from typing import List, Union
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class User(BaseModel):
    name: str
    localGuide: bool

class ReviewItem(BaseModel):
    user: User
    rating: str
    date: str
    review: str

@app.get("/")
def read_root():
    return {"message": "Hello world!"}

@app.post("/generate-summary")
def generate_summary(reviews: List[Union[ReviewItem, None]]):
    print(reviews)
    return {"total": len(reviews)}

# This block is necessary to avoid the 'reload' warning
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8080, reload=True)


#uvicorn app:app --reload --port 8080

