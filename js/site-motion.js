class SiteMotion {
    constructor() {
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (this.prefersReducedMotion) {
            return;
        }

        document.body.classList.add("motion-ready");
        this.prepareRevealTargets();
        this.bindCardTilt();
        this.bindSectionDepth();
    }

    prepareRevealTargets() {
        const selectors = [
            ".tech-text",
            ".dossier-panel",
            ".collection-title",
            ".release-title",
            ".release-cell",
            ".faq-title",
            ".faq-list article"
        ];

        const targets = selectors.flatMap((selector) => Array.from(document.querySelectorAll(selector)));

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
            rootMargin: "0px 0px -12% 0px",
            threshold: 0.16
        });

        targets.forEach((target, index) => {
            target.classList.add("reveal-target");
            target.style.setProperty("--reveal-index", String(index % 6));
            observer.observe(target);
        });
    }

    bindCardTilt() {
        document.querySelectorAll(".shoe-item:not(.is-framer-motion)").forEach((item) => {
            item.addEventListener("pointermove", (event) => {
                const rect = item.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;

                item.style.setProperty("--hover-tilt-x", `${(-y * 7).toFixed(2)}deg`);
                item.style.setProperty("--hover-tilt-y", `${(x * 9).toFixed(2)}deg`);
            });

            item.addEventListener("pointerleave", () => {
                item.style.setProperty("--hover-tilt-x", "0deg");
                item.style.setProperty("--hover-tilt-y", "0deg");
            });
        });
    }

    bindSectionDepth() {
        const sections = [...document.querySelectorAll(".tech, .collection, .release-slide, .faq-slide")];
        sections.forEach((section, index) => {
            section.classList.add("section-depth");
            section.style.setProperty("--section-index", String(index));
        });

        const update = () => {
            const viewport = Math.max(window.innerHeight, 1);
            sections.forEach((section) => {
                const rect = section.getBoundingClientRect();
                const progress = Math.min(1, Math.max(-1, (viewport * 0.55 - rect.top) / viewport));
                section.style.setProperty("--section-progress", progress.toFixed(4));
                section.style.setProperty("--section-y", `${(-progress * 36).toFixed(2)}px`);
                section.style.setProperty("--section-blur", `${Math.max(0, Math.abs(progress) - 0.55).toFixed(3)}px`);
            });
            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    }
}

window.addEventListener("DOMContentLoaded", () => new SiteMotion());
