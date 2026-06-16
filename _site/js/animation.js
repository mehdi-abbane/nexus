// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

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

	gsap.to(".agenda-surface", { opacity: 1, duration: 0.1 });
	if (prefersReducedMotion) {

		// 4. Animate the background decoration spinner on its own scroll trigger
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

		gsap.fromTo(
			".sponsors-list",
			{
				opacity: 0,
				// We use y (vertical) instead of x (horizontal).
				// Shifting a marquee horizontally while it runs horizontally creates immediate layout thrashing.
				y: 30,
			},
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

		gsap.set(".highlight-card, .card-number", {
			opacity: 1,
			x: 0,
			clearProps: "all",
		});
		const tl = gsap.timeline({
			defaults: {
				duration: 0.6,
				ease: "power2.out",
			},
		});

		// Step 1: Smoothly reveal overall container container first to avoid layout shifts
		tl.to(".entry-surface", { opacity: 1, duration: 0.3 })

			// Step 2: Animate text layout fields with low pixel bounds to protect core web paint metrics
			.from("#time", { y: -20, opacity: 0 }, "+=0.1")
			.from("#address", { x: 20, opacity: 0 }, "<")

			// Clean waterfall execution chain using structural stagger offsets
			.from("#hero-title", { y: 20, opacity: 0 }, "-=0.2")
			.from("#hero-desc", { y: 20, opacity: 0 }, "-=0.3")
			.from(".hero-spinner", { scale: 0.8, opacity: 0 }, "-=0.4");
		const gridContainer = document.querySelector(".pricing-grid-container");
		const cards = document.querySelectorAll(".pricing-card");

		// The master timeline triggers when the overall wrapper component enters the viewport
		const mainTimeline = gsap.timeline({
			scrollTrigger: {
				trigger: gridContainer,
				start: "top 75%", // Triggers cleanly when the top is comfortably on screen
				toggleActions: "play none none none",
			},
		});

		// Set initial card states instantly before the reveal execution starts
		gsap.set(cards, { opacity: 0 });

		cards.forEach((card, index) => {
			// 1. Calculate bounding coordinates to figure out spatial positioning delta
			const containerRect = gridContainer.getBoundingClientRect();
			const cardRect = card.getBoundingClientRect();

			// 2. Find the strict horizontal visual center of the parent container
			const containerCenterX = containerRect.left + containerRect.width / 2;
			// Find the horizontal visual center of this individual target column
			const cardCenterX = cardRect.left + cardRect.width / 2;

			// 3. Calculate exactly how many pixels left or right this card needs to shift to touch center
			const xOffsetFromCenter = containerCenterX - cardCenterX;

			// 4. On mobile screens (stacked cards), we shift vertically instead of horizontally
			const isMobileStack = window.innerWidth < 1024;
			const positionOffsetFromCenter = isMobileStack ? 60 * index : 0;

			// 5. Build out our fan reveal pipeline timeline
			mainTimeline.fromTo(
				card,
				{
					opacity: 0,
					// If desktop, fly out from exact center coordinates. If mobile, slide up from underneath each other.
					x: isMobileStack ? 0 : xOffsetFromCenter,
					y: isMobileStack ? positionOffsetFromCenter : 0,
					scale: 0.9,
					zIndex: 10 - index, // Stack cards neatly over one another sequentially
				},
				{
					opacity: 1,
					x: 0, // Snaps perfectly out into its natural CSS Column grid position
					y: 0,
					scale: 1,
					duration: 0.8,
					ease: "power3.out",
				},
				index * 0.15, // Elegant delayed stagger reveal mapping
			);
		});

		gsap.to(".slow-spinner", {
			rotation: 360,
			duration: 60,
			ease: "none",
			repeat: -1,
		});
		tl.from(".header-title h3", {
			stagger: 0.15,
			x: -100,
			opacity: 0,
			scrollTrigger: {
				trigger: ".header-title",
				start: "top 80%",
				toggleActions: "play none none none",
			},
		}).from(".header-title p", {
			stagger: 0.15,
			x: 100,
			opacity: 0,
			scrollTrigger: {
				trigger: ".header-title",
				start: "top 80%",
				toggleActions: "play none none none",
			},
		});

		return;
	} else {
		gsap.to(".agenda-surface", { opacity: 1, duration: 0.2 });

		// 2. Grab all individual list items
		const agendaItems = document.querySelectorAll(".agenda-item");

		// 3. Loop through each item and give it an isolated ScrollTrigger
		agendaItems.forEach((item) => {
			gsap.from(item, {
				opacity: 0,
				y: 40,
				clipPath: "inset(0% 0% 100% 0%)", // Premium "wipe down" mask effect
				duration: 0.8,
				ease: "power3.out",
				scrollTrigger: {
					trigger: item, // Each individual <li> triggers itself
					start: "top 85%", // Triggers when the TOP of the item hits 85% of viewport height
					toggleActions: "play none none none", // Plays once when viewed
				},
			});
		});
		gsap.to(".entry-surface", { opacity: 1, duration: 0.2 });
		gsap.to(".pricing-card", { opacity: 1, duration: 0.2 });

		gsap.to(".event-grid-surface", { opacity: 1, duration: 0.3 });

		gsap.to(".speaker-card", { opacity: 1, duration: 0.2 });

		gsap.to(".highlight-card, .card-number", { opacity: 1, duration: 0.2 });
	}

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
				},
			})
			.to(card, {
				opacity: 1,
				duration: 0.4,
				ease: "power1.out",
			})
			.fromTo(
				number,
				{
					opacity: 0,
					x: initialX,
				},
				{
					opacity: 1,
					x: 0,
					duration: 0.8,
					ease: "power2.out",
				},
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
		gsap.set(".event-grid-surface", {
			opacity: 1,
			clearProps: "opacity",
		});

		return;
	}

	gsap
		.timeline({
			scrollTrigger: {
				trigger: ".event-grid-surface",
				start: "top 85%",
				toggleActions: "play none none none",
			},
			defaults: {
				duration: 0.6,
				ease: "power2.out",
			},
		})
		.to(".event-grid-surface", {
			opacity: 1,
			duration: 0.2,
		})
		.from(".main-card", {
			y: 30,
			opacity: 0,
		})
		.from(
			".card-1",
			{
				y: 20,
				opacity: 0,
			},
			"-=0.3",
		)
		.from(
			".card-2",
			{
				y: 20,
				opacity: 0,
			},
			"-=0.4",
		);
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

	const cards = Array.from(document.querySelectorAll(".exact-layout-card"));

	if (!prevBtn || !nextBtn || !slider || cards.length === 0) {
		return;
	}

	let activeIndex = 1;
	let startX = 0;

	function updateLayout() {
		cards.forEach((card, index) => {
			card.classList.remove("pos-center", "pos-left", "pos-right");

			if (index === activeIndex) {
				card.classList.add("pos-center");
			} else if (index === (activeIndex - 1 + cards.length) % cards.length) {
				card.classList.add("pos-left");
			} else if (index === (activeIndex + 1) % cards.length) {
				card.classList.add("pos-right");
			}
		});
	}

	function goNext() {
		activeIndex = (activeIndex + 1) % cards.length;
		updateLayout();
	}

	function goPrev() {
		activeIndex = (activeIndex - 1 + cards.length) % cards.length;

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

	slider.addEventListener("touchend", (event) => {
		const endX = event.changedTouches[0].clientX;
		const deltaX = startX - endX;

		if (deltaX > 50) {
			goNext();
		}

		if (deltaX < -50) {
			goPrev();
		}
	});

	updateLayout();
}

/*
|--------------------------------------------------------------------------
| App Initialization
|--------------------------------------------------------------------------
*/

function initAnimations() {
	const ctx = gsap.context(() => {
		initHighlightCards();
		initEventGridAnimation();
	});

	return ctx;
}

function init() {
	initAnimations();
	initTestimonialSlider();
}

document.addEventListener("DOMContentLoaded", init);
