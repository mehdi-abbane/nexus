/**
 * Ultra-Optimized Navigation Architecture (Single-Listener Delegation Engine)
 */
function initUltraNav() {
  const header = document.querySelector(".c-header");
  const toggleBtn = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  const hamburger = document.getElementById("hamburger-icon");
  const closeIcon = document.getElementById("close-icon");

  if (!header || !toggleBtn || !navMenu) return;

  let isMenuOpen = false;
  
  // High-performance pointer to global Lenis instance
  const getLenis = () => window.lenisInstance;

  /**
   * Atomic UI State Synchronizer
   */
  function setNavState(open) {
    if (isMenuOpen === open) return;
    isMenuOpen = open;

    // 1. Structural Accessibility Sync
    toggleBtn.setAttribute("aria-expanded", open.toString());
    toggleBtn.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");

    // 2. Class List Mutation (Triggers Compositor CSS transitions)
    navMenu.classList.toggle("is-active", open);
    toggleBtn.classList.toggle("is-active", open);

    // 3. Instant SVG Swap
    if (hamburger && closeIcon) {
      hamburger.style.display = open ? "none" : "block";
      closeIcon.style.display = open ? "block" : "none";
    }

    // 4. Thread-Lock Layout to Stop Main Thread Layout Recalculation
    const lenis = getLenis();
    if (open) {
      document.body.style.overflow = "hidden";
      if (lenis) lenis.stop();
    } else {
      document.body.style.overflow = "";
      if (lenis) lenis.start();
    }
  }

  // --- O(1) Memory Event Delegation Hub ---
  header.addEventListener("click", (e) => {
    // Treat the closest elements matching targets as the actual hits
    const targetLink = e.target.closest(".c-nav__link");
    const targetToggle = e.target.closest("#menu-toggle");

    if (targetToggle) {
      setNavState(!isMenuOpen);
      return;
    }

    if (targetLink && isMenuOpen) {
      setNavState(false);
    }
  });

  // Global Escape-key clean handler
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen) {
      setNavState(false);
      toggleBtn.focus();
    }
  });
}

// Execution Pipeline Execution
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initUltraNav);
} else {
  initUltraNav();
}
