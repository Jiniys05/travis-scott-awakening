class SiteMotion {
    constructor() {
        this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.depthFrame = 0;
        this.nearbySections = new Set();

        if (this.reducedMotion.matches) {
            return;
        }

        document.body.classList.add("motion-ready");
        this.prepareRevealTargets();
        this.bindSectionDepth();
    }

    prepareRevealTargets() {
        const targets = [
            ".dossier-intro",
            ".museum-intro",
            ".process-intro",
            ".explore-intro",
            ".faq-intro",
            ".final-copy"
        ].flatMap((selector) => [...document.querySelectorAll(selector)]);

        const reveal = (target) => {
            target.classList.add("is-visible");
        };

        if (!("IntersectionObserver" in window)) {
            targets.forEach(reveal);
            return;
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                reveal(entry.target);
                observer.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

        targets.forEach((target, index) => {
            target.classList.add("reveal-target");
            target.style.setProperty("--reveal-index", String(index % 4));
            observer.observe(target);
        });
    }

    bindSectionDepth() {
        const sections = [...document.querySelectorAll(".dossier-deck, .colour-museum, .process-timeline, .explore-shoe, .faq-reel, .final-scene")];
        if (!sections.length) {
            return;
        }

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
            this.nearbySections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const progress = Math.max(-1, Math.min(1, (viewport * 0.52 - rect.top) / viewport));
                section.style.setProperty("--section-y", `${(-progress * 10).toFixed(2)}px`);
                section.style.setProperty("--section-opacity", (0.045 + (1 - Math.abs(progress)) * 0.035).toFixed(3));
            });
        };

        const scheduleUpdate = () => {
            if (!this.depthFrame) {
                this.depthFrame = window.requestAnimationFrame(update);
            }
        };

        if ("IntersectionObserver" in window) {
            const depthObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.nearbySections.add(entry.target);
                    } else {
                        this.nearbySections.delete(entry.target);
                    }
                });
                scheduleUpdate();
            }, { rootMargin: "110% 0px", threshold: 0 });

            sections.forEach((section) => depthObserver.observe(section));
        } else {
            sections.forEach((section) => this.nearbySections.add(section));
        }

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate, { passive: true });
        document.addEventListener("visibilitychange", () => {
            if (!document.hidden) {
                scheduleUpdate();
            }
        });
        scheduleUpdate();
    }
}

window.addEventListener("DOMContentLoaded", () => new SiteMotion());
