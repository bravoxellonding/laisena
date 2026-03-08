// ===== MOBILE MENU TOGGLE =====
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const hamburgerIcon = document.getElementById('hamburger-icon');
const closeIcon = document.getElementById('close-icon');
const body = document.body;

mobileMenuBtn?.addEventListener('click', () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    
    // Toggle menu visibility
    mobileMenu.classList.toggle('hidden');
    
    // Toggle icons
    hamburgerIcon.classList.toggle('hidden');
    closeIcon.classList.toggle('hidden');
    
    // Update aria-expanded
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    
    // Prevent body scroll when menu is open
    body.classList.toggle('menu-open', !isExpanded);
});

// Close mobile menu when a link is clicked
document.querySelectorAll('.mobile-nav-link, .mobile-cta-btn').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
    });
});

// Close menu when clicking outside (on overlay area)
document.addEventListener('click', (e) => {
    if (!mobileMenu.classList.contains('hidden') && 
        !mobileMenu.contains(e.target) && 
        !mobileMenuBtn.contains(e.target)) {
        mobileMenu.classList.add('hidden');
        hamburgerIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
        body.classList.remove('menu-open');
    }
});

// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('main-header');

function handleScroll() {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
}
    
    // Run on load and scroll
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    // ===== KEYBOARD ACCESSIBILITY =====
    // Close menu with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            hamburgerIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
            mobileMenuBtn.focus();
            body.classList.remove('menu-open');
        }
    });
