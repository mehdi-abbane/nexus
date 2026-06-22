import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

// Register Layout Engines
gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * 0. Optimized Smooth Scroll Engine Configuration
 */
function initSmoothScroll() {
    const lenis = new Lenis({
        lerp: 0.06, // Slightly lighter damping reduces layout backlogs
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
    return lenis;
}

/**
 * 1. Hero Section Entrance Animation Core
 */
function initHeroAnimations(ctx) {
    const section = ctx.querySelector(".c-hero-event");
    if (!section) return;

    const meta = section.querySelector(".c-hero-event__meta");
    const title = section.querySelector(".c-hero-event__title");
    const desc = section.querySelector(".c-hero-event__desc");
    const cta = section.querySelector(".c-hero-event__cta");
    const spinner = section.querySelector(".c-hero-event__spinner");

    const hardwareTargets = [meta, title, desc, cta, spinner].filter(Boolean);
    
    // Performance optimization: Never animate layout geometry changes like "width" 
    // Use xPercent or scale instead to keep execution fully on the GPU compositor
    gsap.set(hardwareTargets, { willChange: "transform, opacity" });

    const tl = gsap.timeline({
        defaults: { duration: 0.85, ease: "power4.out" },
    });

    tl.fromTo(section, { opacity: 0 }, { opacity: 1, duration: 1.0 })
        .fromTo(meta, { opacity: 0, y: -15 }, { opacity: 1, y: 0 }, "-=0.2")
        .fromTo(title, { opacity: 0, yPercent: 15, scale: 0.98 }, { opacity: 1, yPercent: 0, scale: 1 }, "-=0.6")
        .fromTo(desc, { opacity: 0, yPercent: 10 }, { opacity: 1, yPercent: 0 }, "-=0.5")
        .fromTo(cta, { opacity: 0, scale: 0.92, yPercent: 10 }, { opacity: 1, scale: 1, yPercent: 0, ease: "back.out(1.4)" }, "-=0.4");

    if (spinner) {
        tl.fromTo(spinner, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, ease: "elastic.out(1, 0.75)", duration: 1.2 }, "-=0.7");
        gsap.to(spinner, { rotation: 360, duration: 25, ease: "none", repeat: -1 });
    }

    tl.eventCallback("onComplete", () => {
        gsap.set(hardwareTargets, { clearProps: "willChange" });
    });
}

/**
 * 2. Agenda Section Isolated Item-Scrub
 */
function initAgendaScrubAnimations(ctx) {
    const section = ctx.querySelector(".c-agenda");
    if (!section) return;

    const headerText = section.querySelector("header h2");
    const items = section.querySelectorAll(".c-agenda__item");
    const spinner = section.querySelector(".c-agenda__spinner");

    if (items.length > 0) gsap.set(items, { opacity: 0, y: 40 });

    if (headerText) {
        const split = new SplitText(headerText, { type: "chars" });
        gsap.fromTo(split.chars,
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.03,
                scrollTrigger: {
                    trigger: headerText,
                    start: "top 90%",
                    end: "top 65%",
                    scrub: true,
                    invalidateOnRefresh: true,
                    // Lifecycle Control: Toggle properties natively on and off offscreen
                    toggleActions: "play none none reverse" 
                }
            }
        );
    }

    items.forEach((item) => {
        gsap.fromTo(item,
            { opacity: 0, y: 40 },
            {
                opacity: 1,
                y: 0,
                ease: "power1.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top bottom-=10%",
                    end: "top center",
                    scrub: true,
                    invalidateOnRefresh: true,
                    // Performance optimization: Automatically toggles hardware acceleration layers
                    fastScrollEnd: true, 
                }
            }
        );
    });

    if (spinner) {
        gsap.fromTo(spinner,
            { rotation: 0, scale: 0.85, opacity: 0.3 },
            {
                rotation: 180,
                scale: 1,
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true,
                    invalidateOnRefresh: true,
                }
            }
        );
    }
}

/**
 * 3. Speakers Section Interactive Scrub & Magnetic Hover Engine
 */
function initSpeakersScrubAnimations(ctx) {
    const section = ctx.querySelector(".c-speakers");
    if (!section) return;

    const cards = section.querySelectorAll(".c-speaker-card");
    const headerText = section.querySelector("header h2");
    if (cards.length === 0) return;

    // PERFORMANCE CRITICAL FIX: Split headers globally ONCE, not iteratively inside your loops
    if (headerText) {
        const splitHeader = new SplitText(headerText, { type: "chars" });
        gsap.fromTo(splitHeader.chars, 
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.03,
                scrollTrigger: {
                    trigger: headerText,
                    start: "top 85%",
                    end: "top 60%",
                    scrub: true,
                    invalidateOnRefresh: true
                }
            }
        );
    }

    cards.forEach((card) => {
        const content = card.querySelector(".c-speaker-card__content");
        const imgWrapper = card.querySelector(".c-speaker-card__image-wrapper");
        const img = card.querySelector(".c-speaker-card__img");

        const scrubTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: "top bottom",
                end: "bottom center",
                scrub: true,
                invalidateOnRefresh: true,
            },
        });

        scrubTimeline
            .fromTo(imgWrapper, { clipPath: "inset(100% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none" }, 0)
            .fromTo(img, { scale: 1.25 }, { scale: 1, ease: "none" }, 0)
            .fromTo(content, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power1.out" }, "-=0.5");

        // High-Performance Pointer Listeners via Overwrite Strategy
        card.addEventListener("mousemove", (e) => {
            const { left, top, width, height } = card.getBoundingClientRect();
            const xRel = (e.clientX - left) / width - 0.5;
            const yRel = (e.clientY - top) / height - 0.5;

            gsap.to(card, { scale: 1.02, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            if (img) {
                gsap.to(img, { x: xRel * 15, y: yRel * 15, duration: 0.3, ease: "power2.out", overwrite: "auto" });
            }
        });

        card.addEventListener("mouseleave", () => {
            gsap.to(card, { scale: 1, duration: 0.4, ease: "power3.out", overwrite: "auto" });
            if (img) {
                gsap.to(img, { x: 0, y: 0, duration: 0.4, ease: "power3.out", overwrite: "auto" });
            }
        });
    });
}

