// video-loop-handler.js - Ensures looping videos play correctly after transitions
window.App = window.App || {};
window.App.VideoLoopHandler = {
  debug: true,

  log: function (...args) {
    if (this.debug) {
      console.log("[VideoLoopHandler]", ...args);
    }
  },

  playAllLoopingVideos: function () {
    // Find all videos with the data-dt-video-loop attribute
    const loopingVideos = document.querySelectorAll(
      'video[data-dt-video-loop="true"]'
    );
    this.log(`Found ${loopingVideos.length} looping videos on page`);

    if (!loopingVideos.length) return;

    // For each video, ensure it's playing
    loopingVideos.forEach((video, index) => {
      // First check the current state
      const isPlaying = !!(
        video.currentTime > 0 &&
        !video.paused &&
        !video.ended &&
        video.readyState > 2
      );

      if (!isPlaying) {
        this.log(`Video ${index + 1} is not playing, attempting to start it`);

        // Ensure proper attributes are set
        video.loop = true;
        video.muted = true;
        video.playsInline = true;

        // Try to play the video
        try {
          // For mobile Safari, sometimes we need to load() before play()
          video.load();

          const playPromise = video.play();

          // Handle promise to avoid uncaught promise errors
          if (playPromise !== undefined) {
            playPromise.catch((error) => {
              this.log(`Error playing video ${index + 1}:`, error);

              // Special handling for mobile devices
              if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
                this.log(
                  "Mobile device detected, trying alternative play method"
                );

                // Add a small timeout and try again
                setTimeout(() => {
                  video.load();
                  video
                    .play()
                    .catch((e) =>
                      this.log(
                        `Second attempt to play video ${index + 1} failed:`,
                        e
                      )
                    );
                }, 100);
              }
            });
          }
        } catch (error) {
          this.log(`Exception trying to play video ${index + 1}:`, error);
        }
      } else {
        this.log(`Video ${index + 1} is already playing`);
      }
    });
  },

  initialize: function () {
    this.log("Initializing video loop handler");
    this.playAllLoopingVideos();

    // Set up an observer to detect if videos get paused unexpectedly
    this.setupVideoObserver();
  },

  setupVideoObserver: function () {
    // Clean up any existing observer
    if (
      window.videoLoopObserver &&
      typeof window.videoLoopObserver.disconnect === "function"
    ) {
      window.videoLoopObserver.disconnect();
    }

    // Create a mutation observer to watch for video state changes
    const loopingVideos = document.querySelectorAll(
      'video[data-dt-video-loop="true"]'
    );
    if (!loopingVideos.length) return;

    // For each video, add a 'pause' event listener to restart it if it stops
    loopingVideos.forEach((video) => {
      // Remove any existing listeners to avoid duplicates
      video.removeEventListener("pause", this.handleVideoPause);

      // Add the event listener
      video.addEventListener("pause", this.handleVideoPause);
    });

    this.log("Video observers set up");
  },

  handleVideoPause: function (event) {
    // Check if this is a looping video that should be playing
    const video = event.target;
    if (
      video.getAttribute("data-dt-video-loop") === "true" &&
      !video.ended &&
      document.visibilityState !== "hidden"
    ) {
      console.log(
        "[VideoLoopHandler] Looping video was paused unexpectedly, restarting"
      );

      // Try to restart the video
      setTimeout(() => {
        video
          .play()
          .catch((error) =>
            console.log(
              "[VideoLoopHandler] Error restarting paused video:",
              error
            )
          );
      }, 100);
    }
  },

  reinitialize: function () {
    this.log("Reinitializing video loop handler after page transition");

    // Add a small delay to ensure DOM is ready
    setTimeout(() => {
      this.initialize();
    }, 200);

    // Add another attempt a bit later for slower devices
    setTimeout(() => {
      this.playAllLoopingVideos();
    }, 1000);
  },
};
