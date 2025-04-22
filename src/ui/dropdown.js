// dropdown.js - Completely self-initializing dropdown implementation
// Current Date and Time (UTC): 2025-04-17 03:52:47
// Current User's Login: Druhin13

(function () {
  // Constants
  const MOBILE_BREAKPOINT = 991;

  // Self-initializing module
  const DropdownAutoInitializer = {
    observerActive: false,

    // Initialize MutationObserver to watch for DOM changes
    startObserving: function () {
      if (this.observerActive) return;

      console.log("Dropdown: Starting DOM observer");

      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        let shouldInitialize = false;

        // Check if relevant elements were added
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            // Look for added nodes that might be our target elements
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Element node
                if (node.querySelector) {
                  // Check if this node or its children contain dropdowns
                  if (
                    node.querySelector(".faq-wrapper") ||
                    node.querySelector("[data-dt-dropdown-group]")
                  ) {
                    shouldInitialize = true;
                  }
                }
              }
            });
          }
        });

        // Initialize if needed
        if (shouldInitialize) {
          this.initializeDropdowns();
        }
      });

      // Start observing document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      this.observerActive = true;
    },

    // Main initialization method
    initializeDropdowns: function () {
      console.log("Dropdown: Initializing dropdowns");

      // Check if we're on mobile
      const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

      // Process all dropdown groups
      const dropdownGroups = document.querySelectorAll(
        "[data-dt-dropdown-group]"
      );
      if (dropdownGroups.length) {
        console.log(`Dropdown: Found ${dropdownGroups.length} dropdown groups`);

        // Initialize each group
        dropdownGroups.forEach((group, index) => {
          const groupId =
            group.getAttribute("data-dt-dropdown-group") || `group-${index}`;
          this.setupGroup(group, groupId, isMobile);
        });
      } else {
        // Look for ungrouped dropdowns
        const faqWrappers = document.querySelectorAll(".faq-wrapper");
        if (faqWrappers.length) {
          console.log(
            `Dropdown: Found ${faqWrappers.length} ungrouped dropdowns`
          );
          this.setupUngrouped(faqWrappers, isMobile);
        }
      }
    },

    setupGroup: function (group, groupId, isMobile) {
      // Find all wrappers in this group
      const faqWrappers = group.querySelectorAll(".faq-wrapper");
      if (!faqWrappers.length) return;

      // Find the first one that should be open by default
      let firstDefaultOpen = null;
      faqWrappers.forEach((wrapper) => {
        const question = wrapper.querySelector(".faq-question");
        if (
          question &&
          question.getAttribute("data-dt-dropdown-open") === "true"
        ) {
          if (!firstDefaultOpen) {
            firstDefaultOpen = wrapper;
          }
        }
      });

      // Initial setup for each dropdown
      faqWrappers.forEach((wrapper) => {
        this.setupDropdown(wrapper, isMobile, faqWrappers);
      });

      // Open the default one if found
      if (firstDefaultOpen) {
        const question = firstDefaultOpen.querySelector(".faq-question");
        const answer = firstDefaultOpen.querySelector(".faq-answer");
        const icon = firstDefaultOpen.querySelector(".select-icon");

        // Delay opening to ensure proper layout
        setTimeout(() => {
          this.openDropdown(firstDefaultOpen, question, answer, icon);
        }, 50);
      }
    },

    setupUngrouped: function (faqWrappers, isMobile) {
      // Find the first one that should be open by default
      let firstDefaultOpen = null;
      faqWrappers.forEach((wrapper) => {
        const question = wrapper.querySelector(".faq-question");
        if (
          question &&
          question.getAttribute("data-dt-dropdown-open") === "true"
        ) {
          if (!firstDefaultOpen) {
            firstDefaultOpen = wrapper;
          }
        }
      });

      // Initial setup for each dropdown
      faqWrappers.forEach((wrapper) => {
        this.setupDropdown(wrapper, isMobile, faqWrappers);
      });

      // Open the default one if found
      if (firstDefaultOpen) {
        const question = firstDefaultOpen.querySelector(".faq-question");
        const answer = firstDefaultOpen.querySelector(".faq-answer");
        const icon = firstDefaultOpen.querySelector(".select-icon");

        // Delay opening to ensure proper layout
        setTimeout(() => {
          this.openDropdown(firstDefaultOpen, question, answer, icon);
        }, 50);
      }
    },

    setupDropdown: function (wrapper, isMobile, siblingWrappers) {
      // Only set up if not already initialized
      if (wrapper.hasAttribute("data-dropdown-initialized")) return;

      const question = wrapper.querySelector(".faq-question");
      const answer = wrapper.querySelector(".faq-answer");
      const icon = wrapper.querySelector(".select-icon");

      if (!question || !answer) return;

      // Set up initial styles
      question.style.cursor = "pointer";
      if (icon) icon.style.transition = "transform 0.3s ease";

      wrapper.style.height = question.offsetHeight + "px";
      wrapper.style.transition = "height 0.3s ease-in-out";
      wrapper.style.overflow = "hidden";

      // Hide answer initially
      answer.style.display = "none";
      answer.setAttribute("aria-hidden", "true");
      question.setAttribute("aria-expanded", "false");

      // Set up click handler for question
      this.attachClickHandler(question, () => {
        this.handleClick(
          wrapper,
          question,
          answer,
          icon,
          siblingWrappers,
          isMobile
        );
      });

      // Set up click handler for icon if present
      if (icon && icon.parentElement) {
        this.attachClickHandler(icon.parentElement, (e) => {
          e.stopPropagation();
          this.handleClick(
            wrapper,
            question,
            answer,
            icon,
            siblingWrappers,
            isMobile
          );
        });
      }

      // Mark as initialized
      wrapper.setAttribute("data-dropdown-initialized", "true");
    },

    attachClickHandler: function (element, handler) {
      // Remove any existing handler with the same ID
      if (element._dropdownHandlerId) {
        element.removeEventListener("click", element._dropdownHandler);
      }

      // Generate a unique ID for this handler
      const handlerId = Math.random().toString(36).substring(2);

      // Create the handler function
      const clickHandler = function (e) {
        e.preventDefault();
        handler(e);
      };

      // Store handler and ID on the element
      element._dropdownHandler = clickHandler;
      element._dropdownHandlerId = handlerId;

      // Attach the handler
      element.addEventListener("click", clickHandler);
    },

    handleClick: function (
      wrapper,
      question,
      answer,
      icon,
      allWrappers,
      isMobile
    ) {
      const isOpen = question.getAttribute("aria-expanded") === "true";

      if (isOpen) {
        // Close this dropdown
        this.closeDropdown(wrapper, question, answer, icon);
      } else {
        // On desktop, close other dropdowns
        if (!isMobile) {
          allWrappers.forEach((otherWrapper) => {
            if (otherWrapper !== wrapper) {
              const otherQuestion = otherWrapper.querySelector(".faq-question");
              const otherAnswer = otherWrapper.querySelector(".faq-answer");
              const otherIcon = otherWrapper.querySelector(".select-icon");

              if (
                otherQuestion &&
                otherQuestion.getAttribute("aria-expanded") === "true"
              ) {
                this.closeDropdown(
                  otherWrapper,
                  otherQuestion,
                  otherAnswer,
                  otherIcon
                );
              }
            }
          });
        }

        // Open this dropdown
        this.openDropdown(wrapper, question, answer, icon);
      }

      // Update locomotive scroll
      this.updateLocomotiveScroll();
    },

    openDropdown: function (wrapper, question, answer, icon) {
      // Show answer to measure its height
      answer.style.display = "block";

      // Calculate total height
      const questionHeight = question.offsetHeight;
      const answerHeight = answer.offsetHeight;
      const totalHeight = questionHeight + answerHeight;

      // Set height and states
      wrapper.style.height = totalHeight + "px";
      question.setAttribute("aria-expanded", "true");
      answer.setAttribute("aria-hidden", "false");

      // Add active classes
      question.classList.add("active");
      wrapper.classList.add("active");

      // Rotate icon
      if (icon) {
        icon.style.transform = "rotate(180deg)";
      }
    },

    closeDropdown: function (wrapper, question, answer, icon) {
      // Set states
      question.setAttribute("aria-expanded", "false");
      answer.setAttribute("aria-hidden", "true");

      // Animate height
      const questionHeight = question.offsetHeight;
      wrapper.style.height = questionHeight + "px";

      // Hide answer after animation
      setTimeout(() => {
        if (question.getAttribute("aria-expanded") === "false") {
          answer.style.display = "none";
        }
      }, 300);

      // Remove active classes
      question.classList.remove("active");
      wrapper.classList.remove("active");

      // Rotate icon back
      if (icon) {
        icon.style.transform = "rotate(0deg)";
      }
    },

    updateLocomotiveScroll: function () {
      setTimeout(() => {
        if (
          window.App &&
          window.App.LocomotiveScroll &&
          window.App.LocomotiveScroll.instance
        ) {
          window.App.LocomotiveScroll.instance.update();
        } else if (
          window.App &&
          window.App.Core &&
          window.App.Core.scrollInstance
        ) {
          window.App.Core.scrollInstance.update();
        }
      }, 350);
    },
  };

  // Multiple ways to activate the initializer

  // Handle Swup transitions explicitly
  document.addEventListener("swup:contentReplaced", () => {
    console.log("Dropdown: Swup content replaced event detected");
    setTimeout(() => {
      DropdownAutoInitializer.initializeDropdowns();
    }, 100);
  });

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Dropdown: DOMContentLoaded event detected");
    DropdownAutoInitializer.initializeDropdowns();
    DropdownAutoInitializer.startObserving();
  });

  // Fallback if DOM is already loaded
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    console.log("Dropdown: Document already loaded, initializing directly");
    setTimeout(() => {
      DropdownAutoInitializer.initializeDropdowns();
      DropdownAutoInitializer.startObserving();
    }, 100);
  }

  // Store in global scope for debugging
  window.DropdownAutoInitializer = DropdownAutoInitializer;
})();

// Standard App namespace for compatibility with other components
window.App = window.App || {};
window.App.Dropdown = {
  initialize: function () {
    if (window.DropdownAutoInitializer) {
      window.DropdownAutoInitializer.initializeDropdowns();
    }
  },
  reinitialize: function () {
    if (window.DropdownAutoInitializer) {
      window.DropdownAutoInitializer.initializeDropdowns();
    }
  },
};
