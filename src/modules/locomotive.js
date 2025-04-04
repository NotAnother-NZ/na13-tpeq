// Locomotive Scroll module for smooth scrolling
let scrollInstance = null;

export function initializeLocomotive() {
  const scrollContainer = document.querySelector("[data-scroll-container]");
  if (!scrollContainer) return;
  
  scrollInstance = new LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    multiplier: window.innerWidth <= 1024 ? 1.25 : 0.95,
    smartphone: { smooth: true, multiplier: 1.25 },
    tablet: { smooth: true, multiplier: 1.25 },
    scrollbarContainer: false,
  });
  
  window.scrollInstance = scrollInstance;
  return scrollInstance;
}

export function getScrollInstance() {
  return scrollInstance;
}

export function destroyLocomotive() {
  if (scrollInstance) {
    scrollInstance.destroy();
    scrollInstance = null;
  }
}