/**
 * 4. Value Proposition Section Responsive Isolated Scrub
 */
function initWhyAttendCenterScrub(ctx) {
    const section = ctx.querySelector(".c-why-attend");
    if (!section) return;

    const header = section.querySelector(".c-why-attend-header");
    const leftCards = section.querySelectorAll(".c-highlight-card--left");
    const rightCards = section.querySelectorAll(".c-highlight-card--right");
    const allNumbers = section.querySelectorAll(".c-highlight-card__number");

    if (header) {
        gsap.fromTo(header, { y: 30, opacity: 0 }, {
            y: 0, opacity: 1,
            scrollTrigger: { trigger: header, start: "top 90%", end: "top 65%", scrub: true, invalidateOnRefresh: true }
        });
    }

    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        leftCards.forEach((card) => {
            gsap.fromTo(card, { opacity: 0, x: -60 }, {
                opacity: 1, x: 0, ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "bottom center", scrub: true, invalidateOnRefresh: true }
            });
        });

        rightCards.forEach((card) => {
            gsap.fromTo(card, { opacity: 0, x: 60 }, {
                opacity: 1, x: 0, ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom", end: "bottom center", scrub: true, invalidateOnRefresh: true }
            });
        });
    });

    mm.add("(max-width: 768px)", () => {
        [...leftCards, ...rightCards].forEach((card) => {
            gsap.fromTo(card, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, ease: "none",
                scrollTrigger: { trigger: card, start: "top bottom-=10%", end: "top center", scrub: true, invalidateOnRefresh: true }
            });
        });
    });

    allNumbers.forEach((num) => {
        gsap.fromTo(num, { y: 20, scale: 0.9 }, {
            y: -10, scale: 1, ease: "none",
            scrollTrigger: { trigger: num, start: "top bottom", end: "bottom top", scrub: true, invalidateOnRefresh: true }
        });
    });
}

/**
 * 5. Ticket Configuration Section Responsive Isolated Scrub
 */
function initPricingCenterScrub(ctx) {
    const section = ctx.querySelector(".pricing-section");
    if (!section) return;

    const title = section.querySelector(".pricing-title");
    const cards = section.querySelectorAll(".pricing-card");

    if (title) {
        gsap.fromTo(title, { opacity: 0, y: 30 }, {
            opacity: 1, y: 0, ease: "none",
            scrollTrigger: { trigger: title, start: "top 90%", end: "top 70%", scrub: true, invalidateOnRefresh: true }
        });
    }

    cards.forEach((card) => {
        gsap.fromTo(card, { opacity: 0, y: 60, scale: 0.95 }, {
            opacity: 1, y: 0, scale: 1, ease: "none",
            scrollTrigger: {
                trigger: card,
                start: "top bottom-=10%",
                end: "top center",
                scrub: true,
                invalidateOnRefresh: true
            }
        });
    });
}

/**
 * 6. Contact Form Grid Block Center-Scrub
 */
function initContactCenterScrub(ctx) {
    const section = ctx.querySelector(".contact-section");
    if (!section) return;

    const infoBlock = section.querySelector(".contact-info");
    const contactCard = section.querySelector(".contact-card");
    const mapWrapper = section.querySelector(".map-wrapper");

    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
        const tl = gsap.timeline({
            scrollTrigger: { trigger: section, start: "top bottom", end: "center center", scrub: true, invalidateOnRefresh: true },
        });
        if (infoBlock) tl.fromTo(infoBlock, { opacity: 0, x: -50 }, { opacity: 1, x: 0, ease: "none" }, 0);
        if (contactCard) tl.fromTo(contactCard, { opacity: 0, x: 50 }, { opacity: 1, x: 0, ease: "none" }, 0);
        if (mapWrapper) tl.fromTo(mapWrapper, { opacity: 0, y: 40, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, ease: "none" }, 0.15);
    });

    mm.add("(max-width: 768px)", () => {
        [infoBlock, contactCard, mapWrapper].forEach((element) => {
            if (!element) return;
            gsap.fromTo(element, { opacity: 0, y: 30 }, {
                opacity: 1, y: 0, ease: "none",
                scrollTrigger: { trigger: element, start: "top bottom-=5%", end: "top center", scrub: true, invalidateOnRefresh: true }
            });
        });
    });
}

/**
 * Consolidated Execution Pipeline
 */
function initGlobalAnimations() {
    const context = document.body;

    initSmoothScroll();
    initHeroAnimations(context);
    initAgendaScrubAnimations(context);
    initSpeakersScrubAnimations(context);
    initWhyAttendCenterScrub(context);
    initPricingCenterScrub(context);
    initContactCenterScrub(context);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initGlobalAnimations);
} else {
    initGlobalAnimations();
}
