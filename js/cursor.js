class BrutalCursor {
    constructor() {
        this.cursor = document.getElementById("cursor");
        this.stage = document.getElementById("heroVideoStage");
        this.trails = [];
        this.pointer = { x: 0, y: 0 };
        this.frame = 0;
        this.magnetTarget = null;
        this.canUseCursor = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        if (!this.cursor || !this.canUseCursor) {
            return;
        }

        this.renderTrail();
        this.bindEvents();
    }

    renderTrail() {
        for (let index = 0; index < 4; index += 1) {
            const dot = document.createElement("span");
            dot.className = "cursor-trail";
            dot.style.setProperty("--trail-index", String(index));
            document.body.append(dot);
            this.trails.push({ node: dot, x: 0, y: 0 });
        }
    }

    scheduleRender() {
        if (!this.frame) {
            this.frame = window.requestAnimationFrame(() => this.render());
        }
    }

    render() {
        this.frame = 0;
        this.cursor.style.transform = `translate3d(${this.pointer.x - 10}px, ${this.pointer.y - 10}px, 0)`;
        document.documentElement.style.setProperty("--cursor-x", `${this.pointer.x}px`);
        document.documentElement.style.setProperty("--cursor-y", `${this.pointer.y}px`);

        let trailing = false;
        this.trails.forEach((trail, index) => {
            const leader = index === 0 ? this.pointer : this.trails[index - 1];
            trail.x += (leader.x - trail.x) * (0.26 - index * 0.025);
            trail.y += (leader.y - trail.y) * (0.26 - index * 0.025);
            trail.node.style.transform = `translate3d(${trail.x - 4}px, ${trail.y - 4}px, 0)`;
            trailing ||= Math.abs(leader.x - trail.x) + Math.abs(leader.y - trail.y) > 0.3;
        });

        this.updateMagnet();
        if (trailing) {
            this.scheduleRender();
        }
    }

    updateMagnet() {
        if (!this.magnetTarget) {
            return;
        }

        const rect = this.magnetTarget.getBoundingClientRect();
        const x = this.pointer.x - (rect.left + rect.width / 2);
        const y = this.pointer.y - (rect.top + rect.height / 2);
        this.magnetTarget.style.setProperty("--magnet-x", `${(x * 0.055).toFixed(2)}px`);
        this.magnetTarget.style.setProperty("--magnet-y", `${(y * 0.055).toFixed(2)}px`);
    }

    setMagnetTarget(target) {
        if (target === this.magnetTarget) {
            return;
        }

        if (this.magnetTarget) {
            this.magnetTarget.style.setProperty("--magnet-x", "0px");
            this.magnetTarget.style.setProperty("--magnet-y", "0px");
        }
        this.magnetTarget = target;
    }

    bindEvents() {
        document.addEventListener("pointermove", (event) => {
            this.cursor.classList.add("is-visible");
            this.pointer.x = event.clientX;
            this.pointer.y = event.clientY;
            this.setMagnetTarget(event.target.closest?.(".hero-explore, .dossier-card, .museum-marker, .process-step, .shoe-hotspot, .faq-prompt, .final-replay") || null);
            this.scheduleRender();
        }, { passive: true });

        document.addEventListener("mouseleave", () => this.setMagnetTarget(null));
        this.bindStageCursor();
    }

    bindStageCursor() {
        if (!this.stage) {
            return;
        }

        this.stage.addEventListener("mouseenter", () => {
            Object.assign(this.cursor.style, {
                width: "146px",
                height: "38px",
                borderRadius: "0",
                background: "#F4A0B8",
                color: "#3E2723",
                fontWeight: "bold",
                fontFamily: "Impact, sans-serif",
                fontSize: "10px",
                letterSpacing: "1.5px"
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
}

window.addEventListener("DOMContentLoaded", () => new BrutalCursor());
