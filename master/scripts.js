// Run after all content (including iframes) has loaded
window.addEventListener('load', function () {
    // Remove preloader
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.display = 'none';
        document.body.classList.add('loaded');
    }

    // Handle scrolling to the anchor if there is a hash in the URL
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth' });
            }, 300); // Adjust the delay if necessary
        }
    } else {
        // Scroll to top if no hash is present
        window.scrollTo(0, 0);
    }
});

// Ensure DOM content is ready before checking for hashes
document.addEventListener('DOMContentLoaded', function () {
    // Check if there's a hash in the URL and scroll immediately
    if (window.location.hash) {
        const element = document.querySelector(window.location.hash);
        if (element) {
            // Scroll without delay for immediate navigation
            element.scrollIntoView({ behavior: 'smooth' });
        } else {
            console.warn('Anchor element not found:', window.location.hash);
        }
    }
});

function onIframeLoad() {
    // Forsink rulling til toppen
    setTimeout(function() {
        window.scrollTo(0, 0); // Tving rullingen til toppen
    }, 100); // 1 sekund forsinkelse
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}