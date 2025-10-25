import { loadComponents } from './main.js'
import { createRecipeCard } from './main.js'

/**
 * Determines the color scheme for a page.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 * @returns {object} - The theme object with color codes for various elements of the page.
 */
export function findCategoryTheme(categoryKey) {
    const theme = {
        "headerClass": "",
        "titleClass": "",
        "counterTextClass": "",
        "counterBgClass": ""
    };
    switch (categoryKey) {
        case 'appetizers':
            theme.headerClass = ' bg-violet-200';
            theme.titleClass = ' text-purple-700';
            theme.counterBgClass = '#f5f3ff'; // violet-50
            theme.counterTextClass = '#8200db'; // purple-700
            break;
        case 'mains':
            theme.headerClass = ' bg-green-200';
            theme.titleClass = ' text-emerald-700';
            theme.counterBgClass = '#f0fdf4'; // green-50
            theme.counterTextClass = '#007a55'; // emerald-700
            break;
        case 'desserts':
            theme.headerClass = ' bg-amber-200';
            theme.titleClass = ' text-yellow-700';
            theme.counterBgClass = '#fffbeb'; // amber-50
            theme.counterTextClass = '#a65f00'; // yellow-700
            break;
        case 'sides':
            theme.headerClass = ' bg-blue-200';
            theme.titleClass = ' text-indigo-700';
            theme.counterBgClass = '#eff6ff'; // blue-50
            theme.counterTextClass = '#432dd7'; // indigo-700
            break;
        case 'basics':
            theme.headerClass = ' bg-pink-200';
            theme.titleClass = ' text-rose-700';
            theme.counterBgClass = '#fdf2f8'; // pink-50
            theme.counterTextClass = '#c70036'; // rose-700
            break;
        default:
            theme.headerClass = ' bg-orange-200';
            theme.titleClass = ' text-amber-700';
            theme.counterBgClass = '#fff7ed'; // orange-50
            theme.counterTextClass = '#bb4d00'; // amber-700
            break;
    }
    return theme;
}

/**
 * Updates the header, title and theme of the category page.
 * @param {object} category - The category data object.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 */
export function updateHeader(category, categoryKey) {
    const headerElement = document.getElementById('category-header');
    const titleElement = document.getElementById('category-title');
    const theme = findCategoryTheme(categoryKey);

    document.title = `${category.title} - Plated Memories`;
    titleElement.textContent = category.title;
    headerElement.classList.value += theme.headerClass;
    titleElement.classList.value += theme.titleClass;
}

/**
 * Creates and injects all recipes for a category into the DOM.
 */
function renderCategoryPage() {
    const gridContainer = document.getElementById('recipe-grid');

    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryKey = urlParams.get('category');

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

                // Sort and render recipe cards
                const sortedRecipes = [...category.recipes].sort((a, b) => a.name.localeCompare(b.name));
                let recipeCardsHTML = '';
                sortedRecipes.forEach(function (recipe) {
                    recipeCardsHTML += createRecipeCard(categoryKey, recipe, "w-full");
                });

                gridContainer.innerHTML = recipeCardsHTML;
            } else {
                // Handle case where category is not found
                titleElement.textContent = "Category Not Found";
                document.getElementById('category-description').textContent = "Sorry, we couldn't find the recipes you were looking for.";
            }
        })
        .catch(error => {
            console.error('Error loading or parsing JSON:', error);
        });

}

document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('category-collection');
    if (mainContainer) {
        renderCategoryPage();
    }
});