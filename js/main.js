import { DotLottie } from "https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm";

/**
 * Creates the HTML for a single recipe card.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 * @param {object} recipe - The recipe data object.
 * @param {string} divClass - The style classes to be applied to the recipe card.
 * @returns {string} - The HTML string for the recipe card.
 */
export function createRecipeCard(categoryKey, recipe, divClass) {
    return `
        <div class="${divClass}">
            <a href="recipe.html?category=${categoryKey}&id=${recipe.id}" class="block bg-white rounded-lg shadow-md overflow-hidden transform hover:-translate-y-1 transition-transform duration-300 h-full">
                <img src="${recipe.imageUrl}" alt="${recipe.name}" class="w-full h-80 object-cover" onerror="this.onerror=null;this.src='https://placehold.co/400x300/ccc/fff?text=Image+Error';">
                <div class="p-4">
                    <h4 class="font-semibold text-lg truncate">${recipe.name}</h4>
                </div>
            </a>
        </div>
    `;
}

/**
* Creates a smaller card for search results.
* @param {object} recipe - The recipe data object.
*/
function createSearchResultCard(recipe) {
    return `
        <a href="recipe.html?category=${recipe.category}&id=${recipe.id}" class="flex items-center bg-white p-3 rounded-lg shadow-sm hover:shadow-md hover:bg-stone-50 transition-all duration-200">
            <img src="${recipe.imageUrl}" alt="${recipe.name}" class="w-16 h-16 object-cover rounded-md mr-4" onerror="this.onerror=null;this.src='https://placehold.co/100x100/ccc/fff?text=Err';">
            <span class="font-semibold text-stone-700">${recipe.name}</span>
        </a>
    `;
}

/**
 * Sets up the event listeners and logic for a carousel.
 * @param {string} categoryKey - The key for the category.
 */
function setupCarousel(categoryKey) {
    const container = document.getElementById(`container-${categoryKey}`);
    const leftBtn = document.getElementById(`scroll-left-${categoryKey}`);
    const rightBtn = document.getElementById(`scroll-right-${categoryKey}`);

    if (!container || !leftBtn || !rightBtn) return;

    const scrollAmount = container.querySelector('div').offsetWidth + 24; // Card width + margin

    function updateButtonState() {
        // Use a small tolerance for floating point issues
        const tolerance = 1;
        leftBtn.disabled = container.scrollLeft <= tolerance;
        rightBtn.disabled = container.scrollLeft >= container.scrollWidth - container.clientWidth - tolerance;
    }

    leftBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Update buttons on scroll and on initial load
    container.addEventListener('scroll', updateButtonState);
    // Use setTimeout to ensure the layout is fully calculated
    setTimeout(updateButtonState, 100);
}

/**
 * Creates and injects a full category section into the DOM.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 * @param {object} categoryData - The category data object.
 * @param {HTMLElement} container - The parent element to append to.
 */
function createCategorySection(categoryKey, categoryData, container) {
    const section = document.createElement('section');
    section.id = categoryKey;
    section.className = "mb-16 pt-4 -mt-4";

    // Sort recipes alphabetically by name before creating the cards
    const sortedRecipes = [...categoryData.recipes].sort((a, b) => a.name.localeCompare(b.name));
    // const recipeCardsHTML = sortedRecipes.map(createRecipeCard).join('');
    let recipeCardsHTML = '';
    sortedRecipes.forEach(function (recipe) {
        recipeCardsHTML += createRecipeCard(categoryKey, recipe, "flex-shrink-0 w-64 md:w-72 mr-6 snap-start");
    });

    section.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-5xl font-bold text-stone-700 logo-font">${categoryData.title}</h2>
            <a href="category.html?category=${categoryKey}" class="text-lg font-medium text-amber-600 hover:text-amber-700 transition-colors"> <!-- ${categoryKey}/${categoryKey}.html -->
                See All &rarr;
            </a>
        </div>
        <div class="relative group">
            <!-- Recipe Card Container -->
            <div id="container-${categoryKey}" class="flex overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory scroll-smooth">
                ${recipeCardsHTML}
            </div>

            <!-- Scroll Buttons (visible on desktop hover) -->
            <button id="scroll-left-${categoryKey}" class="scroll-btn left-0 absolute top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 text-stone-800 shadow-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <button id="scroll-right-${categoryKey}" class="scroll-btn right-0 absolute top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full p-2 text-stone-800 shadow-md transition-opacity duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:cursor-not-allowed hidden md:block">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
        </div>
    `;

    container.appendChild(section);
    setupCarousel(categoryKey);
}

/**
 * Sets up the search bar drawer.
 * @param {object} data - The category data object.
 */
function setupSearch(data) {
    const searchDrawer = document.getElementById('search-drawer');
    const searchInput = document.getElementById('search-input');
    const searchResultsContainer = document.getElementById('search-results');
    const desktopSearchButton = document.getElementById('desktop-search-button');
    const mobileSearchButton = document.getElementById('mobile-search-button');
    const allRecipes = Object.entries(data).flatMap(([categoryKey, categoryData]) =>
        categoryData.recipes.map(recipe => ({
            ...recipe,
            category: categoryKey
        }))
    );

    const toggleSearch = () => {
        const isOpen = !searchDrawer.classList.contains('-translate-y-[150%]');
        if (isOpen) {
            searchDrawer.classList.add('-translate-y-[150%]');
        } else {
            searchDrawer.classList.remove('-translate-y-[150%]');
            searchInput.focus();
        }
    };

    desktopSearchButton.addEventListener('click', toggleSearch);
    mobileSearchButton.addEventListener('click', toggleSearch);

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();

        if (searchTerm.length < 2) {
            searchResultsContainer.innerHTML = '';
            return;
        }

        const results = allRecipes.filter(recipe => {
            const nameMatch = recipe.name.toLowerCase().includes(searchTerm);
            const tagMatch = recipe.tags.some(tag => tag.toLowerCase().includes(searchTerm));
            return nameMatch || tagMatch;
        });

        if (results.length > 0) {
            const resultsHTML = results.map(createSearchResultCard).join('');
            searchResultsContainer.innerHTML = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${resultsHTML}</div>`;
        } else {
            searchResultsContainer.innerHTML = `<p class="text-center text-stone-500 py-4">No recipes found for "${e.target.value}".</p>`;
        }
    });
}

