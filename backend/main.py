from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models, schemas, crud, scraper, llm

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe Extractor & Meal Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/extract", response_model=schemas.RecipeOut)
def extract_recipe(req: schemas.ExtractRequest, db: Session = Depends(get_db)):
    url_str = str(req.url)
    # Check if already processed
    existing_recipe = crud.get_recipe_by_url(db, url_str)
    if existing_recipe:
        return existing_recipe
    
    try:
        html_text = scraper.scrape_recipe_page(url_str)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to scrape URL: {str(e)}")
        
    try:
        recipe_data = llm.extract_recipe_with_llm(url_str, html_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate structured data from LLM: {str(e)}")
        
    try:
        db_recipe = crud.create_recipe(db, recipe_data)
        return db_recipe
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@app.get("/api/history", response_model=list[schemas.RecipeOut])
def get_history(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_recipes(db, skip=skip, limit=limit)

@app.get("/api/history/{recipe_id}", response_model=schemas.RecipeOut)
def get_recipe_details(recipe_id: int, db: Session = Depends(get_db)):
    recipe = crud.get_recipe(db, recipe_id)
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
    return recipe
