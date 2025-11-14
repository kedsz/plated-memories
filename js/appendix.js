import { loadComponents } from './main.js'
import { updateHeader } from './category.js'

/**
 * Builds a data structure mapping tags to recipes.
 * @param {object} data - The JSON data object.
 */
function mapTagsToRecipes(data) {
    // const allRecipes = Object.values(data).flatMap(category => category.recipes);
    const allRecipes = Object.entries(data).flatMap(([categoryKey, categoryData]) =>
        categoryData.recipes.map(recipe => ({
            ...recipe,
            category: categoryKey
        }))
    );

    const tagMap = new Map();

    for (const recipe of allRecipes) {
        if (recipe.tags && Array.isArray(recipe.tags)) {
            for (const tag of recipe.tags) {
                const normalizedTag = tag.toLowerCase();
                if (!tagMap.has(normalizedTag)) {
                    tagMap.set(normalizedTag, []);
                }
                tagMap.get(normalizedTag).push(recipe);
            }
        }
    }
    return tagMap;
}

/**
 * Renders the appendix list in the DOM.
 */
function renderAppendix() {
    const listContainer = document.getElementById('appendix-list');

    fetch('./recipes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadComponents(data, 'index');
            updateHeader({ "title": "Index" }, 'index');
            const tagMap = mapTagsToRecipes(data);
            // Get sorted list of tags
            const sortedTags = [...tagMap.keys()].sort();

            if (sortedTags.length === 0) {
                listContainer.innerHTML = `<p class="text-center text-stone-500">No tags found.</p>`;
                return;
            }

            let html = '';
            for (const tag of sortedTags) {
                // Get and sort recipes for this tag
                const recipes = tagMap.get(tag).sort((a, b) => a.name.localeCompare(b.name));

                const recipeLinks = recipes.map(recipe =>
                    `<li class="mb-1">
                        <a href="recipe.html?category=${recipe.category}&id=${recipe.id}" class="text-amber-600 hover:text-amber-700 hover:underline transition-colors">${recipe.name}</a>
                    </li>`
                ).join('');

                // Capitalize tag for display
                const displayTag = tag.charAt(0).toUpperCase() + tag.slice(1);

                html += `
                    <section id="tag-${tag}" class="mb-8 tag-heading">
                        <h2 class="text-3xl font-bold text-stone-700 mb-4 capitalize">${displayTag}</h2>
                        <ul class="list-none ml-4 space-y-2">
                            ${recipeLinks}
                        </ul>
                    </section>
                `;
            }

            listContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading or parsing JSON:', error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    renderAppendix();
});
