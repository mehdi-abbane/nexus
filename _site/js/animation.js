// Register GSAP plugin once globally
gsap.registerPlugin(ScrollTrigger);

// Cache media query lookup
const prefersReducedMotion = window.matchMedia(
	"(prefers-reduced-motion: reduce)",
).matches;

/*
|--------------------------------------------------------------------------
| Highlight Cards Animation
|--------------------------------------------------------------------------
*/
function initHighlightCards() {
	const cards = document.querySelectorAll(".highlight-card");
	if (!cards.length) return;

	// Batch initial opacities to prevent immediate style re-calculations
	gsap.to(".agenda-surface", { opacity: 1, duration: 0.1 });

	if (prefersReducedMotion) {
		// --- REDUCED MOTION PIPELINE ---

		// 4. Background decoration spinner
		gsap.from(".agenda-spinner", {
			opacity: 0,
			scale: 0.7,
			duration: 1.2,
			ease: "power2.out",
			scrollTrigger: {
				trigger: ".agenda-spinner",
				start: "top 90%",
				toggleActions: "play none none none",
			},
		});

		// Sponsors Reveal
		gsap.fromTo(
			".sponsors-list",
			{ opacity: 0, y: 30 },
			{
				opacity: 1,
				y: 0,
				duration: 0.8,
				ease: "power2.out",
				scrollTrigger: {
					trigger: ".sponsors-list",
					start: "top 90%",
					toggleActions: "play none none none",
				},
			},
		);

		// Instantly normalize elements
		gsap.set(".highlight-card, .card-number", {
			opacity: 1,
			x: 0,
			clearProps: "all",
		});

		const tl = gsap.timeline({
			defaults: { duration: 0.6, ease: "power2.out" },
		});

		tl.to(".entry-surface", { opacity: 1, duration: 0.3 })
			.from("#time", { y: -20, opacity: 0 }, "+=0.1")
			.from("#address", { x: 20, opacity: 0 }, "<")
			.from("#hero-title", { y: 20, opacity: 0 }, "-=0.2")
			.from("#hero-desc", { y: 20, opacity: 0 }, "-=0.3")
			.from(".hero-spinner", { scale: 0.8, opacity: 0 }, "-=0.4");

		const gridContainer = document.querySelector(".pricing-grid-container");
		const pricingCards = document.querySelectorAll(".pricing-card");

		if (gridContainer && pricingCards.length) {
			const mainTimeline = gsap.timeline({
				scrollTrigger: {
					trigger: gridContainer,
					start: "top 75%",
					toggleActions: "play none none none",
				},
			});

			gsap.set(pricingCards, { opacity: 0 });

			// FIX: Read layout measurements entirely BEFORE writing to DOM to eliminate layout thrashing
			const isMobileStack = window.innerWidth < 1024;
			const containerRect = gridContainer.getBoundingClientRect();
			const containerCenterX = containerRect.left + containerRect.width / 2;

			// Map calculations array cleanly before animating
			const cardTransforms = Array.from(pricingCards).map((card) => {
				const cardRect = card.getBoundingClientRect();
				const cardCenterX = cardRect.left + cardRect.width / 2;
				return containerCenterX - cardCenterX;
			});

			pricingCards.forEach((card, index) => {
				const xOffsetFromCenter = cardTransforms[index];
				const positionOffsetFromCenter = isMobileStack ? 60 * index : 0;

				mainTimeline.fromTo(
					card,
					{
						opacity: 0,
						x: isMobileStack ? 0 : xOffsetFromCenter,
						y: isMobileStack ? positionOffsetFromCenter : 0,
						scale: 0.9,
						zIndex: 10 - index,
					},
					{
						opacity: 1,
						x: 0,
						y: 0,
						scale: 1,
						duration: 0.8,
						ease: "power3.out",
					},
					index * 0.15,
				);
			});
		}

		// Use standard CSS transitions for endless linear infinite spins instead of GSAP ticks
		gsap.to(".slow-spinner", {
			rotation: 360,
			duration: 60,
			ease: "none",
			repeat: -1,
		});

		const headerTitle = document.querySelector(".header-title");
		if (headerTitle) {
			gsap.from(".header-title h3", {
				stagger: 0.15,
				x: -100,
				opacity: 0,
				scrollTrigger: {
					trigger: headerTitle,
					start: "top 80%",
					toggleActions: "play none none none",
				},
			});
			gsap.from(".header-title p", {
				stagger: 0.15,
				x: 100,
				opacity: 0,
				scrollTrigger: {
					trigger: headerTitle,
					start: "top 80%",
					toggleActions: "play none none none",
				},
			});
		}

		// CRITICAL: Exit function early here so standard interactions aren't accidentally layered below!
		return;
	}

	// --- STANDARD ANIMATION PIPELINE (Reduced Motion is False) ---
	gsap.to(".agenda-surface", { opacity: 1, duration: 0.2 });

	// Use GSAP ScrollTrigger batching instead of loop-generated isolated triggers for major overhead reduction
	ScrollTrigger.batch(".agenda-item", {
		start: "top 85%",
		onEnter: (batch) => {
			gsap.from(batch, {
				opacity: 0,
				y: 40,
				clipPath: "inset(0% 0% 100% 0%)",
				duration: 0.8,
				ease: "power3.out",
				stagger: 0.15,
			});
		},
		once: true,
	});

	gsap.to(
		[".entry-surface", ".pricing-card", ".event-grid-surface", ".speaker-card"],
		{
			opacity: 1,
			duration: 0.2,
			stagger: 0.05,
		},
	);

	// Animate Highlight Cards smoothly
	cards.forEach((card) => {
		const number = card.querySelector(".card-number");
		if (!number) return;

		const side = card.dataset.side;
		const initialX = side === "left" ? -80 : 80;

		gsap.set(card, { opacity: 0 });

		gsap
			.timeline({
				scrollTrigger: {
					trigger: card,
					start: "top 85%",
					toggleActions: "play none none none",
					invalidateOnRefresh: true, // recalculates smoothly on window resizes
				},
			})
			.to(card, {
				opacity: 1,
				duration: 0.4,
				ease: "power1.out",
			})
			.fromTo(
				number,
				{ opacity: 0, x: initialX },
				{ opacity: 1, x: 0, duration: 0.8, ease: "power2.out" },
				"-=0.2",
			);
	});
}

