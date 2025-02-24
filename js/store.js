// js/spatial-hub.js

document.addEventListener('DOMContentLoaded', () => {
    const spatialHubSection = document.getElementById('spatial-hub');
    const categorySpaceSection = document.getElementById('category-space');
    const categoryNodes = document.querySelectorAll('.category-node');
    const categorySpaceTitle = document.getElementById('category-space-title');
    const categoryProductGrid = document.getElementById('category-product-grid');
    const backToHubBtn = categorySpaceSection.querySelector('.back-to-hub-btn');

    // --- Function to fetch products data from JSON (same as in store.js for now) ---
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

    // --- Function to generate product list HTML (same as in store.js for now) ---
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

    // --- Event listener for category node clicks ---
    categoryNodes.forEach(node => {
        node.addEventListener('click', async () => {
            const categoryName = node.dataset.category;

            // 1. Hide Spatial Hub, Show Category Space
            spatialHubSection.style.display = 'none';
            categorySpaceSection.style.display = 'block';

            // 2. Update Category Space Title
            categorySpaceTitle.textContent = categoryName;

            // 3. Load Product Cards
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

    // --- Event listener for "Back to Hub" button ---
    backToHubBtn.addEventListener('click', () => {
        categorySpaceSection.style.display = 'none';
        spatialHubSection.style.display = 'flex'; // Or 'block' depending on how you want the hub to reappear
    });
});