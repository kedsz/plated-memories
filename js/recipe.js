import { loadComponents } from './main.js'
import { updateHeader } from './category.js'
import { findCategoryTheme } from './category.js'

/**
 * Flattens the recipe data and finds a recipe by its ID.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 * @param {number} id - The ID of the recipe to find.
 * @returns {object|null} - The recipe object or null if not found.
 */
function getById(categoryKey, id) {
    fetch('./recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadComponents(data, categoryKey);
            if (categoryKey && data[categoryKey]) {
                const category = data[categoryKey];
                updateHeader(category, categoryKey);
                const recipe = category.recipes.find(r => r.id === id);
                if (recipe) {
                    renderRecipe(categoryKey, recipe);
                } else {
                    document.getElementById('recipe-not-found').classList.remove('hidden');
                }
            } else {
                // Handle case where category is not found
                titleElement.textContent = "Category Not Found";
                document.getElementById('category-description').textContent = "Sorry, we couldn't find the recipes you were looking for.";
            }
        })
        .catch(error => {
            console.error('Error loading or parsing JSON:', error);
        });
    return null;
}

/**
 * Returns an SVG icon string for a given source.
 * @param {string} source - The source name (e.g., "YouTube").
 * @returns {string} - The icon HTML.
 */
function getSourceIcon(source) {
    const icons = {
        'cookbook': `<i class="fa-solid fa-book-open px-2 md:text-3xl"></i>`,
        'instagram': `<i class="fa-brands fa-instagram px-2 md:text-3xl"></i>`,
        'youtube': `<i class="fa-brands fa-youtube px-2 md:text-3xl"></i>`,
        'default': `<i class="fa-solid fa-link px-2 md:text-3xl"></i>`
    };
    const key = source.toLowerCase();
    return icons[key] || icons.default;
}


/**
 * Generates the HTML for the recipe source (avatar or icon).
 * @param {object} recipe - The recipe data object.
 * @param {object} theme - The color scheme.
 * @returns {string} - The HTML for the source display.
*/
function getSourceDisplayHTML(recipe, theme) {
    if (recipe.source) {
        if (recipe.source === 'family' && recipe.sourceText) {
            const source = recipe.sourceText;
            return `
                <a href="category.html?source=${encodeURIComponent(source)}" class="flex flex-col items-center group">
                    <img src="./assets/sources/${source}.jpeg"
                         alt="${source}" 
                         class="w-32 h-32 rounded-full mb-4 object-cover border-2 transition-colors"
                         onerror="this.onerror=null;this.src='https://placehold.co/128x128/ccc/fff?text=?';">
                    <span class="md:text-3xl font-bold ${theme.titleClass} mt-1">
                        ${source}
                        ${recipe.sourceLink ? `
                        <a href=${recipe.sourceLink} target="_blank" rel="noopener noreferrer" class="meta-item">
                            <i class="fa-solid fa-up-right-from-square text-sm text-stone-500"></i>
                        </a>`: ''}
                    </span>
                </a>
            `;
        } else {
            const source = recipe.source;
            const icon = getSourceIcon(source);
            return `
                <a href="category.html?source=${encodeURIComponent(source)}" class="flex flex-col items-center group">
                    <div class="w-10 h-10 flex items-center justify-center ${theme.titleClass}">
                        ${icon}
                    </div>
                    <p class="md:text-3xl font-bold ${theme.titleClass}">${recipe.sourceText} 
                        ${recipe.sourceLink ? `
                        <a href=${recipe.sourceLink} target="_blank" rel="noopener noreferrer" class="meta-item">
                            <i class="fa-solid fa-up-right-from-square text-sm text-stone-500"></i>
                        </a>`: ''}
                    </p>
                    ${recipe.sourceSubtext ? `<p class="md:text-sm font-bold">${recipe.sourceSubtext}</p>` : ''}
                </a>
            `;
        }
    }
    return `
        <div class="flex flex-col items-center text-stone-400">
            <div class="w-10 h-10 flex items-center justify-center">
                ${getSourceIcon('default')}
            </div>
            <span class="text-xs mt-1">N/A</span>
        </div>
    `;
}

/**
 * Creates and injects the HTML for the found recipe.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 * @param {object} recipe - The recipe data object.
 */
