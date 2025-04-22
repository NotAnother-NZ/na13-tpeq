(function () {
  const PlyrAutoInitializer = {
    players: {},
    observerActive: false,
    currentContainer: null,
    isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
    isMobileDevice:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ),
    originalStyles: {},
    defaultThemeColor: "#121212",
    defaultBrandColor: "#674A3B",

    startObserving: function () {
      if (this.observerActive) return;
      const observer = new MutationObserver((mutations) => {
        let shouldInitialize = false;
        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1 && node.querySelector) {
                if (
                  node.querySelector("[data-dt-video-url]") ||
                  node.querySelector("[data-dt-video-play]")
                ) {
                  shouldInitialize = true;
                }
              }
            });
          }
        });
        if (shouldInitialize) this.initialize();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      this.observerActive = true;
    },

    initialize: function () {
      this.cleanup();
      const videoTriggers = document.querySelectorAll("[data-dt-video-play]");
      if (videoTriggers.length) {
        videoTriggers.forEach((trigger) => {
          const container = this.findVideoContainer(trigger);
          if (!container) return;
          trigger.setAttribute("data-dt-video-container", container.id);
          if (!trigger._hasVideoClickHandler) {
            trigger.addEventListener("click", (e) => {
              e.preventDefault();
              e.stopPropagation();
              this.handleVideoClick(container);
            });
            trigger._hasVideoClickHandler = true;
          }
        });
      }
      const containers = document.querySelectorAll("[data-dt-video-url]");
      if (containers.length) {
        containers.forEach((container) => {
          if (!container.id) {
            container.id = `dt-video-${Date.now()}-${Math.floor(
              Math.random() * 1000
            )}`;
          }
          this.applyThemeStyles(container);
          this.storeOriginalStyles(container);
          if (!container._hasVideoClickHandler) {
            container.addEventListener("click", (e) => {
              const trigger = e.target.closest("[data-dt-video-play]");
              if (!trigger) {
                e.preventDefault();
                e.stopPropagation();
                this.handleVideoClick(container);
              }
            });
            container._hasVideoClickHandler = true;
          }
          this.ensureVideoElement(container);
        });
      }
    },

    applyThemeStyles: function (container) {
      const themeColor =
        container.getAttribute("data-dt-video-theme") || this.defaultThemeColor;
      const brandColor =
        container.getAttribute("data-dt-video-brand-color") ||
        this.defaultBrandColor;
      const lighterBrandColor = this.lightenColor(brandColor, 0.2);
      const themeId = `plyr-theme-${container.id}`;
      let styleElement = document.getElementById(themeId);
      if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = themeId;
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = `
            #${container.id} .plyr__control:hover,
            #${container.id} .plyr__control[aria-expanded=true] {
              background: ${themeColor} !important;
              color: #fff !important;
            }
            #${
              container.id
            } .plyr--full-ui input[type=range]::-webkit-slider-thumb,
            #${
              container.id
            } .plyr__progress input[type=range]::-webkit-slider-thumb,
            #${
              container.id
            } .plyr__volume input[type=range]::-webkit-slider-thumb {
              background-color: ${brandColor} !important;
            }
            #${container.id} .plyr--full-ui input[type=range]::-moz-range-thumb,
            #${
              container.id
            } .plyr__progress input[type=range]::-moz-range-thumb,
            #${container.id} .plyr__volume input[type=range]::-moz-range-thumb {
              background-color: ${brandColor} !important;
            }
            #${container.id} .plyr--full-ui input[type=range]::-ms-thumb,
            #${container.id} .plyr__progress input[type=range]::-ms-thumb,
            #${container.id} .plyr__volume input[type=range]::-ms-thumb {
              background-color: ${brandColor} !important;
            }
            #${container.id} .plyr__progress__buffer {
              background-color: ${lighterBrandColor} !important;
            }
            #${
              container.id
            } .plyr__progress input[type=range]::-webkit-slider-runnable-track {
              background-color: rgba(${this.hexToRgb(
                lighterBrandColor
              )}, 0.35) !important;
            }
            #${
              container.id
            } .plyr__progress input[type=range]::-moz-range-track {
              background-color: rgba(${this.hexToRgb(
                lighterBrandColor
              )}, 0.35) !important;
            }
            #${container.id} .plyr__progress input[type=range]::-ms-track {
              background-color: rgba(${this.hexToRgb(
                lighterBrandColor
              )}, 0.35) !important;
            }
            #${
              container.id
            } .plyr__volume input[type=range]::-webkit-slider-runnable-track {
              background-color: rgba(${this.hexToRgb(
                brandColor
              )}, 0.6) !important;
            }
            #${container.id} .plyr__volume input[type=range]::-moz-range-track {
              background-color: rgba(${this.hexToRgb(
                brandColor
              )}, 0.6) !important;
            }
            #${container.id} .plyr__volume input[type=range]::-ms-track {
              background-color: rgba(${this.hexToRgb(
                brandColor
              )}, 0.6) !important;
            }
            #${container.id} .plyr--video .plyr__progress__buffer {
              color: ${lighterBrandColor} !important;
            }
            #${container.id} .plyr__control--overlaid {
              background: ${themeColor} !important;
              color: #fff !important;
            }
            #${container.id} .plyr__menu__container {
              background: ${themeColor} !important;
              color: #fff !important;
            }
          `;
    },

    hexToRgb: function (hex) {
      hex = hex.replace(/^#/, "");
      let r, g, b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
      return `${r}, ${g}, ${b}`;
    },

    lightenColor: function (hex, amount) {
      hex = hex.replace(/^#/, "");
      let r, g, b;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
      } else {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
      }
      r = Math.min(255, Math.round(r + (255 - r) * amount));
      g = Math.min(255, Math.round(g + (255 - g) * amount));
      b = Math.min(255, Math.round(b + (255 - b) * amount));
      return `#${r.toString(16).padStart(2, "0")}${g
        .toString(16)
        .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    },

    storeOriginalStyles: function (container) {
      const key = container.id;
      this.originalStyles[key] = {
        container: {
          width: container.style.width,
          height: container.style.height,
          position: container.style.position,
          overflow: container.style.overflow,
        },
      };
      const thumbnail = container.querySelector("[data-dt-video-thumbnail]");
      if (thumbnail) {
        const cs = window.getComputedStyle(thumbnail);
        this.originalStyles[key].thumbnail = {
          display: thumbnail.style.display || "block",
          width: cs.width,
          height: cs.height,
          maxWidth: cs.maxWidth,
          maxHeight: cs.maxHeight,
          objectFit: cs.objectFit,
          cssText: thumbnail.style.cssText,
        };
      }
      const playButton = container.querySelector("[data-dt-video-play]");
      if (playButton) {
        this.originalStyles[key].playButton = {
          display: playButton.style.display || "block",
          cssText: playButton.style.cssText,
        };
      }
    },

    findVideoContainer: function (trigger) {
      let current = trigger;
      while (current) {
        if (current.hasAttribute("data-dt-video-url")) return current;
        current = current.parentElement;
      }
      const wrapper = trigger.closest(".about-video-wrapper");
      if (wrapper && wrapper.hasAttribute("data-dt-video-url")) return wrapper;
      return null;
    },

    ensureVideoElement: function (container) {
      let video = container.querySelector("video.video-element");
      if (!video) {
        video = document.createElement("video");
        video.className = "video-element";
        video.style.display = "none";
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("x-webkit-airplay", "allow");
        video.playsInline = true;
        video.controls = false;
        container.appendChild(video);
      } else {
        video.setAttribute("playsinline", "");
        video.setAttribute("webkit-playsinline", "");
        video.setAttribute("x-webkit-airplay", "allow");
        video.playsInline = true;
      }
      return video;
    },

    handleVideoClick: function (container) {
      if (this.currentContainer && this.currentContainer !== container) {
        this.resetVideoContainer(this.currentContainer);
      }

      // Check for mobile URL first, fall back to standard URL
      let url;
      if (
        this.isMobileDevice &&
        container.hasAttribute("data-dt-video-url-mobile")
      ) {
        url = container.getAttribute("data-dt-video-url-mobile");
      } else {
        url = container.getAttribute("data-dt-video-url");
      }

      if (!url) return;
      const playBtn = container.querySelector("[data-dt-video-play]");
      const thumb = container.querySelector("[data-dt-video-thumbnail]");
      const video = this.ensureVideoElement(container);
      if (container._isPlaying) return;
      if (thumb) thumb.style.visibility = "hidden";
      if (playBtn) playBtn.style.visibility = "hidden";
      video.style.display = "block";
      video.style.position = "absolute";
      video.style.top = "0";
      video.style.left = "0";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      this.currentContainer = container;
      container._isPlaying = true;
      this.initializePlayer(container, video, url);
    },

    initializePlayer: function (container, videoElement, videoUrl) {
      if (this.players[container.id]) {
        try {
          this.players[container.id].destroy();
        } catch {}
        delete this.players[container.id];
      }
      videoElement.innerHTML = "";
      const source = document.createElement("source");
      source.src = videoUrl;
      source.type = this.getVideoType(videoUrl);
      videoElement.appendChild(source);

      if (this.isIOS) {
        videoElement.muted = true;
        const unmute = () => {
          videoElement.muted = false;
          document.removeEventListener("touchstart", unmute);
        };
        document.addEventListener("touchstart", unmute, { once: true });
      }

      if (window.Plyr) {
        try {
          const opts = {
            controls: [
              "play",
              "progress",
              "current-time",
              "mute",
              "volume",
              "fullscreen",
            ],
            fullscreen: { enabled: !this.isIOS },
            autoplay: true,
            muted: this.isIOS,
            loadSprite: true,
            iconUrl: "https://cdn.plyr.io/3.7.8/plyr.svg",
            iconPrefix: "plyr",
            resetOnEnd: false,
            clickToPlay: true,
            blankVideo: "https://cdn.plyr.io/static/blank.mp4",
            playsinline: true,
          };
          this.players[container.id] = new Plyr(videoElement, opts);
          const plyrContainer = container.querySelector(".plyr");
          if (plyrContainer) {
            plyrContainer.classList.add("video-element-plyr-container");
            plyrContainer.style.position = "absolute";
            plyrContainer.style.top = "0";
            plyrContainer.style.left = "0";
            plyrContainer.style.width = "100%";
            plyrContainer.style.height = "100%";
            plyrContainer.style.zIndex = "1";
            const plyrVideo = plyrContainer.querySelector("video");
            if (plyrVideo && plyrVideo !== videoElement) {
              plyrVideo.className = "video-element plyr-video";
              plyrVideo.setAttribute("playsinline", "");
              plyrVideo.setAttribute("webkit-playsinline", "");
              plyrVideo.setAttribute("x-webkit-airplay", "allow");
              plyrVideo.playsInline = true;
              plyrVideo.style.width = "100%";
              plyrVideo.style.height = "100%";
              plyrVideo.style.objectFit = "cover";
            }
          }
          this.players[container.id].on("ended", () =>
            this.resetVideoContainer(container)
          );
          this.players[container.id].on("ready", () => {
            this.players[container.id].play();
            if (this.isIOS) {
              setTimeout(() => {
                try {
                  this.players[container.id].muted = false;
                } catch {}
              }, 500);
            }
          });

          // Add pause event handler to show play button
          this.players[container.id].on("pause", () => {
            // Only show play button if the video is paused but not ended
            if (!this.players[container.id].ended) {
              const playButton = container.querySelector(
                "[data-dt-video-play]"
              );
              if (playButton) playButton.style.visibility = "";
            }
          });

          // Hide play button when video starts playing again
          this.players[container.id].on("play", () => {
            const playButton = container.querySelector("[data-dt-video-play]");
            if (playButton) playButton.style.visibility = "hidden";
          });
        } catch {
          this.fallbackToNativeVideo(videoElement, container);
        }
      } else {
        this.fallbackToNativeVideo(videoElement, container);
      }
    },

    fallbackToNativeVideo: function (videoElement, container) {
      videoElement.className = "video-element";
      videoElement.style.position = "absolute";
      videoElement.style.top = "0";
      videoElement.style.left = "0";
      videoElement.style.zIndex = "1";
      videoElement.setAttribute("playsinline", "");
      videoElement.setAttribute("webkit-playsinline", "");
      videoElement.setAttribute("x-webkit-airplay", "allow");
      videoElement.playsInline = true;
      videoElement.controls = true;
      videoElement.autoplay = true;
      videoElement.style.width = "100%";
      videoElement.style.height = "100%";
      videoElement.style.objectFit = "cover";
      if (this.isIOS) {
        videoElement.muted = true;
        setTimeout(() => {
          try {
            videoElement.muted = false;
          } catch {}
        }, 500);
      }

      // Add event listeners for pause and play
      videoElement.addEventListener("pause", () => {
        if (!videoElement.ended) {
          const playButton = container.querySelector("[data-dt-video-play]");
          if (playButton) playButton.style.visibility = "";
        }
      });

      videoElement.addEventListener("play", () => {
        const playButton = container.querySelector("[data-dt-video-play]");
        if (playButton) playButton.style.visibility = "hidden";
      });

      videoElement.addEventListener("ended", () =>
        this.resetVideoContainer(container)
      );

      this.players[container.id] = {
        element: videoElement,
        destroy: function () {
          if (this.element) {
            this.element.removeEventListener("ended", () => {});
            this.element.removeEventListener("pause", () => {});
            this.element.removeEventListener("play", () => {});
            this.element.pause();
            this.element.src = "";
            this.element.load();
          }
        },
      };
    },

    resetVideoContainer: function (container) {
      if (!container) return;
      const playBtn = container.querySelector("[data-dt-video-play]");
      const thumb = container.querySelector("[data-dt-video-thumbnail]");
      const videoEl = container.querySelector(".video-element");
      if (this.players[container.id]) {
        try {
          this.players[container.id].destroy();
        } catch {}
        delete this.players[container.id];
      }
      const plyrContainer = container.querySelector(".plyr");
      if (plyrContainer && plyrContainer.parentNode) {
        plyrContainer.parentNode.removeChild(plyrContainer);
      }
      if (videoEl) {
        videoEl.pause();
        videoEl.src = "";
        videoEl.load();
        videoEl.style.display = "none";
        videoEl.className = "video-element";
        if (!container.contains(videoEl)) container.appendChild(videoEl);
      }
      if (this.originalStyles[container.id]) {
        const styles = this.originalStyles[container.id];
        if (thumb && styles.thumbnail) {
          thumb.style.visibility = "";
          thumb.style.cssText = styles.thumbnail.cssText;
        }
        if (playBtn && styles.playButton) {
          playBtn.style.visibility = "";
          playBtn.style.cssText = styles.playButton.cssText;
        }
      }
      container._isPlaying = false;
      if (this.currentContainer === container) this.currentContainer = null;
    },

    getVideoType: function (url) {
      const ext = url.split(".").pop().split("?")[0].toLowerCase();
      switch (ext) {
        case "mp4":
          return "video/mp4";
        case "webm":
          return "video/webm";
        case "ogg":
          return "video/ogg";
        default:
          return "video/mp4";
      }
    },

    cleanup: function () {
      Object.keys(this.players).forEach((containerId) => {
        try {
          if (this.players[containerId]) this.players[containerId].destroy();
        } catch {}
      });
      this.players = {};
      if (this.currentContainer) {
        this.resetVideoContainer(this.currentContainer);
        this.currentContainer = null;
      }
    },
  };

  function addCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `
          [data-dt-video-url] { position: relative; }
          .video-element-plyr-container { width:100%!important;height:100%!important;object-fit:cover!important;position:absolute!important;top:0!important;left:0!important;z-index:1!important }
          .plyr video.video-element, .plyr--video .plyr__video-wrapper video.video-element { width:100%!important;height:100%!important;object-fit:cover!important;background:transparent!important }
          .video-element { position:absolute!important;top:0!important;left:0!important;width:100%!important;height:100%!important;z-index:1!important }
          .plyr__controls { background: rgba(0,0,0,0.7)!important; padding:5px 10px!important; border-radius:3px!important }
          .plyr__progress input[type=range], .plyr__volume input[type=range] { height:6px!important }
          .plyr--full-ui input[type=range] { display:block }
        `;
    document.head.appendChild(style);
  }

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    addCustomStyles();
  } else {
    document.addEventListener("DOMContentLoaded", addCustomStyles);
  }

  document.addEventListener("swup:contentReplaced", () => {
    setTimeout(() => PlyrAutoInitializer.initialize(), 100);
  });

  document.addEventListener("DOMContentLoaded", () => {
    PlyrAutoInitializer.initialize();
    PlyrAutoInitializer.startObserving();
  });

  if (
    document.readyState === "complete" ||
    document.readyState === "interactive"
  ) {
    setTimeout(() => {
      PlyrAutoInitializer.initialize();
      PlyrAutoInitializer.startObserving();
    }, 100);
  }

  window.PlyrAutoInitializer = PlyrAutoInitializer;
})();

window.App = window.App || {};
window.App.Plyr = {
  initialize: function () {
    if (window.PlyrAutoInitializer) window.PlyrAutoInitializer.initialize();
  },
  playVideo: function (container) {
    if (window.PlyrAutoInitializer) {
      if (typeof container === "string")
        container = document.getElementById(container);
      if (container) window.PlyrAutoInitializer.handleVideoClick(container);
    }
  },
  resetVideo: function (container) {
    if (window.PlyrAutoInitializer) {
      if (typeof container === "string")
        container = document.getElementById(container);
      if (container) window.PlyrAutoInitializer.resetVideoContainer(container);
    }
  },
};
