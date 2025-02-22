document.addEventListener('DOMContentLoaded', () => {

    const spatialHubContainer = document.getElementById('spatial-hub-container');
    const canvasContainer = document.getElementById('hub-3d-canvas-container');
    const canvas = document.getElementById('hub-3d-canvas');

    // --- Initialize Three.js Scene ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, canvasContainer.offsetWidth / canvasContainer.offsetHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    renderer.setClearColor(0x000000, 0);

    camera.position.z = 8;
    const hubRadius = 4;

    const textureLoader = new THREE.TextureLoader();
    const placeholderTextureURL = 'assets/images/product_placeholder.png';

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredNode = null;

    // --- Function to fetch categories data from JSON ---
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

    // --- Function to create 3D Category Nodes ---
    async function createCategoryNodes() {
        const categoriesData = await fetchCategoriesData();
        if (!categoriesData) {
            console.error("Failed to load categories for 3D Hub - Aborting node creation.");
            return null;
        }

        const nodes = [];
        const nodeRadius = 1.0;
        const nodeSegments = 32;
        const nodeRings = 32;

        for (let i = 0; i < categoriesData.length; i++) {
            const category = categoriesData[i];
            const categoryImageURL = category.subcategories && category.subcategories[0] && category.subcategories[0].image ? category.subcategories[0].image : 'assets/images/product_placeholder.png';

            let nodeMaterial;

            try {
                const categoryTexture = await textureLoader.loadAsync(categoryImageURL);
                nodeMaterial = new THREE.MeshBasicMaterial({ map: categoryTexture });
            } catch (textureError) {
                console.error(`Failed to load texture for category ${category.category} from ${categoryImageURL}:`, textureError);
                console.log(`Loading placeholder texture from ${placeholderTextureURL} instead.`);
                try {
                    const placeholderTexture = await textureLoader.loadAsync(placeholderTextureURL);
                    nodeMaterial = new THREE.MeshBasicMaterial({ map: placeholderTexture });
                } catch (placeholderError) {
                    console.error("Failed to load even the placeholder texture!", placeholderError);
                    nodeMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff });
                }
            }

            const nodeGeometry = new THREE.SphereGeometry(nodeRadius, nodeSegments, nodeRings);
            const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);

            const phi = Math.acos(-1 + (2 * i) / categoriesData.length);
            const theta = Math.sqrt(categoriesData.length * Math.PI) * phi;

            nodeMesh.position.setFromSphericalCoords(hubRadius, phi, theta);

            nodeMesh.userData = { categoryName: category.category };
            nodes.push(nodeMesh);
            scene.add(nodeMesh);
        }
        return nodes;
    }


    let categoryNodes = [];

    async function initializeHub() {
        const nodes = await createCategoryNodes();
        if (nodes) {
            categoryNodes = nodes;
            animate();
        } else {
            console.error("Hub initialization failed due to category data loading issues.");
            spatialHubContainer.innerHTML = '<p class="error-message">Failed to load categories. Please try again later.</p>';
        }
    }


    function animate() {
        requestAnimationFrame(animate);

        controls.update();

        // --- Hover Detection Logic ---
        raycaster.setFromCamera(mouse, camera);
        const intersections = raycaster.intersectObjects(categoryNodes);

        if (intersections.length > 0) {
            const intersectedNode = intersections[0].object;

            if (intersectedNode && intersectedNode !== hoveredNode) {
                if (hoveredNode) { hoveredNode.scale.set(1, 1, 1); }
                hoveredNode = intersectedNode;
                hoveredNode.scale.set(1.2, 1.2, 1.2);
            }
        } else {
            if (hoveredNode) { hoveredNode.scale.set(1, 1, 1); hoveredNode = null; }
        }


        if (categoryNodes && categoryNodes.forEach) {
            categoryNodes.forEach(node => {
                node.rotation.y += 0.005;
            });
        }

        renderer.render(scene, camera);
    }

    function onWindowResize() {
        camera.aspect = canvasContainer.offsetWidth / canvasContainer.offsetHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    }
    window.addEventListener('resize', onWindowResize, false);
    onWindowResize();


    // --- Mousemove Event Listener for Hover Detection ---
    canvas.addEventListener('mousemove', onMouseMove, false);

    function onMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    }


    // --- Click Event Listener for Node Clicks ---
    canvas.addEventListener('click', onCanvasClick, false);

    function onCanvasClick(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = - ((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
        const intersections = raycaster.intersectObjects(categoryNodes);
    
        console.log("Click event - Intersections:", intersections); // Log intersections
    
        if (intersections.length > 0) {
            console.log("Click INTERSECTION DETECTED!"); // Confirm intersection
            const clickedNode = intersections[0].object;
            const categoryName = clickedNode.userData.categoryName;
            console.log("Clicked Node Category:", categoryName); // Log category name
            handleCategoryNodeClick(categoryName);
        } else {
            console.log("Click - NO INTERSECTION DETECTED."); // No intersection
        }
    }


    // --- Category space placeholder functionality ---
    const categorySpacePlaceholder = document.getElementById('category-space-placeholder');
    spatialHubContainer.style.display = 'block';
    function handleCategoryNodeClick(categoryName) {
        console.log(`Clicked on category node: ${categoryName}`);
        spatialHubContainer.style.display = 'none';
        categorySpacePlaceholder.style.display = 'block';
        categorySpacePlaceholder.innerHTML = `
            <section class="category-space-placeholder-content">
                <h2>3D Category Space: ${categoryName}</h2>
                <p>You have entered the 3D category space for <strong>${categoryName}</strong>. 3D product displays or subcategory exploration will go here.</p>
                <button class="holographic-btn back-to-hub-btn">Back to 3D Hub</button>
            </section>
        `;
        categorySpacePlaceholder.querySelector('.back-to-hub-btn').addEventListener('click', () => {
            categorySpacePlaceholder.innerHTML = '';
            categorySpacePlaceholder.style.display = 'none';
            spatialHubContainer.style.display = 'block';
        });
    }


    initializeHub();

});