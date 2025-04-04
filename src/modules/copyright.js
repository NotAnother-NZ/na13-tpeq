// Add proper export
export function initializeCopyright() {
  [...document.querySelectorAll("[data-copyright-year]")].forEach(
    (el) => (el.textContent = new Date().getFullYear())
  );
}

// Keep original event listener for standalone use
document.addEventListener("DOMContentLoaded", function() {
  // Only run if not being imported
  if (typeof module === 'undefined') {
    initializeCopyright();
  }
});