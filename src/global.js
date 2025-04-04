// Core functionality
import { initializeSwup, ensureOverlayElement } from './modules/swup.js';
import { initializeLocomotive } from './modules/locomotive.js';

// UI components
// import { initializeServiceSlider } from './modules/service-slider.js';
import { initializeNavigationMenu } from './modules/nav.js';
import { initializeFooterMenuHover } from './modules/footer-menu.js';
import { initializeNewsletterForm } from './modules/newsletter-form.js';
import { initializeContactForm } from './modules/contact-form.js';
import { initializeInsightsSorting } from './modules/insights-sorting.js';
import { initializeProfilePlaceholders } from './modules/profile-placeholders.js';
import { setupGoToTopButton } from './modules/go-to-top.js';

// Utilities
import { loadQuicklink, initializeQuicklink } from './modules/quicklink.js';
import { runCopyrightYearScript } from './modules/copyright.js';
import { runDateZeroScript } from './modules/date-zero.js';
import { runNotAnotherScript } from './modules/by-na.js';

// Prevent multiple initializations
if (window.globalInitialized) {
  console.log("Global JS already initialized");
} else {
  window.globalInitialized = true;

  // Initialize all modules
  function initializeAllModules() {
    initializeLocomotive();
    initializeQuicklink();
    setupGoToTopButton();
    runCopyrightYearScript();
    runDateZeroScript();
    runNotAnotherScript();
    initializeNavigationMenu();
    initializeNewsletterForm();
    initializeContactForm();
    initializeInsightsSorting();
    initializeFooterMenuHover();
    initializeProfilePlaceholders();
    // initializeServiceSlider();
  }

  // Initialize on document load
  document.addEventListener("DOMContentLoaded", function() {
    ensureOverlayElement();
    initializeSwup(initializeAllModules);
    initializeAllModules();
    loadQuicklink();
  });

  // Also initialize certain modules on window load for reliability
  window.addEventListener("load", function() {
    initializeFooterMenuHover();
    initializeProfilePlaceholders();
    // initializeServiceSlider();
  });
}