// Swup module for handling page transitions
import { destroyLocomotive } from './locomotive.js';

const ANIMATION_DURATION = 500;
let swupInstance = null;
let animationStartTime = 0;

export function initializeSwup(initializeAllCallback) {
  const overlay = document.createElement("div");
  overlay.id = "swup-overlay";
  document.body.appendChild(overlay);
  
  swupInstance = new Swup({
    containers: ["#swup"],
    cache: true,
    animationSelector: '[class*="transition-"]',
    plugins: [
      new SwupHeadPlugin({
        persistTags: "style[data-swup-persist], script[data-swup-persist]",
        awaitAssets: true,
      }),
      new SwupScriptsPlugin({ head: true, body: true, optin: true }),
    ],
    animateHistoryBrowsing: true,
  });
  
  swupInstance.hooks.on("animation:out:start", () => {
    destroyLocomotive();
    animationStartTime = Date.now();
    document.documentElement.classList.add("is-animating");
    document.body.style.pointerEvents = "none";
  });
  
  swupInstance.hooks.on("content:replace", () => {
    let elapsed = Date.now() - animationStartTime;
    let remaining = ANIMATION_DURATION - elapsed;
    if (remaining < 0) remaining = 0;
    
    setTimeout(() => {
      // Run all module initializers
      if (typeof initializeAllCallback === 'function') {
        initializeAllCallback();
      }
      
      // Reinitialize Webflow interactions
      if (window.Webflow && Webflow.require) {
        Webflow.require("ix2").init();
      }
      
      document.documentElement.classList.remove("is-animating");
      document.body.style.pointerEvents = "";
    }, remaining);
  });
  
  return swupInstance;
}

export function ensureOverlayElement() {
  let overlay = document.getElementById("swup-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "swup-overlay";
    document.body.appendChild(overlay);
  }
  overlay.style.position = "fixed";
  overlay.style.inset = "0";
  overlay.style.backgroundColor = "black";
  overlay.style.pointerEvents = "none";
  overlay.style.zIndex = "9999";
  overlay.style.transform = "scaleY(0)";
  overlay.style.transformOrigin = "top";
  overlay.style.transition = `transform ${
    ANIMATION_DURATION / 1000
  }s cubic-bezier(0.16, 1, 0.3, 1)`;
}