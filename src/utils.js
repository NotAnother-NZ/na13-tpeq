// utils.js - Utility functions
window.App = window.App || {};
window.App.Utils = {
  runCopyrightYearScript: function () {
    [...document.querySelectorAll("[data-copyright-year]")].forEach(
      (el) => (el.textContent = new Date().getFullYear())
    );
  },

  runDateZeroScript: function () {
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
  },

  initializePageScripts: function () {
    var pageBody = document.body;
    if (pageBody.classList.contains("contact-page")) {
      // Add any contact page specific scripts here
    }
  },
};
