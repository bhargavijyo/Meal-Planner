const API_BASE = "/api";
let currentRecipes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Tab Navigation
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.add('hidden'));

            tab.classList.add('active');
            const targetId = tab.getAttribute('data-tab');
            document.getElementById(targetId).classList.remove('hidden');

            if (targetId === 'history') loadHistory();
            if (targetId === 'planner') loadPlannerOptions();
        });
    });

    // Extract Recipe
    const extractBtn = document.getElementById('extract-btn');
    const urlInput = document.getElementById('recipe-url');
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('recipe-result');

    extractBtn.addEventListener('click', async () => {
        const url = urlInput.value;
        if (!url) return alert('Please enter a valid URL');

        resultDiv.classList.add('hidden');
        resultDiv.innerHTML = '';
        loading.classList.remove('hidden');

        try {
            // Attempt to hit the backend API
            const response = await fetch(`${API_BASE}/extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            if (!response.ok) throw new Error('API failed');
            const data = await response.json();
            renderRecipeDetails(data, resultDiv);

        } catch (error) {
            console.error("Backend error, falling back to mock data:", error);
            // Fallback mock data if backend isn't running
            setTimeout(() => renderRecipeDetails(getMockRecipe(url), resultDiv), 1500);
        } finally {
            loading.classList.add('hidden');
            resultDiv.classList.remove('hidden');
        }
    });

    // Modal Close
    document.querySelector('.close-btn').addEventListener('click', () => {
        document.getElementById('recipe-modal').classList.add('hidden');
    });

    // Generate Meal Plan
    document.getElementById('generate-plan-btn').addEventListener('click', () => {
        const select = document.getElementById('recipe-select');
        const selectedIds = Array.from(select.selectedOptions).map(opt => opt.value);
        if (selectedIds.length === 0) return alert('Please select at least one recipe.');

        const selectedRecipes = currentRecipes.filter(r => selectedIds.includes(r.id.toString()));
        const mergedList = {};

        selectedRecipes.forEach(recipe => {
            if(recipe.shopping_list) {
                for (let [category, items] of Object.entries(recipe.shopping_list)) {
                    if (!mergedList[category]) mergedList[category] = [];
                    mergedList[category].push(...items);
                }
            }
        });

        const listDiv = document.getElementById('merged-shopping-list');
        listDiv.innerHTML = '';
        
        for (let [category, items] of Object.entries(mergedList)) {
            const uniqueItems = [...new Set(items)];
            listDiv.innerHTML += `
                <div class="card" style="margin-top: 1rem;">
                    <h4 style="color: var(--primary); text-transform: capitalize;">${category}</h4>
                    <ul style="margin-top: 0.5rem; margin-left: 1rem;">
                        ${uniqueItems.map(i => `<li>${i}</li>`).join('')}
                    </ul>
                </div>
            `;
        }
        document.getElementById('planner-result').classList.remove('hidden');
    });
});

async function loadHistory() {
    const tbody = document.getElementById('history-body');
    try {
        const res = await fetch(`${API_BASE}/history`);
        if (!res.ok) throw new Error();
        currentRecipes = await res.json();
    } catch (e) {
        // Mock DB
        currentRecipes = [getMockRecipe("https://example.com/1", 1)];
    }
    
    tbody.innerHTML = currentRecipes.map(r => `
        <tr>
            <td style="font-weight: 600;">${r.title}</td>
            <td>${r.cuisine}</td>
            <td>
                <span class="tag" style="background: ${r.difficulty === 'easy' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)'}; color: ${r.difficulty === 'easy' ? '#22c55e' : '#f59e0b'};">
                    ${r.difficulty}
                </span>
            </td>
            <td>${new Date().toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="openModal(${r.id})">Details</button>
            </td>
        </tr>
    `).join('');
}

function loadPlannerOptions() {
    const select = document.getElementById('recipe-select');
    select.innerHTML = currentRecipes.map(r => `<option value="${r.id}">${r.title}</option>`).join('');
}

function openModal(id) {
    const recipe = currentRecipes.find(r => r.id === id);
    if (!recipe) return;
    const detailsDiv = document.getElementById('modal-recipe-details');
    renderRecipeDetails(recipe, detailsDiv);
    document.getElementById('recipe-modal').classList.remove('hidden');
}

function renderRecipeDetails(recipe, container) {
    container.innerHTML = `
        <div class="app-header" style="text-align: left; margin-bottom: 1rem;">
            <h2>${recipe.title}</h2>
            <div class="tag-container" style="margin-top: 1rem;">
                <span class="tag">⏱️ Prep: ${recipe.prep_time}</span>
                <span class="tag">🍳 Cook: ${recipe.cook_time}</span>
                <span class="tag">🕒 Total: ${recipe.total_time}</span>
                <span class="tag">🍽️ Servings: ${recipe.servings}</span>
            </div>
        </div>

        <div class="recipe-grid">
            <div class="card">
                <h3>Ingredients</h3>
                <ul>
                    ${recipe.ingredients.map(i => `<li><strong>${i.quantity} ${i.unit}</strong> ${i.item}</li>`).join('')}
                </ul>
            </div>

            <div class="card">
                <h3>Instructions</h3>
                <ol style="margin-left: 1.2rem; color: var(--text-secondary);">
                    ${recipe.instructions.map(step => `<li style="margin-bottom: 0.5rem;">${step}</li>`).join('')}
                </ol>
            </div>

            <div class="card">
                <h3>Nutrition Estimate</h3>
                <ul style="list-style: none;">
                    <li>🔥 Calories: ${recipe.nutrition_estimate.calories}</li>
                    <li>🥩 Protein: ${recipe.nutrition_estimate.protein}</li>
                    <li>🍞 Carbs: ${recipe.nutrition_estimate.carbs}</li>
                    <li>🧈 Fat: ${recipe.nutrition_estimate.fat}</li>
                </ul>
            </div>

            <div class="card">
                <h3>Substitutions</h3>
                <ul>
                    ${recipe.substitutions.map(sub => `<li>${sub}</li>`).join('')}
                </ul>
            </div>
            
            <div class="card" style="grid-column: 1 / -1;">
                <h3>Related Recipes</h3>
                <div class="tag-container">
                    ${recipe.related_recipes.map(r => `<span class="tag" style="background: rgba(59, 130, 246, 0.2); color: #3b82f6;">${r}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function getMockRecipe(url, id = 99) {
    return {
        id: id,
        url: url,
        title: "Classic Grilled Cheese Sandwich",
        cuisine: "American",
        prep_time: "5 mins",
        cook_time: "10 mins",
        total_time: "15 mins",
        servings: 2,
        difficulty: "easy",
        ingredients: [
            { quantity: "4", unit: "slices", item: "white bread" },
            { quantity: "2", unit: "slices", item: "cheddar cheese" },
            { quantity: "2", unit: "tbsp", item: "butter" }
        ],
        instructions: [
            "Butter one side of each bread slice.",
            "Place cheese between two slices, butter side facing out.",
            "Heat a skillet over medium heat.",
            "Cook sandwich 3–4 minutes per side until golden brown and cheese is melted.",
            "Slice and serve hot."
        ],
        nutrition_estimate: { calories: 350, protein: "12g", carbs: "30g", fat: "20g" },
        substitutions: [
            "Replace butter with olive oil for a dairy-free option.",
            "Use whole wheat bread instead of white bread for more fiber.",
            "Swap cheddar with mozzarella for a milder, stretchier cheese."
        ],
        shopping_list: {
            "dairy": ["cheddar cheese", "butter"],
            "bakery": ["white bread"]
        },
        related_recipes: ["Tomato Soup", "French Onion Grilled Cheese", "Caprese Sandwich"]
    };
}
