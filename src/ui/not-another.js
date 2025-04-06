// not-another.js - Supporting both animation types
window.App = window.App || {};
window.App.NotAnother = {
  activeEmojis: [],
  activeTimers: {},
  hoverTargets: {},

  // Test if device has cursor/hover capability
  hasHoverCapability: function () {
    // Primary test: matchMedia hover capability
    if (window.matchMedia) {
      // 'hover: none' means touch device without cursor
      const noHoverDevice = window.matchMedia("(hover: none)").matches;
      if (noHoverDevice) {
        console.log("[NotAnother] Touch device detected (no hover capability)");
        return false;
      }
    }

    // Secondary test: check for touch events as fallback
    const isTouchDevice =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    // Return true only if not a touch device
    return !isTouchDevice;
  },

  // Clean up emojis and event listeners
  cleanup: function () {
    // Remove any active emoji elements
    this.activeEmojis.forEach((emoji) => {
      if (emoji.parentNode) {
        emoji.parentNode.removeChild(emoji);
      }
    });

    // Clear active emojis array
    this.activeEmojis = [];

    // Clear any active timers
    Object.keys(this.activeTimers).forEach((key) => {
      clearTimeout(this.activeTimers[key]);
      delete this.activeTimers[key];
    });

    // Reset hover targets
    this.hoverTargets = {};
  },

  // Setup type 1 animation (original emoji animation)
  setupType1Animation: function (link, emojis) {
    // Set up the emoji span for animation
    if (!link.querySelector(".not-another-emoji")) {
      let emojiSpan = document.createElement("span");
      emojiSpan.className = "not-another-emoji";
      emojiSpan.style.display = "inline-block";
      emojiSpan.style.opacity = "0";
      emojiSpan.style.transform = "translateY(8px)";
      emojiSpan.style.transition = "opacity 0.2s ease, transform 0.2s ease";
      link.appendChild(emojiSpan);
    }

    let emojiSpan = link.querySelector(".not-another-emoji");
    let animationFrame = null;
    let isAnimating = false;
    let hasLeft = false;

    const animateEmoji = () => {
      if (isAnimating) return;
      isAnimating = true;
      let startTime = null;
      const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
        let elapsed = timestamp - startTime;
        let scale = 1;
        if (elapsed < 140) {
          scale = 1 + 0.3 * (elapsed / 140);
        } else if (elapsed < 280) {
          scale = 1.3 - 0.3 * ((elapsed - 140) / 140);
        } else if (elapsed < 420) {
          scale = 1 + 0.2 * ((elapsed - 280) / 140);
        } else if (elapsed < 700) {
          scale = 1.2 - 0.2 * ((elapsed - 420) / 280);
        }
        if (elapsed < 700) {
          emojiSpan.style.transform = `translateY(0) scale(${scale})`;
          animationFrame = requestAnimationFrame(animate);
        } else {
          emojiSpan.style.transform = "translateY(0) scale(1)";
          isAnimating = false;
          if (!hasLeft) animateEmoji();
        }
      };
      animationFrame = requestAnimationFrame(animate);
    };

    link.addEventListener("mouseenter", () => {
      hasLeft = false;
      let randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
      emojiSpan.textContent = ` ${randomEmoji}`;
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          emojiSpan.style.opacity = "1";
          emojiSpan.style.transform = "translateY(0) scale(1)";
          animateEmoji();
        });
      } else {
        setTimeout(() => {
          emojiSpan.style.opacity = "1";
          emojiSpan.style.transform = "translateY(0) scale(1)";
          animateEmoji();
        }, 0);
      }
    });

    link.addEventListener("mouseleave", () => {
      hasLeft = true;
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      isAnimating = false;
      if (typeof requestIdleCallback !== "undefined") {
        requestIdleCallback(() => {
          emojiSpan.style.opacity = "0";
          emojiSpan.style.transform = "translateY(8px) scale(1)";
        });
      } else {
        setTimeout(() => {
          emojiSpan.style.opacity = "0";
          emojiSpan.style.transform = "translateY(8px) scale(1)";
        }, 0);
      }
    });

    // Store animation frame for cleanup
    this.hoverTargets[link.id] = {
      type: 1,
      animationFrame: animationFrame,
      cleanup: () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
      },
    };
  },

  // Setup type 2 animation (trailing emoji effect)
  setupType2Animation: function (link, emojis) {
    // Make sure link has an ID for timer tracking
    if (!link.id) {
      link.id = "not-another-" + Math.random().toString(36).substr(2, 9);
    }

    // Track mouse movement over this element
    link.addEventListener("mousemove", (event) => {
      // Create emojis with throttling
      if (!this.activeTimers[link.id]) {
        this.activeTimers[link.id] = setTimeout(() => {
          delete this.activeTimers[link.id];

          // Create a new emoji element
          const emoji = document.createElement("div");
          emoji.classList.add("emoji-cursor");
          emoji.innerHTML = emojis[Math.floor(Math.random() * emojis.length)];
          emoji.style.position = "fixed";
          emoji.style.left = `${event.clientX}px`;
          emoji.style.top = `${event.clientY}px`;
          emoji.style.zIndex = "9999";
          emoji.style.userSelect = "none";
          emoji.style.pointerEvents = "none";
          emoji.style.fontSize = "0.85rem";
          emoji.style.transform = "translate(-50%, -50%)";
          emoji.style.opacity = "1";
          emoji.style.transition = "transform 1s ease, opacity 1s ease";

          // Add to DOM
          document.body.appendChild(emoji);

          // Add to active emojis list for cleanup
          this.activeEmojis.push(emoji);

          // Apply animation
          setTimeout(() => {
            emoji.style.transform = `translate(-50%, calc(-50% - 40px)) rotate(${
              Math.random() * 60 - 30
            }deg)`;
            emoji.style.opacity = "0";
          }, 50);

          // Remove from DOM after animation
          setTimeout(() => {
            if (emoji.parentNode) {
              emoji.parentNode.removeChild(emoji);
            }
            // Remove from active emojis list
            const index = this.activeEmojis.indexOf(emoji);
            if (index > -1) {
              this.activeEmojis.splice(index, 1);
            }
          }, 1000);
        }, 100); // Create emoji every 100ms
      }
    });

    // Stop emojis when mouse leaves the element
    link.addEventListener("mouseleave", () => {
      if (this.activeTimers[link.id]) {
        clearTimeout(this.activeTimers[link.id]);
        delete this.activeTimers[link.id];
      }
    });

    // Store for cleanup
    this.hoverTargets[link.id] = {
      type: 2,
      cleanup: () => {
        if (this.activeTimers[link.id]) {
          clearTimeout(this.activeTimers[link.id]);
          delete this.activeTimers[link.id];
        }
      },
    };
  },

  initialize: function () {
    // Clean up any existing setup
    this.cleanup();

    let origin = encodeURIComponent(window.location.origin);

    // Available emojis to use
    const emojis = ["🚀", "🌏", "✨", "🇳🇿", "⚫️", "🖤"];

    // Find all not-another elements
    document.querySelectorAll("[data-not-another]").forEach((link) => {
      let campaign = link.getAttribute("data-not-another") || "client-footer";

      // Always set up the link URL, regardless of device type
      if (
        link.href !==
        `https://na.studio/?utm_source=${origin}&utm_medium=referral&utm_campaign=${encodeURIComponent(
          campaign
        )}&utm_content=na13`
      ) {
        link.href = `https://na.studio/?utm_source=${origin}&utm_medium=referral&utm_campaign=${encodeURIComponent(
          campaign
        )}&utm_content=na13`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }

      // Only set up hover effects on desktop devices
      if (this.hasHoverCapability()) {
        // Make sure link has an ID for tracking
        if (!link.id) {
          link.id = "not-another-" + Math.random().toString(36).substr(2, 9);
        }

        // Check which animation type to use
        const animationType =
          link.getAttribute("data-not-another-anim-type") || "1";

        if (animationType === "2") {
          // Use the trailing emoji effect
          this.setupType2Animation(link, emojis);
        } else {
          // Default to the original animation (type 1)
          this.setupType1Animation(link, emojis);
        }
      }
    });
  },

  // For Swup transitions
  reinitialize: function () {
    this.initialize();
  },
};
