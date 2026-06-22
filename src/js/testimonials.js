function initTestimonialSlider() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const slider = document.getElementById("slider-deck");
  if (!prevBtn || !nextBtn || !slider) return;

  // Updated to match the clean BEM selector from the new HTML
  const cards = document.querySelectorAll(".testimonial-card");
  const len = cards.length;
  if (len === 0) return;

  let activeIndex = 1;
  let startX = 0;

  function updateLayout() {
    cards.forEach((card, index) => {
      card.classList.remove("pos-center", "pos-left", "pos-right");
      
      if (index === activeIndex) {
        card.classList.add("pos-center");
      } else if (index === (activeIndex - 1 + len) % len) {
        card.classList.add("pos-left");
      } else if (index === (activeIndex + 1) % len) {
        card.classList.add("pos-right");
      }
    });
  }

  function goNext() {
    activeIndex = (activeIndex + 1) % len;
    updateLayout();
  }

  function goPrev() {
    activeIndex = (activeIndex - 1 + len) % len;
    updateLayout();
  }

  prevBtn.addEventListener("click", goPrev);
  nextBtn.addEventListener("click", goNext);

  slider.addEventListener(
    "touchstart",
    (event) => {
      startX = event.touches[0].clientX;
    },
    { passive: true }
  );

  slider.addEventListener(
    "touchend",
    (event) => {
      const deltaX = startX - event.changedTouches[0].clientX;
      if (deltaX > 50) goNext();
      else if (deltaX < -50) goPrev();
    },
    { passive: true }
  );

  updateLayout();
}

document.addEventListener("DOMContentLoaded", initTestimonialSlider);