function renderRecipe(categoryKey, recipe) {
    const container = document.getElementById('recipe-container');
    const theme = findCategoryTheme(categoryKey);

    let sourceIconClass = 'fa-solid fa-link'; // Default icon
    switch (`${recipe.source}`) {
        case 'youtube':
            sourceIconClass = 'fa-brands fa-youtube';
            break;
        case 'instagram':
            sourceIconClass = 'fa-brands fa-instagram';
            break;
        case 'cookbook':
            sourceIconClass = 'fa-solid fa-book-open';
            break;
        case 'family':
            sourceIconClass = 'fa-solid fa-users';
            break;
        default:
            sourceIconClass = 'fa-solid fa-link';
    }

    // Generate list items for ingredients and instructions
    const ingredientsHTML = recipe.ingredients.map(ing => `<li class="border-b py-2">${ing}</li>`).join('');
    const instructionsHTML = recipe.instructions.map(step => `<li>${step}</li>`).join('');
    const preparationHTML = recipe.preparation.map(step => `<li>${step}</li>`).join('');
    const sourceHTML = getSourceDisplayHTML(recipe, theme);

    const recipeHTML = `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">                    
            <div class="p-6 md:p-10">
                <h1 id="recipe-title" class="text-4xl md:text-5xl font-bold text-center ${theme.titleClass}">${recipe.name}</h1>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 border-b-4">
                    <div class="md:col-span-1 mb-2">
                        <img src="${recipe.imageUrl}" alt="${recipe.name}" class="w-full h-64 md:h-96 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/800x600/ccc/fff?text=Image+Error';">
                    </div>
                    <div class="md:col-span-2 mb-2 grid content-around">
                        <p class="mt-4 text-lg text-stone-600">${recipe.description}</p>
                        <div class="flex flex-wrap items-center grid justify-items-stretch mt-6 text-stone-500 border-y py-4 md:grid-cols-3">
                            <div class="text-center px-4 mb-2 md:mb-0 md:col-span-1 sm:col-span-1">
                                <i class="fa-solid fa-utensils"></i>
                                <span class="font-bold text-lg text-stone-700 block">Prep Time</span>
                                <span id="prep-time">${recipe.prepTime}</span>
                            </div>
                            <div class="text-center px-4 mb-2 md:mb-0 border-x md:col-span-1 sm:col-span-1">
                                <i class="fa-regular fa-clock"></i>
                                <span class="font-bold text-lg text-stone-700 block">Cook Time</span>
                                <span id="cook-time">${recipe.cookTime}</span>
                            </div>
                            <div class="text-center px-4 mb-2 md:mb-0 md:col-span-1 sm:col-span-1">
                                <i class="fa-solid fa-bowl-food"></i>
                                <span class="font-bold text-lg text-stone-700 block">Servings</span>
                                <span id="servings">${recipe.servings}</span>
                            </div>
                        </div>
                        <div class="text-center px-4 py-2 w-full md:w-auto mt-2 md:mt-0">
                            ${sourceHTML}
                        </div>
                        <!-- <div class="content-center text-center px-4 mt-4 mb-4">
                            <i class="${sourceIconClass} ${theme.titleClass} px-2 md:text-3xl"></i>
                            <p class="md:text-3xl font-bold ${theme.titleClass}">${recipe.sourceText} 
                                ${recipe.sourceLink ? `
                                <a href=${recipe.sourceLink} target="_blank" rel="noopener noreferrer" class="meta-item">
                                    <i class="fa-solid fa-up-right-from-square text-sm text-stone-500"></i>
                                </a>`: ''}
                            </p>
                            ${recipe.sourceSubtext ? `<p class="md:text-sm font-bold">${recipe.sourceSubtext}</p>` : ''}
                        </div> -->
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 mb-8 border-b-4">
                    <div class="md:col-span-1">
                        <h2 id="ingredient-title" class="text-3xl font-bold mb-4 ${theme.titleClass}">Ingredients</h2>
                        <ul id="recipe-ingredients" class="space-y-2 list-none">
                            ${ingredientsHTML}
                        </ul>
                    </div>
                    <div class="md:col-span-2 content-stretch">
                        <h2 id="instruction-title" class="text-3xl font-bold mb-4 ${theme.titleClass}">Preparation</h2>
                        <ol id="recipe-instructions" class="list-none mb-8 border-b-2" style="counter-reset: step-counter;">
                            ${preparationHTML}
                        </ol>

                        <h2 id="instruction-title" class="text-3xl font-bold mb-4 ${theme.titleClass}">Instructions</h2>
                        <ol id="recipe-instructions" class="list-none" style="counter-reset: step-counter;">
                            ${instructionsHTML}
                        </ol>
                    </div>
                </div>

                ${recipe.notes ? `
                <div class="gap-8 mt-8 mb-8">
                    <h2 class="text-3xl font-bold mb-4 ${theme.titleClass}">Notes</h2>
                    <div class="notes-content">${recipe.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    container.innerHTML = recipeHTML;
    container.style.setProperty('--counter-text-color', theme.counterTextClass);
    container.style.setProperty('--counter-bg-color', theme.counterBgClass);
    document.title = `${recipe.name} - Plated Memories`;
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryKey = urlParams.get('category');
    const recipeId = urlParams.get('id');

    if (recipeId) {
        getById(categoryKey, recipeId);
    } else {
        document.getElementById('recipe-not-found').classList.remove('hidden');
    }
});