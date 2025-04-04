// Go to top button functionality
import { getScrollInstance } from './locomotive.js';

export function setupGoToTopButton() {
  const goToTopButton = document.querySelector("#go-to-top");
  if (goToTopButton) {
    goToTopButton.addEventListener("click", function (e) {
      e.preventDefault();
      const scrollInstance = getScrollInstance();
      if (scrollInstance) {
        scrollInstance.scrollTo(0, {
          duration: 900,
          easing: [0.25, 0.0, 0.35, 1.0],
          disableLerp: false,
        });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  }
}