/*
|--------------------------------------------------------------------------
| Event Grid Animation
|--------------------------------------------------------------------------
*/
function initEventGridAnimation() {
	if (prefersReducedMotion) {
		gsap.set(".event-grid-surface", { opacity: 1, clearProps: "opacity" });
		return;
	}

	if (!document.querySelector(".event-grid-surface")) return;

	gsap
		.timeline({
			scrollTrigger: {
				trigger: ".event-grid-surface",
				start: "top 85%",
				toggleActions: "play none none none",
			},
			defaults: { duration: 0.6, ease: "power2.out" },
		})
		.to(".event-grid-surface", { opacity: 1, duration: 0.2 })
		.from(".main-card", { y: 30, opacity: 0 })
		.from(".card-1", { y: 20, opacity: 0 }, "-=0.3")
		.from(".card-2", { y: 20, opacity: 0 }, "-=0.4");
}

/*
|--------------------------------------------------------------------------
| Testimonials Slider
|--------------------------------------------------------------------------
*/
function initTestimonialSlider() {
	const prevBtn = document.getElementById("prev-btn");
	const nextBtn = document.getElementById("next-btn");
	const slider = document.getElementById("slider-deck");
	if (!prevBtn || !nextBtn || !slider) return;

	const cards = document.querySelectorAll(".exact-layout-card");
	const len = cards.length;
	if (len === 0) return;

	let activeIndex = 1;
	let startX = 0;

	// Use a token class on the parent instead of editing classLists on every single item in a loop
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
		{ passive: true },
	);

	slider.addEventListener(
		"touchend",
		(event) => {
			const deltaX = startX - event.changedTouches[0].clientX;
			if (deltaX > 50) goNext();
			else if (deltaX < -50) goPrev();
		},
		{ passive: true }, // Made touchEnd passive since preventDefault isn't called
	);

	updateLayout();
}

/*
|--------------------------------------------------------------------------
| App Initialization
|--------------------------------------------------------------------------
*/
function initAnimations() {
	return gsap.context(() => {
		initHighlightCards();
		initEventGridAnimation();
	});
}

function init() {
	initAnimations();
	initTestimonialSlider();
}

// Check if document is already interactive/complete to avoid missing immediate execution state
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}
