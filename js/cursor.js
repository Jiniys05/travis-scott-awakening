class BrutalCursor {
    constructor() {
        this.cursor = document.getElementById("cursor");
        this.stage = document.getElementById("heroVideoStage") || document.getElementById("heroProductStage");
        this.trails = [];
        this.pointer = { x: 0, y: 0 };
        this.renderTrail();
        this.bindEvents();
    }

    renderTrail() {
        if (window.matchMedia("(max-width: 980px)").matches) {
            return;
        }

        for (let index = 0; index < 7; index += 1) {
            const dot = document.createElement("span");
            dot.className = "cursor-trail";
            dot.style.setProperty("--trail-index", String(index));
            document.body.appendChild(dot);
            this.trails.push({ node: dot, x: 0, y: 0 });
        }

        const tick = () => {
            this.trails.forEach((trail, index) => {
                const leader = index === 0 ? this.pointer : this.trails[index - 1];
                trail.x += (leader.x - trail.x) * (0.28 - index * 0.018);
                trail.y += (leader.y - trail.y) * (0.28 - index * 0.018);
                trail.node.style.transform = `translate3d(${trail.x - 4}px, ${trail.y - 4}px, 0)`;
            });
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    bindEvents() {
        document.addEventListener("mousemove", (event) => {
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
            this.cursor.style.transform = `translate3d(${event.clientX - 10}px, ${event.clientY - 10}px, 0)`;
            document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
            document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
        });

        this.bindStageCursor();
        this.bindMagneticTargets();
    }

    bindStageCursor() {
        if (!this.stage) {
            return;
        }

        this.stage.addEventListener("mouseenter", () => {
            this.cursor.style.width = "170px";
            this.cursor.style.height = "45px";
            this.cursor.style.borderRadius = "0";
            this.cursor.style.background = "#F4A0B8";
            this.cursor.style.color = "#3E2723";
            this.cursor.style.fontWeight = "bold";
            this.cursor.style.fontFamily = "Impact, sans-serif";
            this.cursor.style.fontSize = "12px";
            this.cursor.style.letterSpacing = "2px";
            this.cursor.textContent = "VIEW DETAIL";
            document.body.classList.add("cursor-live");
        });

        this.stage.addEventListener("mouseleave", () => {
            this.cursor.style.width = "20px";
            this.cursor.style.height = "20px";
            this.cursor.style.borderRadius = "0";
            this.cursor.style.background = "transparent";
            this.cursor.style.color = "transparent";
            this.cursor.textContent = "";
            document.body.classList.remove("cursor-live");
        });
    }

    bindMagneticTargets() {
        let lastTarget = null;

        document.addEventListener("pointermove", (event) => {
            const target = event.target.closest?.(".hero-angle-button, .shoe-item, .faq-motion-item");

            if (lastTarget && lastTarget !== target) {
                lastTarget.style.setProperty("--magnet-x", "0px");
                lastTarget.style.setProperty("--magnet-y", "0px");
            }

            if (!target) {
                lastTarget = null;
                return;
            }

            const rect = target.getBoundingClientRect();
            const x = event.clientX - (rect.left + rect.width / 2);
            const y = event.clientY - (rect.top + rect.height / 2);
            target.style.setProperty("--magnet-x", `${(x * 0.1).toFixed(2)}px`);
            target.style.setProperty("--magnet-y", `${(y * 0.1).toFixed(2)}px`);
            lastTarget = target;
        });

        document.addEventListener("pointerleave", () => {
            if (!lastTarget) {
                return;
            }
            lastTarget.style.setProperty("--magnet-x", "0px");
            lastTarget.style.setProperty("--magnet-y", "0px");
            lastTarget = null;
        });
    }
}

window.addEventListener("DOMContentLoaded", () => new BrutalCursor());
