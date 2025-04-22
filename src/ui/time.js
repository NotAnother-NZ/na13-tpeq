// time.js - Dynamic timezone and time formatting utility
// Current Date and Time (UTC): 2025-04-17 03:56:15
// Current User's Login: Druhin13

(function () {
  // Self-initializing time utility
  const TimeAutoInitializer = {
    // Track elements with time attributes
    elements: [],
    // Store update interval reference
    updateInterval: null,
    // Default update frequency (in milliseconds)
    updateFrequency: 30000, // 30 seconds
    // Keep track of observer status
    observerActive: false,

    // Start monitoring the DOM for new time elements
    startObserving: function () {
      if (this.observerActive) return;

      console.log("Time: Starting DOM observer");

      // Create a new observer
      const observer = new MutationObserver((mutations) => {
        let shouldRefresh = false;

        // Check if relevant elements were added
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            // Look for added nodes that might contain time elements
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Element node
                if (node.querySelector) {
                  // Check if this node or its children contain time elements
                  if (node.querySelector("[data-dt-time]")) {
                    shouldRefresh = true;
                  }
                }
              }
            });

            // Also check for removed nodes
            mutation.removedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                // Element node
                if (
                  node.querySelector &&
                  node.querySelector("[data-dt-time]")
                ) {
                  shouldRefresh = true;
                }
              }
            });
          }
        });

        // Refresh if needed
        if (shouldRefresh) {
          this.initialize();
        }
      });

      // Start observing document for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      this.observerActive = true;
    },

    initialize: function () {
      console.log("Time: Initializing time elements");

      // Stop any existing interval
      this.cleanup();

      // Find all elements with data-dt-time attribute
      const timeElements = document.querySelectorAll("[data-dt-time]");
      if (!timeElements.length) {
        console.log("Time: No time elements found");
        return;
      }

      console.log(`Time: Found ${timeElements.length} time elements`);

      // Store elements for future updates
      this.elements = Array.from(timeElements);

      // Perform initial update
      this.updateAllTimes();

      // Set up interval for regular updates
      this.setupUpdateInterval();
    },

    cleanup: function () {
      // Clear any existing interval
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      // Clear elements array
      this.elements = [];
    },

    setupUpdateInterval: function () {
      // Clear any existing interval
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
      }

      // Set up new interval
      this.updateInterval = setInterval(() => {
        this.updateAllTimes();
      }, this.updateFrequency);
    },

    updateAllTimes: function () {
      const now = new Date();

      // Check if elements array is still valid (might not be after a page transition)
      if (!this.elements || !this.elements.length) {
        // Reinitialize if needed
        const timeElements = document.querySelectorAll("[data-dt-time]");
        if (timeElements.length) {
          this.elements = Array.from(timeElements);
        } else {
          return;
        }
      }

      this.elements.forEach((element) => {
        try {
          // Skip if element is no longer in the DOM
          if (!document.body.contains(element)) return;

          // Get timezone and format from attributes
          const timezone = element.getAttribute("data-dt-time");
          const format = element.getAttribute("data-dt-time-format") || "HH:mm";

          if (!timezone) return;

          // Format the time and update the element
          const formattedTime = this.formatTimeInTimezone(
            now,
            timezone,
            format
          );
          element.textContent = formattedTime;
        } catch (error) {
          // Silent error handling to prevent breaking the page
          console.log("Time: Error updating element", error);
        }
      });
    },

    formatTimeInTimezone: function (date, timezone, format) {
      try {
        // Create options for Intl.DateTimeFormat based on the format string
        const options = this.createFormattingOptions(format);

        // Format the date using Intl API with the specified timezone
        const formatter = new Intl.DateTimeFormat("en-US", {
          ...options,
          timeZone: timezone,
        });

        // Get formatted parts
        const formattedParts = formatter.formatToParts(date);

        // Convert to custom format
        return this.partsToFormat(formattedParts, format);
      } catch (error) {
        // Fallback to basic formatting
        return date.toLocaleTimeString("en-US", { timeZone: timezone });
      }
    },

    createFormattingOptions: function (format) {
      const options = {
        hour12: format.includes("a") || format.includes("A"),
      };

      // Hour
      if (format.includes("HH") || format.includes("H")) {
        options.hour = "2-digit";
      } else if (format.includes("h") || format.includes("k")) {
        options.hour = "numeric";
      }

      // Minute
      if (format.includes("mm") || format.includes("m")) {
        options.minute = "2-digit";
      }

      // Second
      if (format.includes("ss") || format.includes("s")) {
        options.second = "2-digit";
      }

      // AM/PM
      if (format.includes("a") || format.includes("A")) {
        options.dayPeriod = "short";
      }

      // Date parts
      if (
        format.includes("YYYY") ||
        format.includes("yyyy") ||
        format.includes("Y")
      ) {
        options.year = "numeric";
      }

      if (format.includes("MM") || format.includes("M")) {
        options.month = "2-digit";
      } else if (format.includes("MMM")) {
        options.month = "short";
      } else if (format.includes("MMMM")) {
        options.month = "long";
      }

      if (
        format.includes("DD") ||
        format.includes("dd") ||
        format.includes("D")
      ) {
        options.day = "2-digit";
      }

      // Timezone
      if (format.includes("z") || format.includes("Z")) {
        options.timeZoneName = "short";
      }

      return options;
    },

    partsToFormat: function (parts, format) {
      let result = format;

      // Create mapping of parts
      const partMap = {};
      parts.forEach((part) => {
        partMap[part.type] = part.value;
      });

      // Replace format tokens with actual values

      // Year
      result = result.replace(/YYYY|yyyy/g, partMap.year || "");
      result = result.replace(
        /YY|yy/g,
        partMap.year ? partMap.year.slice(-2) : ""
      );

      // Month
      result = result.replace(/MMMM/g, partMap.month || "");
      result = result.replace(
        /MMM/g,
        partMap.month ? partMap.month.substring(0, 3) : ""
      );
      result = result.replace(/MM/g, partMap.month || "");
      result = result.replace(
        /M/g,
        partMap.month ? partMap.month.replace(/^0/, "") : ""
      );

      // Day
      result = result.replace(/DD/g, partMap.day || "");
      result = result.replace(
        /D/g,
        partMap.day ? partMap.day.replace(/^0/, "") : ""
      );

      // Hour
      let hour = partMap.hour || "";
      if (format.includes("HH")) {
        // 24-hour format, ensure 2 digits
        if (partMap.dayPeriod) {
          // Convert from 12-hour to 24-hour
          hour = parseInt(hour);
          if (partMap.dayPeriod.toLowerCase() === "pm" && hour < 12) {
            hour += 12;
          } else if (partMap.dayPeriod.toLowerCase() === "am" && hour === 12) {
            hour = 0;
          }
          hour = hour.toString().padStart(2, "0");
        }
        result = result.replace(/HH/g, hour);
      } else if (format.includes("H")) {
        // 24-hour format, no leading zero
        if (partMap.dayPeriod) {
          // Convert from 12-hour to 24-hour
          hour = parseInt(hour);
          if (partMap.dayPeriod.toLowerCase() === "pm" && hour < 12) {
            hour += 12;
          } else if (partMap.dayPeriod.toLowerCase() === "am" && hour === 12) {
            hour = 0;
          }
          hour = hour.toString();
        }
        result = result.replace(/H/g, hour);
      } else if (format.includes("hh")) {
        // 12-hour format, ensure 2 digits
        result = result.replace(/hh/g, hour);
      } else if (format.includes("h")) {
        // 12-hour format, no leading zero
        result = result.replace(/h/g, hour ? hour.replace(/^0/, "") : "");
      }

      // Minute
      result = result.replace(/mm/g, partMap.minute || "00");
      result = result.replace(
        /m/g,
        partMap.minute ? partMap.minute.replace(/^0/, "") : "0"
      );

      // Second
      result = result.replace(/ss/g, partMap.second || "00");
      result = result.replace(
        /s/g,
        partMap.second ? partMap.second.replace(/^0/, "") : "0"
      );

      // AM/PM
      result = result.replace(
        /A/g,
        partMap.dayPeriod ? partMap.dayPeriod.toUpperCase() : ""
      );
      result = result.replace(
        /a/g,
        partMap.dayPeriod ? partMap.dayPeriod.toLowerCase() : ""
      );

      // Timezone
      result = result.replace(/z/g, partMap.timeZoneName || "");

      return result;
    },

    // Force an immediate update of all time elements
    refreshAllTimes: function () {
      this.updateAllTimes();
    },

    // Set a new update frequency (milliseconds)
    setUpdateFrequency: function (milliseconds) {
      this.updateFrequency = milliseconds;
      this.setupUpdateInterval();
    },
  };

  // Multiple ways to activate the initializer

  // Handle Swup transitions explicitly
  document.addEventListener("swup:contentReplaced", () => {
    console.log("Time: Swup content replaced event detected");
    setTimeout(() => {
      TimeAutoInitializer.initialize();
    }, 100);
  });

  // Initialize on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Time: DOMContentLoaded event detected");
    TimeAutoInitializer.initialize();
    TimeAutoInitializer.startObserving();
  });

  // Fallback if DOM is already loaded
  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    console.log("Time: Document already loaded, initializing directly");
    setTimeout(() => {
      TimeAutoInitializer.initialize();
      TimeAutoInitializer.startObserving();
    }, 100);
  }

  // Store in global scope for debugging
  window.TimeAutoInitializer = TimeAutoInitializer;
})();

// Standard App namespace for compatibility with other components
window.App = window.App || {};
window.App.Time = {
  // Track elements with time attributes
  elements: [],
  // Store update interval reference
  updateInterval: null,
  // Default update frequency (in milliseconds)
  updateFrequency: 30000, // 30 seconds

  initialize: function () {
    if (window.TimeAutoInitializer) {
      window.TimeAutoInitializer.initialize();
    }
  },

  // Force an immediate update of all time elements
  refreshAllTimes: function () {
    if (window.TimeAutoInitializer) {
      window.TimeAutoInitializer.refreshAllTimes();
    }
  },

  // Set a new update frequency (milliseconds)
  setUpdateFrequency: function (milliseconds) {
    if (window.TimeAutoInitializer) {
      window.TimeAutoInitializer.setUpdateFrequency(milliseconds);
    }
  },
};
