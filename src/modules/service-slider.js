// Module for service slider functionality with improved reliability
export function initializeServiceSlider() {
    console.log("Service Slider: Initializing...");
  
    // Try multiple selector patterns to ensure we find the elements
    // This makes it more robust across template changes
    const findButtons = () => {
      const selectors = [
        "#service-overview-button-wrapper .service-overview-button",
        ".service-overview-button-wrapper .service-overview-button",
        "[data-button-index]" // Add data attributes as a fallback
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length) {
          console.log(`Service Slider: Found ${elements.length} buttons with selector "${selector}"`);
          return elements;
        }
      }
      
      console.warn("Service Slider: No buttons found!");
      return [];
    };
    
    // Find slider in multiple ways
    const findSlider = () => {
      const selectors = [
        ".service-overview-slider .w-slider-nav",
        ".w-slider-nav",
        ".service-overview-slider [data-slider-nav='true']"
      ];
      
      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);
        for (const el of elements) {
          // Only return if it has slider dots
          if (el.querySelectorAll(".w-slider-dot").length) {
            console.log(`Service Slider: Found slider nav with selector "${selector}"`);
            return el;
          }
        }
      }
      
      console.warn("Service Slider: No slider nav found!");
      return null;
    };
  
    // Get elements using our more robust methods
    const buttons = findButtons();
    const sliderNav = findSlider();
    
    if (!buttons.length || !sliderNav) {
      console.warn("Service Slider: Required elements not found, aborting initialization");
      return;
    }
    
    const sliderDots = sliderNav.querySelectorAll(".w-slider-dot");
    
    if (!sliderDots.length) {
      console.warn("Service Slider: No slider dots found, aborting initialization");
      return;
    }
    
    console.log(`Service Slider: Found ${sliderDots.length} slider dots`);
    
    // Store state on element to avoid global variable conflicts
    const state = {
      activeIndex: 0,
      isInitialized: false,
      observer: null
    };
    
    // Keep a reference to our state
    sliderNav.serviceSliderState = state;
    
    // More aggressive approach to add active class
    function setActiveButton(index) {
      console.log(`Service Slider: Setting active button to index ${index}`);
      
      try {
        // Remove active class from all buttons using multiple approaches
        buttons.forEach((btn) => {
          btn.classList.remove("active");
          btn.classList.remove("is-active");
          btn.classList.remove("w-active");
          
          // Also try setting the attribute directly
          btn.setAttribute("aria-selected", "false");
          
          // If there's a child element that might contain the active state
          const inner = btn.querySelector(".is-active, .active");
          if (inner) inner.classList.remove("active", "is-active");
        });
        
        // Add active class to the target button using multiple approaches
        if (buttons[index]) {
          const btn = buttons[index];
          
          // Try multiple class names
          btn.classList.add("active");
          
          // Also try setting the attribute
          btn.setAttribute("aria-selected", "true");
          
          // If there's a child element that should get the active state
          const inner = btn.querySelector("[data-active-target]");
          if (inner) inner.classList.add("active");
          
          state.activeIndex = index;
          console.log(`Service Slider: Button ${index} activated`);
        }
      } catch (e) {
        console.error("Service Slider: Error setting active button:", e);
      }
    }
    
    // More robust click handler for the slider dots
    function clickDot(index) {
      console.log(`Service Slider: Clicking dot at index ${index}`);
      
      try {
        if (sliderDots[index]) {
          // First try the click event
          sliderDots[index].click();
          
          // As a fallback, try to set the w-active class directly
          sliderDots.forEach(dot => dot.classList.remove("w-active"));
          sliderDots[index].classList.add("w-active");
          
          // Try to find and trigger the actual Webflow slider
          const slider = document.querySelector(".service-overview-slider .w-slider, .w-slider");
          if (slider && window.Webflow && window.Webflow.require) {
            try {
              // This attempts to use Webflow's internal slider API
              const sliderApi = window.Webflow.require('slider');
              if (sliderApi && typeof sliderApi.ready === 'function') {
                sliderApi.ready(function() {
                  // Find the slider element in Webflow's collection
                  const sliderInstance = slider.querySelector('.w-slider-mask');
                  if (sliderInstance && sliderInstance.parentElement._component) {
                    // Use Webflow's internal method to go to slide
                    sliderInstance.parentElement._component.goTo(index);
                    console.log("Service Slider: Used Webflow API to change slide");
                  }
                });
              }
            } catch (err) {
              console.warn("Service Slider: Could not use Webflow API:", err);
            }
          }
        }
      } catch (e) {
        console.error("Service Slider: Error clicking dot:", e);
      }
    }
    
    // Function to activate a button and its corresponding slide
    function activateButton(index) {
      console.log(`Service Slider: Activating button ${index}`);
      
      // Store the active index
      state.activeIndex = index;
      
      // First update button states immediately
      setActiveButton(index);
      
      // Then click the slider dot (with a slight delay to ensure UI is updated)
      setTimeout(() => clickDot(index), 50);
    }
    
    // Better implementation of observer with error handling
    function setupObserver() {
      try {
        // Clean up any existing observer
        if (state.observer) {
          state.observer.disconnect();
        }
        
        state.observer = new MutationObserver((mutations) => {
          try {
            // Look for class changes on slider dots
            const dotClassChange = mutations.find(
              m => m.type === "attributes" && 
                   m.attributeName === "class" && 
                   m.target.classList.contains("w-slider-dot")
            );
            
            if (dotClassChange) {
              // Find which dot is now active
              const activeDotIndex = Array.from(sliderDots).findIndex(
                dot => dot.classList.contains("w-active")
              );
              
              console.log(`Service Slider: Detected dot change, active index is now ${activeDotIndex}`);
              
              if (activeDotIndex !== -1 && activeDotIndex !== state.activeIndex) {
                // Update button UI, but don't click again to avoid loops
                setActiveButton(activeDotIndex);
              }
            }
          } catch (e) {
            console.error("Service Slider: Error in mutation observer:", e);
          }
        });
        
        // Observe the entire slider for changes
        state.observer.observe(sliderNav.closest(".w-slider") || sliderNav, {
          attributes: true,
          attributeFilter: ["class"],
          subtree: true,
          childList: true
        });
        
        console.log("Service Slider: Mutation observer set up");
      } catch (e) {
        console.error("Service Slider: Error setting up observer:", e);
      }
    }
    
    // Set up event listeners for buttons
    buttons.forEach((button, index) => {
      try {
        // Create a proper handler that's bound to the button
        const handleClick = function(e) {
          e.preventDefault();
          e.stopPropagation();
          console.log(`Service Slider: Button ${index} clicked`);
          activateButton(index);
        };
        
        // Store the handler on the button element to avoid duplicate listeners
        button._sliderHandler = button._sliderHandler || handleClick;
        
        // Clean up existing listeners
        button.removeEventListener("click", button._sliderHandler);
        button.removeEventListener("touchend", button._sliderHandler);
        
        // Add our handlers
        button.addEventListener("click", button._sliderHandler);
        button.addEventListener("touchend", button._sliderHandler);
        
        // Also add data-index attribute for debugging
        button.setAttribute("data-button-index", index);
        
        console.log(`Service Slider: Event listeners added to button ${index}`);
      } catch (e) {
        console.error(`Service Slider: Error setting up button ${index}:`, e);
      }
    });
    
    // Set up the observer
    setupObserver();
    
    // Initialize the first button if needed
    if (!state.isInitialized) {
      console.log("Service Slider: First initialization");
      
      // For first init, use a different timing approach
      setTimeout(() => {
        // Check which dot is already active (if any)
        const activeIndex = Array.from(sliderDots).findIndex(
          dot => dot.classList.contains("w-active")
        );
        
        // Use the detected active index or default to 0
        const initialIndex = activeIndex !== -1 ? activeIndex : 0;
        console.log(`Service Slider: Initial active index is ${initialIndex}`);
        
        activateButton(initialIndex);
        state.isInitialized = true;
      }, 300); // Longer timeout for initial setup
    }
    
    // Re-sync on window resize
    const handleResize = () => {
      console.log("Service Slider: Window resized, updating active state");
      setActiveButton(state.activeIndex);
    };
    
    // Clean up old handler if it exists
    window.removeEventListener("resize", sliderNav._resizeHandler);
    
    // Store and add the new handler
    sliderNav._resizeHandler = handleResize;
    window.addEventListener("resize", sliderNav._resizeHandler);
    
    // Also initialize on Webflow's built-in events if available
    if (window.Webflow && Webflow.require) {
      const ix2 = Webflow.require('ix2');
      if (ix2 && ix2.events && ix2.events.on) {
        ix2.events.on('headerLoaded', () => {
          console.log("Service Slider: Reinitializing after IX2 header loaded");
          setTimeout(() => activateButton(state.activeIndex), 200);
        });
      }
    }
    
    return {
      // Expose methods for external control
      goToSlide: activateButton,
      getCurrentIndex: () => state.activeIndex,
      refresh: () => {
        setupObserver();
        setActiveButton(state.activeIndex);
      }
    };
  }