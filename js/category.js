import { loadComponents } from './main.js'
// import { setupNavbar } from './main.js'
import { createRecipeCard } from './main.js'

// function createCategorySection(categoryKey, categoryData, container) {
//     const section = document.createElement('section');
//     section.id = categoryKey;
//     section.className = "mb-16 pt-4 -mt-4";

//     // Sort recipes alphabetically by name before creating the cards
//     const sortedRecipes = [...categoryData.recipes].sort((a, b) => a.name.localeCompare(b.name));
//     const recipeCardsHTML = sortedRecipes.map(createRecipeCard).join('');

//     section.innerHTML = `
//         <div class="relative group">
//             <!-- Recipe Card Container -->
//             <div id="container-${categoryKey}" class="flex overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
//                 ${recipeCardsHTML}
//             </div>
//         </div>
//     `;

//     container.appendChild(section);
// }

// function createRecipeCard(recipe) {
//     // Note: Removed horizontal scroll-specific classes like "flex-shrink-0" and "mr-6"
//     return `
//                 <div class="w-full">
//                     <a href="/recipe.html?id=${recipe.id}" class="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 h-full">
//                         <img src="${recipe.imageUrl}" alt="${recipe.name}" class="w-full h-80 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x300/ccc/fff?text=Image+Error';">
//                         <div class="p-4">
//                             <h3 class="font-semibold text-lg truncate">${recipe.name}</h3>
//                         </div>
//                     </a>
//                 </div>
//             `;
// }

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

export function updateHeader(category, categoryKey) {
    const headerElement = document.getElementById('category-header');
    const titleElement = document.getElementById('category-title');
    const theme = findCategoryTheme(categoryKey);

    document.title = `${category.title} - Plated Memories`;
    titleElement.textContent = category.title;
    headerElement.classList.value += theme.headerClass;
    titleElement.classList.value += theme.titleClass;
}

function renderCategoryPage() {
    const gridContainer = document.getElementById('recipe-grid');

    // Get category from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    // const pathParam = window.location.pathname.substring(17);
    const categoryKey = urlParams.get('category');
    // const categoryKey = pathParam.substring(0, pathParam.indexOf('/'));

    fetch('./recipes.json') //.././recipes.json
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            loadComponents(data, categoryKey);
            // setupNavbar(data, categoryKey);
            if (categoryKey && data[categoryKey]) {
                const category = data[categoryKey];
                updateHeader(category, categoryKey);

                // Sort and render recipe cards
                const sortedRecipes = [...category.recipes].sort((a, b) => a.name.localeCompare(b.name));
                // const recipeCardsHTML = sortedRecipes.map(createRecipeCard).join('');
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