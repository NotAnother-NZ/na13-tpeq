// Immediately-invoked function to avoid polluting global scope
(function () {
  // Function to fix backgrounds on autofilled inputs
  function fixAutofillBackgrounds() {
    // Target all input types that might be autofilled
    const inputs = document.querySelectorAll("input, textarea, select");

    inputs.forEach((input) => {
      // Get computed background color
      const bgColor = window.getComputedStyle(input).backgroundColor;

      // Check if the background is not transparent (indicating autofill)
      // Common autofill colors: rgba(232, 240, 254, 1) - Chrome blue, rgba(250, 255, 189, 1) - Chrome yellow
      if (
        bgColor &&
        bgColor !== "transparent" &&
        bgColor !== "rgba(0, 0, 0, 0)"
      ) {
        // Force transparent background with !important via inline style
        input.style.cssText +=
          "background-color: transparent !important; background-image: none !important;";

        // Add a custom attribute to mark this as fixed
        input.setAttribute("data-autofill-fixed", "true");

        console.log("Fixed autofill background on:", input);
      }
    });
  }

  // Option 1: Run on animation frames for smooth performance
  function checkOnAnimationFrame() {
    fixAutofillBackgrounds();
    requestAnimationFrame(checkOnAnimationFrame);
  }

  // Option 2: Use MutationObserver to detect DOM changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" ||
        mutation.type === "childList" ||
        mutation.attributeName === "style"
      ) {
        fixAutofillBackgrounds();
      }
    }
  });

  // Start observing the entire document for all changes
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
    attributeFilter: ["style", "class"],
  });

  // Option 3: Add event listeners for input-related events
  function addInputEventListeners() {
    const inputs = document.querySelectorAll("input, textarea, select");

    const eventTypes = [
      "input",
      "change",
      "focus",
      "blur",
      "animationstart",
      "animationend",
    ];

    inputs.forEach((input) => {
      eventTypes.forEach((eventType) => {
        input.addEventListener(eventType, () => {
          // Fix this element specifically
          setTimeout(() => {
            const bgColor = window.getComputedStyle(input).backgroundColor;
            if (
              bgColor &&
              bgColor !== "transparent" &&
              bgColor !== "rgba(0, 0, 0, 0)"
            ) {
              input.style.cssText +=
                "background-color: transparent !important; background-image: none !important;";
              input.setAttribute("data-autofill-fixed", "true");
            }
          }, 0);
        });
      });
    });
  }

  // Option 4: Create a specific animation detection for Chrome autofill
  const autofillStyle = document.createElement("style");
  autofillStyle.innerHTML = `
      @keyframes autofillDetection {
        from { opacity: 0.99; }
        to { opacity: 1; }
      }
      
      input:-webkit-autofill {
        animation-name: autofillDetection;
        animation-duration: 0.001s;
      }
    `;
  document.head.appendChild(autofillStyle);

  document.addEventListener(
    "animationstart",
    (event) => {
      if (event.animationName === "autofillDetection") {
        const input = event.target;
        // Chrome has autofilled this input!
        setTimeout(() => {
          input.style.cssText +=
            "background-color: transparent !important; background-image: none !important;";
          input.setAttribute("data-autofill-fixed", "true");
        }, 0);
      }
    },
    true
  );

  // Run all our strategies for maximum effectiveness
  // Initial fix
  setTimeout(fixAutofillBackgrounds, 100);

  // Ongoing fix with animation frame (option 1)
  requestAnimationFrame(checkOnAnimationFrame);

  // Add event listeners (option 3)
  addInputEventListeners();

  // Also re-run on document ready and page load
  document.addEventListener("DOMContentLoaded", fixAutofillBackgrounds);
  window.addEventListener("load", fixAutofillBackgrounds);

  // For good measure, check again after a small delay
  setTimeout(fixAutofillBackgrounds, 500);
  setTimeout(fixAutofillBackgrounds, 1000);
  setTimeout(fixAutofillBackgrounds, 2000);
})();
