// navigation.js - Navigation menu
// Current Date and Time (UTC): 2025-04-18 02:59:14
// Current User's Login: Druhin13

window.App = window.App || {};
window.App.Navigation = {
  // Desktop breakpoint in pixels
  desktopBreakpoint: 992,

  // Dropdown state
  dropdownOpen: false,
  dropdownTimeout: null,
  proximityThreshold: 50, // Distance in pixels to keep dropdown open
  debug: true, // Enable debugging

  // Helper function for debugging
  log: function (...args) {
    if (this.debug) {
      console.log("[Navigation]", ...args);
    }
  },

  // Helper function to check if we're on desktop
  isDesktop: function () {
    return window.innerWidth >= this.desktopBreakpoint;
  },

  // Helper function to check if mobile menu is open
  isMobileMenuOpen: function () {
    const mobileNavWrapper = document.getElementById("mobile-nav-wrapper");
    if (!mobileNavWrapper) return false;

    const computedStyle = window.getComputedStyle(mobileNavWrapper);
    return computedStyle.display !== "none";
  },

  // Helper to update mobile nav button text based on menu state
  updateMobileNavButtonText: function () {
    const mobileNavButton = document.getElementById("mobile-nav-button");
    if (!mobileNavButton) return;

    const textElement = mobileNavButton.querySelector(".body1-1");
    if (!textElement) return;

    const isOpen = this.isMobileMenuOpen();
    textElement.textContent = isOpen ? "Close" : "Menu";
    this.log(
      `Updated mobile button text to: ${textElement.textContent} based on menu display state`
    );
  },

  // Update scroll state based on mobile menu visibility using Locomotive Scroll
  updateScrollState: function () {
    const isOpen = this.isMobileMenuOpen();

    if (isOpen) {
      // Disable scrolling when menu is open using Locomotive Scroll
      if (
        window.App.LocomotiveScroll &&
        typeof window.App.LocomotiveScroll.pause === "function"
      ) {
        window.App.LocomotiveScroll.pause();
        this.log("Locomotive scroll paused (menu open)");
      }
    } else {
      // Enable scrolling when menu is closed using Locomotive Scroll
      if (
        window.App.LocomotiveScroll &&
        typeof window.App.LocomotiveScroll.resume === "function"
      ) {
        window.App.LocomotiveScroll.resume();
        this.log("Locomotive scroll resumed (menu closed)");
      }
    }
  },

  // Get active link based on current URL
  getActiveLink: function (links) {
    const path = window.location.pathname;
    let active = null;
    links.forEach((link) => {
      const href = link.getAttribute("href");
      if (href === "/") {
        if (path === "/") {
          active = link;
        }
      } else {
        if (path === href || path.indexOf(href + "/") === 0) {
          active = link;
        }
      }
    });
    return active;
  },

  // Move the active background to a specific link
  moveActiveTo: function (link, activeBg, menu, pillWidthAdjustment) {
    // Only proceed if in desktop mode
    if (!this.isDesktop()) {
      activeBg.style.display = "none";
      return;
    }

    const linkRect = link.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();

    // Adjust width and center the pill accordingly
    const adjustedWidth = linkRect.width - pillWidthAdjustment;
    const adjustedLeft =
      linkRect.left - menuRect.left + pillWidthAdjustment / 2;

    activeBg.style.display = "block";
    activeBg.style.left = adjustedLeft + "px";
    activeBg.style.width = adjustedWidth + "px";
    activeBg.style.transform = "scaleY(1.05)";

    setTimeout(() => {
      activeBg.style.transform = "scaleY(1)";
    }, 300);
  },

  // Update active background position on resize or mode change
  updateActiveBackground: function (
    links,
    activeBg,
    menu,
    pillWidthAdjustment
  ) {
    // Hide active background on mobile/tablet
    if (!this.isDesktop()) {
      activeBg.style.display = "none";
      return;
    }

    const currentLink = this.getActiveLink(links);
    if (currentLink) {
      const linkRect = currentLink.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const adjustedWidth = linkRect.width - pillWidthAdjustment;
      const adjustedLeft =
        linkRect.left - menuRect.left + pillWidthAdjustment / 2;

      activeBg.style.display = "block";
      activeBg.style.left = adjustedLeft + "px";
      activeBg.style.width = adjustedWidth + "px";
    } else {
      activeBg.style.display = "none";
    }
  },

  // Setup mobile navigation button
  setupMobileNavButton: function () {
    const mobileNavButton = document.getElementById("mobile-nav-button");
    const mobileNavWrapper = document.getElementById("mobile-nav-wrapper");

    if (!mobileNavButton || !mobileNavWrapper) {
      this.log("Mobile nav elements not found");
      return;
    }

    this.log("Setting up mobile nav button");

    // Set initial button text based on current state
    this.updateMobileNavButtonText();

    // Update initial scroll state based on menu visibility
    this.updateScrollState();

    // Toggle mobile menu function
    const toggleMobileMenu = (e) => {
      // Prevent default behavior to avoid scroll to top
      if (e) {
        e.preventDefault();
      }

      const isOpen = this.isMobileMenuOpen();

      if (!isOpen) {
        // Open menu
        mobileNavWrapper.classList.add("open");
      } else {
        // Close menu
        mobileNavWrapper.classList.remove("open");
      }

      // Update button text and scroll state after a small delay
      // to ensure display state has changed
      setTimeout(() => {
        this.updateMobileNavButtonText();
        this.updateScrollState();
      }, 10);
    };

    // Add click handler to mobile nav button
    mobileNavButton.addEventListener("click", toggleMobileMenu);

    // Add click handlers to all links in the mobile menu
    const mobileLinks = mobileNavWrapper.querySelectorAll("a");
    mobileLinks.forEach((link) => {
      link.addEventListener("click", () => {
        // Update the button text to match the state
        setTimeout(() => {
          this.updateMobileNavButtonText();
          this.updateScrollState();
        }, 10);
      });
    });

    // Update button text and scroll state on window resize
    window.addEventListener("resize", () => {
      if (this.isDesktop() && this.isMobileMenuOpen()) {
        // Close mobile menu when resizing to desktop
        mobileNavWrapper.classList.remove("open");

        // Update the button text and scroll state after menu changes
        setTimeout(() => {
          this.updateMobileNavButtonText();
          this.updateScrollState();
        }, 10);
      }
    });

    // Monitor changes to mobile menu visibility
    const observeMobileMenu = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "style" ||
            mutation.attributeName === "class")
        ) {
          this.updateMobileNavButtonText();
          this.updateScrollState();
        }
      });
    });

    // Start observing the mobile menu for changes
    observeMobileMenu.observe(mobileNavWrapper, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  },

  // Align dropdown with nav menu (only horizontally)
  alignDropdownWithMenu: function (dropdown) {
    const menu = document.getElementById("nav-menu");
    if (!menu || !dropdown) return;

    // Get the position of the nav menu relative to its parent
    const navRect = menu.getBoundingClientRect();
    const parentRect = menu.parentElement.getBoundingClientRect();

    // Calculate left position to align with nav menu
    const leftPos = navRect.left - parentRect.left;

    // Apply only the left position, leave top position untouched
    dropdown.style.left = leftPos + "px";

    this.log(
      `Aligned dropdown: left=${leftPos}px (keeping original top position)`
    );
  },

  // Show services dropdown with direct style application
  showServicesDropdown: function (dropdown) {
    if (!this.isDesktop() || this.dropdownOpen) return;

    this.log("Showing dropdown");

    // Clear any pending close timeout
    if (this.dropdownTimeout) {
      clearTimeout(this.dropdownTimeout);
      this.dropdownTimeout = null;
    }

    // Set explicit styles for the dropdown
    dropdown.style.display = "flex";
    dropdown.style.flexDirection = "column";
    dropdown.style.opacity = "0";
    dropdown.style.transform = "translateY(-10px)";
    dropdown.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    dropdown.style.position = "absolute";
    dropdown.style.zIndex = "1000";

    // Align the dropdown with the nav menu (only left alignment)
    this.alignDropdownWithMenu(dropdown);

    // Force reflow
    void dropdown.offsetHeight;

    // Animate in
    setTimeout(() => {
      dropdown.style.opacity = "1";
      dropdown.style.transform = "translateY(0)";
    }, 10);

    this.dropdownOpen = true;
  },

  // Hide services dropdown
  hideServicesDropdown: function (dropdown) {
    if (!this.dropdownOpen) return;

    this.log("Hiding dropdown");

    // Animate out
    dropdown.style.opacity = "0";
    dropdown.style.transform = "translateY(-10px)";

    // Set timeout to hide after animation
    this.dropdownTimeout = setTimeout(() => {
      dropdown.style.display = "none";
      this.dropdownTimeout = null;
    }, 300);

    this.dropdownOpen = false;
  },

  // Check proximity between point and element
  isInProximity: function (x, y, element) {
    if (!element) return false;

    const rect = element.getBoundingClientRect();

    // Calculate distance to the closest point on the element
    const closestX = Math.max(rect.left, Math.min(x, rect.right));
    const closestY = Math.max(rect.top, Math.min(y, rect.bottom));

    // Calculate distance using Pythagorean theorem
    const distance = Math.sqrt(
      Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2)
    );

    return distance <= this.proximityThreshold;
  },

  // Setup dropdown functionality
  setupDropdown: function () {
    // Services dropdown elements
    const servicesDropdownTrigger = document.getElementById("nav-link0");
    const servicesDropdown = document.getElementById("nav-services-dropdown");

    if (!servicesDropdownTrigger || !servicesDropdown) {
      this.log(
        "Dropdown elements not found:",
        "trigger:",
        servicesDropdownTrigger,
        "dropdown:",
        servicesDropdown
      );
      return;
    }

    this.log(
      "Setting up dropdown",
      "trigger:",
      servicesDropdownTrigger,
      "dropdown:",
      servicesDropdown
    );

    // Initial dropdown state - make sure it's properly hidden
    servicesDropdown.style.display = "none";
    servicesDropdown.style.opacity = "0";

    // Pre-align dropdown (for when it first appears) - only left alignment
    this.alignDropdownWithMenu(servicesDropdown);

    // Prevent click behavior on services dropdown trigger
    servicesDropdownTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      // We don't toggle the dropdown on click, only on hover
      this.log("Services dropdown click prevented");
      return false;
    });

    // Add direct event listeners to both elements
    servicesDropdownTrigger.onmouseenter = () => {
      this.log("Trigger mouseenter");
      if (this.isDesktop()) {
        this.showServicesDropdown(servicesDropdown);
      }
    };

    servicesDropdown.onmouseenter = () => {
      this.log("Dropdown mouseenter");
      if (this.isDesktop()) {
        this.showServicesDropdown(servicesDropdown);
      }
    };

    // Alternative approach using addEventListener
    servicesDropdownTrigger.addEventListener("mouseover", () => {
      this.log("Trigger mouseover");
      if (this.isDesktop()) {
        this.showServicesDropdown(servicesDropdown);
      }
    });

    // Set up focus effect for links inside dropdown
    const dropdownLinks = servicesDropdown.querySelectorAll("a");

    // Function to reset all links to normal opacity
    const resetLinksOpacity = () => {
      dropdownLinks.forEach((link) => {
        link.style.opacity = "1";
        link.style.transition = "opacity 0.2s ease";
      });
    };

    // Add hover effects to dropdown links
    dropdownLinks.forEach((link) => {
      // Initialize transition on all links
      link.style.transition = "opacity 0.2s ease";

      // On mouse enter, dim all other links
      link.addEventListener("mouseenter", () => {
        dropdownLinks.forEach((otherLink) => {
          if (otherLink !== link) {
            otherLink.style.opacity = "0.5";
          } else {
            otherLink.style.opacity = "1";
          }
        });
      });

      // On mouse leave, reset all links
      link.addEventListener("mouseleave", () => {
        resetLinksOpacity();
      });

      // Close dropdown when a link is clicked
      link.addEventListener("click", () => {
        this.log("Dropdown link clicked, closing dropdown");
        this.hideServicesDropdown(servicesDropdown);
      });
    });

    // Reset all links when leaving the dropdown
    servicesDropdown.addEventListener("mouseleave", resetLinksOpacity);

    // Track mouse movement to handle proximity detection
    document.addEventListener("mousemove", (e) => {
      if (!this.isDesktop()) return;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // If dropdown is open, check proximity
      if (this.dropdownOpen) {
        const inTriggerProximity = this.isInProximity(
          mouseX,
          mouseY,
          servicesDropdownTrigger
        );

        const inDropdownProximity = this.isInProximity(
          mouseX,
          mouseY,
          servicesDropdown
        );

        // If mouse is not near both elements, close dropdown
        if (!inTriggerProximity && !inDropdownProximity) {
          this.hideServicesDropdown(servicesDropdown);
          resetLinksOpacity(); // Reset link opacity when closing dropdown
        }
      }
    });

    // Close dropdown on scroll
    window.addEventListener("scroll", () => {
      if (this.isDesktop() && this.dropdownOpen) {
        this.hideServicesDropdown(servicesDropdown);
        resetLinksOpacity(); // Reset link opacity when closing dropdown
      }
    });

    // Realign dropdown on window resize (only left position)
    window.addEventListener("resize", () => {
      if (this.isDesktop() && this.dropdownOpen) {
        this.alignDropdownWithMenu(servicesDropdown);
      }
    });
  },

  initialize: function () {
    this.log("Initializing navigation");

    // Use a slightly longer delay to ensure DOM is ready
    setTimeout(() => {
      this.log("DOM ready, setting up navigation");

      const links = document.querySelectorAll(".nav-link");
      const activeBg = document.querySelector(".nav-link-active");
      const menu = document.querySelector(".nav-menu");

      if (!links.length || !activeBg || !menu) {
        this.log("Required navigation elements not found");
        return;
      }

      this.log("Found navigation elements");

      // Set up dropdown functionality
      this.setupDropdown();

      // Set up mobile navigation button
      this.setupMobileNavButton();

      // Amount in pixels to shorten the pill's width.
      const pillWidthAdjustment = 10;

      // Initial setup for active background
      const currentLink = this.getActiveLink(links);

      if (currentLink && this.isDesktop()) {
        activeBg.style.display = "block";
        activeBg.style.transition = "none";

        const linkRect = currentLink.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const adjustedWidth = linkRect.width - pillWidthAdjustment;
        const adjustedLeft =
          linkRect.left - menuRect.left + pillWidthAdjustment / 2;

        activeBg.style.left = adjustedLeft + "px";
        activeBg.style.width = adjustedWidth + "px";

        // Force reflow
        activeBg.offsetHeight;

        // Add transition after initial positioning
        activeBg.style.transition =
          "left 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), width 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
      } else {
        activeBg.style.display = "none";
      }

      // Add click handlers to links, excluding the dropdown trigger
      links.forEach((link) => {
        // Skip nav-link0 (the dropdown trigger)
        if (link.id === "nav-link0") return;

        link.addEventListener("click", () => {
          if (this.isDesktop()) {
            this.moveActiveTo(link, activeBg, menu, pillWidthAdjustment);
          }
        });
      });

      // Update active background on resize
      window.addEventListener("resize", () => {
        this.updateActiveBackground(links, activeBg, menu, pillWidthAdjustment);

        // Re-setup dropdown on resize to ensure it's correctly initialized
        this.setupDropdown();
      });

      // Support for Swup page transitions
      document.addEventListener("swup:contentReplaced", () => {
        setTimeout(() => {
          this.log("Content replaced, reinitializing");
          this.initialize();

          // Update scroll state based on current menu visibility
          this.updateScrollState();
        }, 100);
      });
    }, 100);
  },
};

// Initialize navigation when the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  window.App.Navigation.initialize();
});

// Also initialize on window load for extra reliability
window.addEventListener("load", function () {
  // Only initialize if not already initialized
  if (!document.querySelector(".nav-link-active[style*='display: block']")) {
    window.App.Navigation.initialize();
  }

  // Setup dropdown specifically
  window.App.Navigation.setupDropdown();

  // Make sure scroll state is correct
  window.App.Navigation.updateScrollState();
});
