// Service slider module optimized for Swup page transitions
let sliderInstances = [];

export function initializeServiceSlider() {
  console.log("Service Slider: Initializing...");
  
  // Clean up any previous instances to prevent memory leaks
  cleanupPreviousInstances();
  
  // Initialize new instance
  const instance = createSliderInstance();
  if (instance) {
    sliderInstances.push(instance);
  }
}

function cleanupPreviousInstances() {
  sliderInstances.forEach(instance => {
    if (instance && instance.cleanup) {
      instance.cleanup();
    }
  });
  sliderInstances = [];
  console.log("Service Slider: Cleaned up previous instances");
}

function createSliderInstance() {
  // Find the slider elements
  const buttonWrapper = document.getElementById("service-overview-button-wrapper");
  if (!buttonWrapper) {
    console.log("Service Slider: Button wrapper not found");
    return null;
  }
  
  const buttons = buttonWrapper.querySelectorAll(".service-overview-button");
  if (!buttons.length) {
    console.log("Service Slider: No buttons found");
    return null;
  }
  
  const sliderContainer = document.querySelector(".service-overview-slider");
  if (!sliderContainer) {
    console.log("Service Slider: Slider container not found");
    return null;
  }
  
  // Find or create slider nav
  let sliderNav = sliderContainer.querySelector(".w-slider-nav");
  if (!sliderNav || sliderNav.classList.contains("hide")) {
    // If slider nav is hidden, we'll need to interact with Webflow's internal slider
    // Find all slides to determine how many dots we need
    const slides = sliderContainer.querySelectorAll(".w-slide");
    
    // Try to unhide existing nav
    if (sliderNav) {
      sliderNav.classList.remove("hide");
      console.log("Service Slider: Unhiding existing slider nav");
    }
    
    // If we still don't have a working nav, we'll need to work directly with Webflow's slider API
    if (!sliderNav || sliderNav.querySelectorAll(".w-slider-dot").length === 0) {
      console.log("Service Slider: Using Webflow API fallback");
      return createWebflowApiInstance(buttons, sliderContainer, slides.length);
    }
  }
  
  const sliderDots = sliderNav.querySelectorAll(".w-slider-dot");
  if (!sliderDots.length) {
    console.log("Service Slider: No slider dots found");
    return null;
  }
  
  console.log(`Service Slider: Found ${buttons.length} buttons and ${sliderDots.length} dots`);
  
  // Set up state
  const state = {
    activeIndex: 0,
    observer: null,
    eventHandlers: []
  };
  
  // Create a force sync function to ensure buttons and dots are in sync
  function syncActiveState(index) {
    console.log(`Service Slider: Syncing state to index ${index}`);
    
    // Update buttons
    buttons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    
    // Update dots
    sliderDots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add("w-active");
      } else {
        dot.classList.remove("w-active");
      }
    });
    
    state.activeIndex = index;
  }
  
  // Function to programmatically activate slide
  function activateSlide(index) {
    console.log(`Service Slider: Activating slide ${index}`);
    
    if (index < 0 || index >= sliderDots.length) {
      console.warn(`Service Slider: Invalid index ${index}`);
      return;
    }
    
    // First sync the visual state
    syncActiveState(index);
    
    // Then trigger the actual slide change
    if (sliderDots[index]) {
      // Try to click the dot (normal approach)
      sliderDots[index].click();
      
      // Fallback: Try to trigger Webflow's slider directly
      tryWebflowFallback(sliderContainer, index);
    }
  }
  
  // Set up button click handlers
  buttons.forEach((button, index) => {
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      activateSlide(index);
    };
    
    // Add handler
    button.addEventListener("click", clickHandler);
    button.addEventListener("touchend", clickHandler, { passive: false });
    
    // Store for cleanup
    state.eventHandlers.push({ element: button, type: "click", handler: clickHandler });
    state.eventHandlers.push({ element: button, type: "touchend", handler: clickHandler });
  });
  
  // Set up mutation observer to monitor slider state changes
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && 
          mutation.attributeName === "class" && 
          mutation.target.classList.contains("w-slider-dot")) {
          
        // Find which dot is active
        const newActiveIndex = Array.from(sliderDots).findIndex(dot => 
          dot.classList.contains("w-active")
        );
        
        if (newActiveIndex !== -1 && newActiveIndex !== state.activeIndex) {
          console.log(`Service Slider: Detected dot change to ${newActiveIndex}`);
          syncActiveState(newActiveIndex);
        }
      }
    }
  });
  
  // Start observing
  observer.observe(sliderNav, {
    attributes: true,
    attributeFilter: ["class"],
    subtree: true
  });
  
  state.observer = observer;
  
  // Initialize to the first slide (or currently active slide)
  const initialActiveIndex = Array.from(sliderDots).findIndex(dot => 
    dot.classList.contains("w-active")
  );
  
  setTimeout(() => {
    syncActiveState(initialActiveIndex !== -1 ? initialActiveIndex : 0);
  }, 100);
  
  // Add resize handler
  const resizeHandler = () => {
    syncActiveState(state.activeIndex);
  };
  
  window.addEventListener("resize", resizeHandler);
  state.eventHandlers.push({ element: window, type: "resize", handler: resizeHandler });
  
  // Return instance with cleanup method
  return {
    activateSlide,
    getCurrentIndex: () => state.activeIndex,
    cleanup: () => {
      // Remove all event handlers
      state.eventHandlers.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      
      // Disconnect observer
      if (state.observer) {
        state.observer.disconnect();
      }
      
      console.log("Service Slider: Instance cleaned up");
    }
  };
}

