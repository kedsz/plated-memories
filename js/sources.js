import { loadComponents } from './main.js'
import { updateHeader } from './category.js'

/**
 * Finds all unique sources from the recipe data.
 * @param {object} data - The JSON data object.
 */
function getAllUniqueSources(data) {
    const allRecipes = Object.values(data).flatMap(category => category.recipes);
    const allSources = allRecipes.map(recipe => {
        if (recipe.source === 'family' && recipe.sourceText) {
            return recipe.sourceText;
        }
        if (recipe.source === 'cookbook' && recipe.sourceText) {
            return recipe.sourceText.split(" - ")[1];
        }
        return recipe.source;
    });
    return [...new Set(allSources)].sort();
}

/**
 * Renders the list of sources.
 */
function renderSourcesList() {
    const listContainer = document.getElementById('sources-list');
    fetch('./recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadComponents(data, 'sources');
            const uniqueSources = getAllUniqueSources(data);
            if (uniqueSources.length > 0) {
                updateHeader({"title": "Sources"}, 'sources');
                const listHTML = uniqueSources.map(source => `
                    <a href="category.html?source=${encodeURIComponent(source)}" class="flex flex-col items-center text-center p-6 rounded-lg hover:shadow-lg hover:bg-orange-50 transition-all duration-300">
                        <img src="./assets/sources/${source}.jpeg" 
                             alt="${source}"
                             class="w-48 h-48 rounded-full mb-4 object-cover border-2 border-orange-100"
                             onerror="this.onerror=null;this.src='https://placehold.co/128x128/ccc/fff?text=?';">
                        <span class="text-xl font-semibold text-amber-700">${source}</span>
                    </a>
                `).join('');
                listContainer.innerHTML = listHTML;
            } else {
                listContainer.innerHTML = `<p class="text-center text-stone-500">No sources found.</p>`;
            }
        })
        .catch(error => {
            console.error('Error loading or parsing JSON:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    renderSourcesList();
});