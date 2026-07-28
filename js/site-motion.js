class SiteMotion {
    constructor() {
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        this.depthFrame = 0;

        if (this.prefersReducedMotion) {
            return;
        }

        document.body.classList.add("motion-ready");
        this.prepareRevealTargets();
        this.bindCardTilt();
        this.bindSectionDepth();
        window.addEventListener("site:collection-ready", () => this.bindCardTilt());
    }

    prepareRevealTargets() {
        const selectors = [
            ".dossier-intro",
            ".museum-intro",
            ".process-intro",
            ".explore-intro",
            ".faq-intro",
            ".final-copy"
        ];
        const targets = selectors.flatMap((selector) => [...document.querySelectorAll(selector)]);

        if (!("IntersectionObserver" in window)) {
            targets.forEach((target) => target.classList.add("is-visible"));
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, {
            rootMargin: "0px 0px -10% 0px",
            threshold: 0.12
        });

        targets.forEach((target, index) => {
            target.classList.add("reveal-target");
            target.style.setProperty("--reveal-index", String(index % 6));
            observer.observe(target);
        });
    }

    bindCardTilt() {
        document.querySelectorAll(".shoe-item:not([data-tilt-bound])").forEach((item) => {
            item.dataset.tiltBound = "true";
            item.addEventListener("pointermove", (event) => {
                const rect = item.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                item.style.setProperty("--hover-tilt-x", `${(-y * 4).toFixed(2)}deg`);
                item.style.setProperty("--hover-tilt-y", `${(x * 5).toFixed(2)}deg`);
            }, { passive: true });

            item.addEventListener("pointerleave", () => {
                item.style.setProperty("--hover-tilt-x", "0deg");
                item.style.setProperty("--hover-tilt-y", "0deg");
            });
        });
    }

    bindSectionDepth() {
        const sections = [...document.querySelectorAll(".dossier-deck, .colour-museum, .process-timeline, .explore-shoe, .faq-reel, .final-scene")];
        sections.forEach((section, index) => {
            section.classList.add("section-depth");
            section.style.setProperty("--section-index", String(index));
        });

        const update = () => {
            this.depthFrame = 0;
            if (document.hidden) {
                return;
            }

            const viewport = Math.max(window.innerHeight, 1);
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const progress = Math.min(1, Math.max(-1, (viewport * 0.55 - rect.top) / viewport));
                section.style.setProperty("--section-progress", progress.toFixed(4));
                section.style.setProperty("--section-y", `${(-progress * 18).toFixed(2)}px`);
                section.style.setProperty("--section-blur", `${Math.max(0, Math.abs(progress) - 0.7).toFixed(3)}px`);
            });
        };

        const scheduleUpdate = () => {
            if (!this.depthFrame) {
                this.depthFrame = requestAnimationFrame(update);
            }
        };

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate, { passive: true });
        document.addEventListener("visibilitychange", scheduleUpdate);
        scheduleUpdate();
    }
}

window.addEventListener("DOMContentLoaded", () => new SiteMotion());
