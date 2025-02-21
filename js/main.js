document.addEventListener('DOMContentLoaded', () => {
    // Navbar interaction
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.querySelector('.nav-indicator');

    function updateNavIndicator(target) {
        if (!target) return; // Exit if target is null (e.g., on page load before items are rendered)
        const itemRect = target.getBoundingClientRect();
        navIndicator.style.width = `${itemRect.width}px`;
        navIndicator.style.left = `${target.offsetLeft}px`;
    }

    let activeNavItem = document.querySelector('.nav-item.active'); // Get initially active item
    if (activeNavItem) {
        updateNavIndicator(activeNavItem); // Initialize indicator position
    }


    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            updateNavIndicator(item);
        });

        item.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default link behavior (for in-page navigation later if needed)
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            updateNavIndicator(this); // Update indicator on click as well
        });
    });

    // Reset indicator when mouse leaves nav
    document.querySelector('.nav-scroll-container').addEventListener('mouseleave', () => {
        if (activeNavItem) {
            updateNavIndicator(activeNavItem); // Reset to active item position
        } else {
            navIndicator.style.width = '0px'; // Or hide indicator completely if no active item
        }
    });


    // Parallax effect - Refined and Smoother
    const parallaxContainer = document.querySelector('.parallax-container');
    if (parallaxContainer) { // Check if parallax container exists on the page
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            parallaxContainer.style.transform = `translateY(${scrolled * 0.3}px)`; // Reduced parallax speed for a more subtle effect
        });
    }
});