/**
 * Populates the navigation bars and sets up mobile menu toggle.
 * @param {object} data - The category data object.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 */
export function setupNavbar(data, categoryKey) {
    const homeButton = document.getElementById('home');
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.getElementById('mobile-menu').querySelector('ul');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');

    homeButton.href = categoryKey ? './index.html' : '#';
    let navLinksHTML = '';
    for (const [key, value] of Object.entries(data)) {
        let ref = categoryKey ? './category.html?category=' + key : '#' + key;
        navLinksHTML += `
            <li>
                <a href="${ref}" class="nav-link block py-2 px-4 text-stone-600 hover:text-amber-700 font-serif text-xl transition-colors">${value.title}</a>
            </li>
        `;
    }
    // Prepend links to desktop nav so search icon stays last
    desktopNav.insertAdjacentHTML('afterbegin', navLinksHTML);
    // Append links to mobile nav so search button is last
    mobileNav.insertAdjacentHTML('afterbegin', navLinksHTML);

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close mobile menu when a link is clicked
    mobileNav.querySelectorAll('a, button').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
    setupSearch(data);
}

/**
* Sets up IntersectionObserver to highlight nav link on scroll.
*/
function setupScrollSpy() {
    const sections = document.querySelectorAll('main section[id]');
    const observerOptions = {
        root: null, // relative to the viewport
        rootMargin: '-20% 0px -75% 0px', // Defines a horizontal "activation zone" at the top of the viewport
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                // Remove active class from all nav links
                document.querySelectorAll('nav .nav-link').forEach(link => {
                    link.classList.remove('active-nav-link');
                });
                // Add active class to the current section's links
                document.querySelectorAll(`nav a[href="#${id}"]`).forEach(link => {
                    link.classList.add('active-nav-link');
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });
}

/**
 * Populates the navigation bars and sets up mobile menu toggle.
 * @param {object} data - The category data object.
 * @param {string} categoryKey - The key for the category in recipeData (e.g., 'appetizers').
 */
export function loadComponents(recipeData, categoryKey) {
    fetch('./components/search-drawer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('search-drawer-placeholder').innerHTML = data;
        });
    fetch('./components/navigation-bar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-placeholder').innerHTML = data;
            setupNavbar(recipeData, categoryKey);
        });
    fetch('./components/page-footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-placeholder').innerHTML = data;
        });
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById("mealCanvas");

    if (canvas) {
        new DotLottie({
            autoplay: true,
            loop: true,
            canvas: document.getElementById("mealCanvas"),
            src: "https://lottie.host/174074a9-bde8-48f2-84e9-adf7167616b2/6hOicvWZ4O.lottie"
        });
    }

    const mainContainer = document.getElementById('recipe-collections');
    if (mainContainer) {
        fetch('./recipes.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                loadComponents(data);
                for (const [key, value] of Object.entries(data)) {
                    createCategorySection(key, value, mainContainer);
                }
                setupScrollSpy();
            })
            .catch(error => {
                console.error('Error loading or parsing JSON:', error);
            });
    }
});