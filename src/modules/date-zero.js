// Add proper export
export function initializeDateZero() {
  const nodes = document.querySelectorAll("[data-dt-date-zero]");
  nodes.forEach((node) => {
    const original = node.textContent.trim();
    const parts = original.split("/");
    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const month = parts[1].padStart(2, "0");
      const year = parts[2];
      node.textContent = `${day}/${month}/${year}`;
    }
  });
}

// Keep original event listener for standalone use
document.addEventListener("DOMContentLoaded", function() {
  // Only run if not being imported
  if (typeof module === 'undefined') {
    initializeDateZero();
  }
});