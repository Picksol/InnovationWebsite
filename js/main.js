document.addEventListener('DOMContentLoaded', () => {
    // Navbar interaction
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.querySelector('.nav-indicator');
    let activeNavItem = document.querySelector('.nav-item.active'); // Initialize activeNavItem correctly

    function updateNavIndicator(target) {
        const navIndicator = document.querySelector('.nav-indicator');
        if (!navIndicator) return;

        if (!target) return;
        const itemRect = target.getBoundingClientRect();
        navIndicator.style.width = `${itemRect.width}px`;
        navIndicator.style.left = `${target.offsetLeft}px`;
    }

    navItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            updateNavIndicator(item);
        });

        item.addEventListener('click', function(e) {
            e.preventDefault();
            navItems.forEach(n => n.classList.remove('active'));
            this.classList.add('active');
            activeNavItem = this; // Update activeNavItem when a new item is clicked
            updateNavIndicator(this);
        });
    });

    // Reset indicator when mouse leaves nav
    document.querySelector('.nav-scroll-container').addEventListener('mouseleave', () => {
        if (activeNavItem) {
            updateNavIndicator(activeNavItem); // Reset to active item position
        } else {
            navIndicator.style.width = '0px';
        }
    });


    // Parallax effect - Refined and Smoother
    const parallaxContainer = document.querySelector('.parallax-container');
    if (parallaxContainer) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            parallaxContainer.style.transform = `translateY(${scrolled * 0.3}px)`;
        });
    }
});