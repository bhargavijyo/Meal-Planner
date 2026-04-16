from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Optional
from datetime import datetime

class Ingredient(BaseModel):
    quantity: str
    unit: str
    item: str

class NutritionEstimate(BaseModel):
    calories: int
    protein: str
    carbs: str
    fat: str

class RecipeBase(BaseModel):
    url: str
    title: str
    cuisine: str
    prep_time: str
    cook_time: str
    total_time: str
    servings: int
    difficulty: str
    ingredients: List[Ingredient]
    instructions: List[str]
    nutrition_estimate: NutritionEstimate
    substitutions: List[str]
    shopping_list: Dict[str, List[str]]
    related_recipes: List[str]

class RecipeCreate(RecipeBase):
    pass

class RecipeOut(RecipeBase):
    id: int
    date_extracted: datetime

    class Config:
        from_attributes = True

class ExtractRequest(BaseModel):
    url: HttpUrl
