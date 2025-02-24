// js/spatial-hub.js

document.addEventListener('DOMContentLoaded', () => {
    const spatialHubSection = document.getElementById('spatial-hub');
    const hubContainer = document.querySelector('.hub-container');
    const categorySpaceSection = document.getElementById('category-space');
    const categorySpaceTitle = document.getElementById('category-space-title');
    const categoryProductGrid = document.getElementById('category-product-grid');
    const backToHubBtn = categorySpaceSection.querySelector('.back-to-hub-btn');

    // --- Function to fetch categories data from JSON (same as before) ---
    async function fetchCategoriesData() {
        try {
            const response = await fetch('assets/data/categories-data.json');
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

    // --- Function to fetch products data from JSON (same as before) ---
    async function fetchProductsData() {
        try {
            const response = await fetch('assets/data/products-data.json');
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

    // --- Function to generate product list HTML (same as before) ---
    function generateProductList(products) {
        if (!products || products.length === 0) {
            return '<p>No products found in this category.</p>';
        }

        const placeholderImage = 'assets/images/product_placeholder.png';
        let listHTML = '';
        products.forEach(product => {
            const productMainImage = product.images && product.images[0] ? product.images[0] : placeholderImage;

            listHTML += `
                <div class="product-card">
                    <div class="product-card-image-container">
                        <img src="${productMainImage}" alt="${product.name}" onerror="this.src='${placeholderImage}'">
                        <div class="product-card-overlay"></div>
                    </div>
                    <div class="product-card-title-strip">
                        <h3>${product.name}</h3>
                    </div>
                    <div class="product-card-info-panel">
                        <p class="product-description">${product.description}</p>
                        <p class="product-price">$${product.price.toFixed(2)}</p>
                        <button class="quantum-btn small-btn">View Product</button>
                    </div>
                </div>
            `;
        });
        return listHTML;
    }

    // --- Function to generate category nodes HTML dynamically (UPDATED for product glimpse) ---
    async function generateCategoryNodes(categories) {
        if (!categories || categories.length === 0) {
            return '<p>No categories available.</p>';
        }

        let nodesHTML = '';
        const placeholderImage = 'assets/images/category-placeholder.png'; // Placeholder for category images
        const productPlaceholderImage = 'assets/images/product_placeholder_thumbnail.png'; // Placeholder for product thumbnails

        const allProductsData = await fetchProductsData(); // Fetch all products once

        for (const category of categories) { // Using a for...of loop to use await inside

            // Get a few product thumbnails for the glimpse (max 3)
            let productGlimpseHTML = '';
            if (allProductsData) {
                const categoryProducts = allProductsData.filter(product => product.category === category.category);
                const glimpseProducts = categoryProducts.slice(0, 3); // Get first 3 products

                if (glimpseProducts.length > 0) {
                    glimpseProducts.forEach(product => {
                        const productThumbImage = product.images && product.images[0] ? product.images[0] : productPlaceholderImage;
                        productGlimpseHTML += `<img src="${productThumbImage}" alt="${product.name}" onerror="this.src='${productPlaceholderImage}'">`;
                    });
                } else {
                    productGlimpseHTML = '<p>No products</p>'; // Or use a placeholder icon if you prefer
                }
            } else {
                productGlimpseHTML = '<p>Error loading products</p>';
            }


            // Use the first subcategory image as the category node background, or a placeholder if none
            const categoryImage = category.subcategories && category.subcategories[0] && category.subcategories[0].image ? category.subcategories[0].image : placeholderImage;


            nodesHTML += `
                <div class="category-node" data-category="${category.category}">
                    <div class="node-content">
                        <h3>${category.category}</h3>
                        <div class="product-glimpse" style="background-image: url('${categoryImage}')">
                            ${productGlimpseHTML}  <!-- Insert product thumbnails here -->
                        </div>
                    </div>
                </div>
            `;
        }
        return nodesHTML;
    }

    // --- Load and display category nodes on initial load ---
    async function displayCategoryNodes() {
        const categoriesData = await fetchCategoriesData();
        if (categoriesData) {
            const categoryNodesHTML = await generateCategoryNodes(categoriesData); // Await here because generateCategoryNodes is now async
            hubContainer.innerHTML = categoryNodesHTML;
            attachCategoryNodeEventListeners();
        } else {
            hubContainer.innerHTML = '<p>Failed to load category data.</p>';
        }
    }

    // --- Function to attach event listeners to category nodes (no changes) ---
    function attachCategoryNodeEventListeners() {
        const categoryNodes = document.querySelectorAll('.category-node');
        categoryNodes.forEach(node => {
            node.addEventListener('click', async () => {
                const categoryName = node.dataset.category;
                spatialHubSection.style.display = 'none';
                categorySpaceSection.style.display = 'block';
                categorySpaceTitle.textContent = categoryName;
                const productsData = await fetchProductsData();
                if (productsData) {
                    const filteredProducts = productsData.filter(product => product.category === categoryName);
                    const productListHTML = generateProductList(filteredProducts);
                    categoryProductGrid.innerHTML = productListHTML;
                } else {
                    categoryProductGrid.innerHTML = '<p>Failed to load products.</p>';
                }
            });
        });
    }

    displayCategoryNodes();
});