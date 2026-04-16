import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from schemas import RecipeCreate

def extract_recipe_with_llm(url: str, html_text: str) -> RecipeCreate:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "YOUR_GEMINI_API_KEY":
        # Fallback for testing environment if API key is not provided
        return get_mock_recipe(url)
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=api_key,
        temperature=0.2
    )

    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'extract_prompt.txt')
    with open(prompt_path, 'r') as f:
        prompt_template = f.read()

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["html_content"]
    )
    
    chain = prompt | llm

    response = chain.invoke({"html_content": html_text})
    
    # Extract JSON from response (Langchain gemini sometimes wraps it in ```json)
    content = response.content
    if "```json" in content:
        content = content.split("```json")[-1].split("```")[0]
    elif "```" in content:
        content = content.split("```")[-1].split("```")[0]
        
    try:
        data = json.loads(content.strip())
        data["url"] = url
        return RecipeCreate(**data)
    except Exception as e:
        print("Parsing JSON failed from LLM Output:", content)
        raise e

def get_mock_recipe(url: str) -> RecipeCreate:
    # Dummy mock data to allow frontend presentation if API key is unset
    import schemas
    return schemas.RecipeCreate(
        url=url,
        title="Classic Grilled Cheese Sandwich",
        cuisine="American",
        prep_time="5 mins",
        cook_time="10 mins",
        total_time="15 mins",
        servings=2,
        difficulty="easy",
        ingredients=[
            schemas.Ingredient(quantity="4", unit="slices", item="white bread"),
            schemas.Ingredient(quantity="2", unit="slices", item="cheddar cheese"),
            schemas.Ingredient(quantity="2", unit="tbsp", item="butter")
        ],
        instructions=[
            "Butter one side of each bread slice.",
            "Place cheese between two slices, butter side facing out.",
            "Heat a skillet over medium heat.",
            "Cook sandwich 3–4 minutes per side until golden brown and cheese is melted.",
            "Slice and serve hot."
        ],
        nutrition_estimate=schemas.NutritionEstimate(
            calories=350,
            protein="12g",
            carbs="30g",
            fat="20g"
        ),
        substitutions=[
            "Replace butter with olive oil for a dairy-free option.",
            "Use whole wheat bread instead of white bread for more fiber.",
            "Swap cheddar with mozzarella for a milder, stretchier cheese."
        ],
        shopping_list={
            "dairy": ["cheddar cheese", "butter"],
            "bakery": ["white bread"]
        },
        related_recipes=[
            "Tomato Soup",
            "French Onion Grilled Cheese",
            "Caprese Sandwich"
        ]
    )