// If we can't use the dots directly, try using Webflow's internal API
function tryWebflowFallback(sliderContainer, index) {
  try {
    // Attempt to access the Webflow slider API
    if (window.Webflow && Webflow.require) {
      const slider = Webflow.require('slider');
      if (slider && typeof slider.ready === 'function') {
        slider.ready(() => {
          // Find the DOM element that Webflow has attached the slider to
          const mask = sliderContainer.querySelector('.w-slider-mask');
          if (mask && mask.parentElement._component) {
            // Use Webflow's internal goTo method
            mask.parentElement._component.goTo(index);
            console.log(`Service Slider: Successfully used Webflow API to go to slide ${index}`);
            return true;
          }
        });
      }
    }
  } catch (e) {
    console.warn("Service Slider: Webflow API fallback failed:", e);
  }
  return false;
}

// When we need to use Webflow's slider API directly
function createWebflowApiInstance(buttons, sliderContainer, slideCount) {
  console.log("Service Slider: Creating Webflow API instance");
  
  const state = {
    activeIndex: 0,
    eventHandlers: []
  };
  
  // Function to set active button
  function syncActiveButton(index) {
    buttons.forEach((btn, i) => {
      if (i === index) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    state.activeIndex = index;
  }
  
  // Function to change slide
  function activateSlide(index) {
    if (index < 0 || index >= slideCount) {
      console.warn(`Service Slider: Invalid index ${index}`);
      return;
    }
    
    console.log(`Service Slider: Activating slide ${index} via Webflow API`);
    
    // Update button state
    syncActiveButton(index);
    
    // Try to use Webflow's slider API
    if (window.Webflow && Webflow.require) {
      const slider = Webflow.require('slider');
      if (slider && typeof slider.ready === 'function') {
        slider.ready(() => {
          // Try to find the slider component
          const mask = sliderContainer.querySelector('.w-slider-mask');
          if (mask && mask.parentElement._component) {
            // Use Webflow's internal goTo method
            mask.parentElement._component.goTo(index);
            console.log(`Service Slider: Used Webflow API for slide ${index}`);
          } else {
            // Fallback: manually trigger click events on the arrows
            const arrows = sliderContainer.querySelectorAll('.w-slider-arrow-left, .w-slider-arrow-right');
            if (arrows.length) {
              // Calculate how many clicks we need in which direction
              const direction = index > state.activeIndex ? 'right' : 'left';
              const clicks = Math.abs(index - state.activeIndex);
              
              const arrow = direction === 'right' 
                ? sliderContainer.querySelector('.w-slider-arrow-right')
                : sliderContainer.querySelector('.w-slider-arrow-left');
              
              if (arrow) {
                console.log(`Service Slider: Using arrow clicks (${direction}, ${clicks} times)`);
                
                // Execute clicks with delay
                for (let i = 0; i < clicks; i++) {
                  setTimeout(() => {
                    arrow.click();
                  }, i * 100);
                }
              }
            }
          }
        });
      }
    }
  }
  
  // Set up button handlers
  buttons.forEach((button, index) => {
    const clickHandler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      activateSlide(index);
    };
    
    button.addEventListener("click", clickHandler);
    button.addEventListener("touchend", clickHandler, { passive: false });
    
    state.eventHandlers.push({ element: button, type: "click", handler: clickHandler });
    state.eventHandlers.push({ element: button, type: "touchend", handler: clickHandler });
  });
  
  // Initialize state
  setTimeout(() => {
    syncActiveButton(0);
  }, 100);
  
  // Return instance
  return {
    activateSlide,
    getCurrentIndex: () => state.activeIndex,
    cleanup: () => {
      state.eventHandlers.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      console.log("Service Slider: Webflow API instance cleaned up");
    }
  };
}

// IMPORTANT: Call this function when a page transition occurs with Swup
export function reinitializeServiceSlider() {
  console.log("Service Slider: Reinitializing after page transition");
  setTimeout(() => {
    initializeServiceSlider();
  }, 100); // Small delay to ensure DOM is ready
}