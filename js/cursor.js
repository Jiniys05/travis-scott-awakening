class BrutalCursor {
    constructor() {
        this.cursor = document.getElementById("cursor");
        this.stage = document.getElementById("heroVideoStage");
        this.trails = [];
        this.pointer = { x: 0, y: 0 };
        this.frame = 0;
        this.lastTarget = null;
        this.canUseCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        if (!this.cursor || !this.canUseCursor) {
            return;
        }

        this.renderTrail();
        this.bindEvents();
    }

    renderTrail() {
        for (let index = 0; index < 5; index += 1) {
            const dot = document.createElement("span");
            dot.className = "cursor-trail";
            dot.style.setProperty("--trail-index", String(index));
            document.body.append(dot);
            this.trails.push({ node: dot, x: 0, y: 0 });
        }
    }

    settleTrail() {
        this.frame = 0;
        let moving = false;

        this.trails.forEach((trail, index) => {
            const leader = index === 0 ? this.pointer : this.trails[index - 1];
            trail.x += (leader.x - trail.x) * (0.26 - index * 0.02);
            trail.y += (leader.y - trail.y) * (0.26 - index * 0.02);
            trail.node.style.transform = `translate3d(${trail.x - 4}px, ${trail.y - 4}px, 0)`;
            moving ||= Math.abs(leader.x - trail.x) + Math.abs(leader.y - trail.y) > 0.3;
        });

        if (moving) {
            this.frame = requestAnimationFrame(() => this.settleTrail());
        }
    }

    scheduleTrail() {
        if (!this.frame) {
            this.frame = requestAnimationFrame(() => this.settleTrail());
        }
    }

    bindEvents() {
        document.addEventListener("pointermove", (event) => {
            this.cursor.classList.add("is-visible");
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
            this.cursor.style.transform = `translate3d(${event.clientX - 10}px, ${event.clientY - 10}px, 0)`;
            document.documentElement.style.setProperty("--cursor-x", `${event.clientX}px`);
            document.documentElement.style.setProperty("--cursor-y", `${event.clientY}px`);
            this.scheduleTrail();
            this.updateMagnet(event);
        }, { passive: true });

        document.addEventListener("mouseleave", () => this.resetMagnet());
        this.bindStageCursor();
    }

    bindStageCursor() {
        if (!this.stage) {
            return;
        }

        this.stage.addEventListener("mouseenter", () => {
            Object.assign(this.cursor.style, {
                width: "158px",
                height: "42px",
                borderRadius: "0",
                background: "#F4A0B8",
                color: "#3E2723",
                fontWeight: "bold",
                fontFamily: "Impact, sans-serif",
                fontSize: "11px",
                letterSpacing: "1.7px"
            });
            this.cursor.textContent = "ARCHIVE FILM";
            document.body.classList.add("cursor-live");
        });

        this.stage.addEventListener("mouseleave", () => {
            Object.assign(this.cursor.style, {
                width: "20px",
                height: "20px",
                borderRadius: "0",
                background: "transparent",
                color: "transparent"
            });
            this.cursor.textContent = "";
            document.body.classList.remove("cursor-live");
        });
    }

    updateMagnet(event) {
        const target = event.target.closest?.(".hero-explore, .shoe-item, .faq-question, .source-note");
        if (this.lastTarget && this.lastTarget !== target) {
            this.lastTarget.style.setProperty("--magnet-x", "0px");
            this.lastTarget.style.setProperty("--magnet-y", "0px");
        }

        if (!target) {
            this.lastTarget = null;
            return;
        }

        const rect = target.getBoundingClientRect();
        const x = event.clientX - (rect.left + rect.width / 2);
        const y = event.clientY - (rect.top + rect.height / 2);
        target.style.setProperty("--magnet-x", `${(x * 0.07).toFixed(2)}px`);
        target.style.setProperty("--magnet-y", `${(y * 0.07).toFixed(2)}px`);
        this.lastTarget = target;
    }

    resetMagnet() {
        if (!this.lastTarget) {
            return;
        }
        this.lastTarget.style.setProperty("--magnet-x", "0px");
        this.lastTarget.style.setProperty("--magnet-y", "0px");
        this.lastTarget = null;
    }
}

window.addEventListener("DOMContentLoaded", () => new BrutalCursor());
