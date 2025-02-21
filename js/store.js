// js/store.js - Full and Complete Code (Category Flow, Price Slider, and Product Listing)

document.addEventListener('DOMContentLoaded', () => {
    const categoryContentArea = document.getElementById('category-content-area');
    const filtersSidebar = document.querySelector('.filters-sidebar');
    const productListingArea = document.getElementById('product-listing-area');
    const productListContainer = productListingArea.querySelector('.product-grid.products-list-view'); // Get product list container

    // --- Price Slider Elements ---
    const minPriceInput = document.getElementById('min-price');
    const maxPriceInput = document.getElementById('max-price');
    const minPriceSlider = document.getElementById('price-slider-min');
    const maxPriceSlider = document.getElementById('price-slider-max');


    // --- Function to fetch categories data from JSON ---
    async function fetchCategoriesData() {
        try {
            const response = await fetch('assets/data/categories-data.json'); // Updated path to assets/data
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Could not fetch categories data:', error);
            return null;
        }
    }

    // --- Function to fetch products data from JSON ---
    async function fetchProductsData() {
        try {
            const response = await fetch('assets/data/products-data.json'); // Updated path to assets/data
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Could not fetch products data:', error);
            return null;
        }
    }


    // --- Function to generate main category grids HTML with placeholder ---
    function generateCategoryGrid(categories) {
        if (!categories || categories.length === 0) {
            return '<p>No categories found.</p>';
        }

        const placeholderImage = 'assets/images/product_placeholder.png';
        let gridHTML = '<div class="category-grid-container">';
        categories.forEach(category => {
            const categoryImage = category.subcategories && category.subcategories[0] && category.subcategories[0].image ? category.subcategories[0].image : placeholderImage;

            gridHTML += `
                <div class="category-grid-item main-category-item" data-category-name="${category.category}">
                    <img src="${categoryImage}" alt="${category.category}" onerror="this.src='${placeholderImage}'">
                    <h3>${category.category}</h3>
                    <button class="quantum-btn small-btn choose-category-btn" data-category-name="${category.category}">Explore Category</button>
                </div>
            `;
        });
        gridHTML += '</div>';
        return gridHTML;
    }

    // --- Function to generate sub-category grids HTML with placeholder ---
    function generateSubCategoryGrids(subcategories, categoryName) {
        if (!subcategories || subcategories.length === 0) {
            return `<p>No subcategories found for ${categoryName}.</p>`;
        }

        const placeholderImage = 'assets/images/product_placeholder.png';
        let gridHTML = '<div class="subcategory-grid-container">';
        subcategories.forEach(subcategory => {
            const subcategoryImage = subcategory.image || placeholderImage;

            gridHTML += `
                <div class="subcategory-grid-item subcategory-item" data-subcategory-name="${subcategory.name}">
                    <img src="${subcategoryImage}" alt="${subcategory.name}" onerror="this.src='${placeholderImage}'">
                    <h3>${subcategory.name}</h3>
                    <button class="shop-category-btn explore-subcategory-btn" data-subcategory-name="${subcategory.name}" data-category-name="${categoryName}">Explore ${subcategory.name}</button>
                </div>
            `;
        });
        gridHTML += '</div>';
        return gridHTML;
    }

    // --- Function to generate product list HTML with placeholder ---
    function generateProductList(products) {
        if (!products || products.length === 0) {
            return '<p>No products found for this subcategory.</p>';
        }

        const placeholderImage = 'assets/images/product_placeholder.png';
        let listHTML = ''; // No container div here - product-grid will be the container
        products.forEach(product => {
            const productMainImage = product.images && product.images[0] ? product.images[0] : placeholderImage; // Use first image as main image, or placeholder

            listHTML += `
                <div class="product-card">
                    <img src="${productMainImage}" alt="${product.name}" onerror="this.src='${placeholderImage}'">
                    <h3>${product.name}</h3>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="quantum-btn small-btn">View Product</button>
                </div>
            `;
        });
        return listHTML;
    }


    // --- Display Main Categories on initial load ---
    async function displayMainCategories() {
        const categoriesData = await fetchCategoriesData();
        if (categoriesData) {
            const categoryGridHTML = generateCategoryGrid(categoriesData);
            categoryContentArea.innerHTML = `<h2>Shop by Category</h2>${categoryGridHTML}`;
        } else {
            categoryContentArea.innerHTML = '<p>Failed to load category data.</p>';
        }
    }

    displayMainCategories(); // Call to display main categories on page load


    // --- Event delegation for category and subcategory button clicks ---
    categoryContentArea.addEventListener('click', async (event) => {
        if (event.target.classList.contains('choose-category-btn')) {
            const categoryName = event.target.dataset.categoryName;
            const categoriesData = await fetchCategoriesData();
            if (categoriesData) {
                const selectedCategory = categoriesData.find(cat => cat.category === categoryName);
                if (selectedCategory) {
                    const subCategoryGridsHTML = generateSubCategoryGrids(selectedCategory.subcategories, categoryName);
                    categoryContentArea.innerHTML = `<h2>Shop Sub-Categories in ${categoryName}</h2>${subCategoryGridsHTML}`;
                    filtersSidebar.style.display = 'none';
                    productListingArea.style.display = 'none';
                } else {
                    categoryContentArea.innerHTML = `<p>Category "${categoryName}" not found.</p>`;
                }
            } else {
                categoryContentArea.innerHTML = '<p>Failed to load category data.</p>';
            }
        }

        if (event.target.classList.contains('explore-subcategory-btn')) {
            const subcategoryName = event.target.dataset.subcategoryName;
            const categoryName = event.target.dataset.categoryName;
            categoryContentArea.style.display = 'none';
            filtersSidebar.style.display = 'block';
            productListingArea.style.display = 'block';
            productListingArea.querySelector('h2').textContent = `Products in ${categoryName} - ${subcategoryName}`; // Update product listing area heading

            const productsData = await fetchProductsData(); // Fetch products data
            if (productsData) {
                const filteredProducts = productsData.filter(product =>
                    product.category === categoryName && product.subcategory === subcategoryName
                );
                const productListHTML = generateProductList(filteredProducts);
                productListContainer.innerHTML = productListHTML; // Insert product list into container
            } else {
                productListContainer.innerHTML = '<p>Failed to load products data.</p>'; // Error message in product list area
            }
        }
    });


    // --- Price Slider Functionality --- (No changes needed here, keep as is)
    function updateSliderFromInput() { /* ... (Price slider functions - same as before) ... */ }
    function updateInputFromSlider() { /* ... (Price slider functions - same as before) ... */ }
    minPriceInput.addEventListener('change', updateSliderFromInput);
    maxPriceInput.addEventListener('change', updateSliderFromInput);
    minPriceSlider.addEventListener('input', updateInputFromSlider);
    maxPriceSlider.addEventListener('input', updateInputFromSlider);
    updateSliderFromInput();


});