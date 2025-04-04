// Simple module for service slider functionality
export function initializeServiceSlider() {
    console.log("ServiceSlider: Initializing...");
    
    try {
      // Find elements
      const section = document.querySelector("#service-overview-section");
      console.log("ServiceSlider: Looking for service section:", section ? "FOUND" : "NOT FOUND");
      if (!section) {
        console.log("ServiceSlider: Exiting - section not found");
        return;
      }
    
      const buttons = document.querySelectorAll(
        "#service-overview-button-wrapper .service-overview-button"
      );
      console.log(`ServiceSlider: Found ${buttons.length} buttons`);
      
      const sliderDots = document.querySelectorAll(".w-slider-nav .w-slider-dot");
      console.log(`ServiceSlider: Found ${sliderDots.length} slider dots`);
      
      if (!buttons.length || !sliderDots.length) {
        console.log("ServiceSlider: Exiting - missing buttons or dots");
        return;
      }
    
      // Set initial active state based on the active dot
      const activeIndex = Array.from(sliderDots).findIndex(dot => 
        dot.classList.contains("w-active")
      );
      console.log(`ServiceSlider: Initial active dot index: ${activeIndex}`);
      
      if (activeIndex >= 0 && buttons[activeIndex]) {
        console.log(`ServiceSlider: Setting initial active button to ${activeIndex}`);
        buttons.forEach(btn => btn.classList.remove("active"));
        buttons[activeIndex].classList.add("active");
      } else {
        console.log("ServiceSlider: No active dot found or matching button");
      }
    
      // Set up button click handlers
      console.log("ServiceSlider: Setting up button click handlers");
      buttons.forEach((button, index) => {
        button.addEventListener("click", function(e) {
          console.log(`ServiceSlider: Button ${index} clicked`);
          e.preventDefault();
          if (sliderDots[index]) {
            console.log(`ServiceSlider: Clicking dot ${index}`);
            sliderDots[index].click();
          }
          console.log("ServiceSlider: Updating button active states");
          buttons.forEach(btn => btn.classList.remove("active"));
          button.classList.add("active");
        });
      });
    
      // Set up dot click observers
      console.log("ServiceSlider: Creating MutationObserver");
      const observer = new MutationObserver(() => {
        console.log("ServiceSlider: Mutation detected on dots");
        const newActiveIndex = Array.from(sliderDots).findIndex(dot => 
          dot.classList.contains("w-active")
        );
        
        console.log(`ServiceSlider: New active dot index: ${newActiveIndex}`);
        if (newActiveIndex >= 0 && buttons[newActiveIndex]) {
          console.log(`ServiceSlider: Updating button active state to ${newActiveIndex}`);
          buttons.forEach(btn => btn.classList.remove("active"));
          buttons[newActiveIndex].classList.add("active");
        }
      });
      
      // Observe each dot for class changes
      console.log(`ServiceSlider: Starting observation of ${sliderDots.length} dots`);
      sliderDots.forEach((dot, i) => {
        observer.observe(dot, { 
          attributes: true, 
          attributeFilter: ["class"] 
        });
        console.log(`ServiceSlider: Observing dot ${i}`);
      });
      
      console.log("ServiceSlider: Successfully initialized");
      
      // Store observer reference for debugging
      window._serviceSliderObserver = observer;
      
    } catch (error) {
      console.error("ServiceSlider: Error during initialization", error);
    }
  }