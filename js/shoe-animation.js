class TravisScott3D {
    constructor() {
        this.canvas = document.getElementById("three-canvas");
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.1, 100);
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            alpha: true,
            antialias: true
        });

        this.mouse = { x: 0, y: 0 };
        this.target = { x: 0, y: 0 };
        this.drag = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.autoSpin = 0;
        this.scanIntensity = 0;
        this.lastPointer = { x: 0, y: 0 };
        this.isDragging = false;
        this.clock = new THREE.Clock();
        this.prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        this.init();
    }

    init() {
        this.renderer.setSize(innerWidth, innerHeight);
        this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        this.camera.position.set(0, 0.54, 6.35);

        this.shoe = createJordan1Low(this.renderer);
        this.applyResponsiveScale();
        this.shoe.rotation.set(0.08, -0.7, -0.04);
        this.shoe.position.y = -0.18;
        this.scene.add(this.shoe);

        addLighting(this.scene);
        this.particles = createParticles();
        this.scene.add(this.particles);

        this.bindEvents();
        this.animate();
    }

    bindEvents() {
        document.addEventListener("pointermove", (event) => {
            const movementX = event.movementX || event.clientX - this.lastPointer.x;
            const movementY = event.movementY || event.clientY - this.lastPointer.y;
            this.lastPointer.x = event.clientX;
            this.lastPointer.y = event.clientY;

            this.mouse.x = (event.clientX / innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / innerHeight) * 2 + 1;

            if (this.isDragging) {
                this.velocity.x = movementY * 0.0042;
                this.velocity.y = movementX * 0.0105;
                this.drag.x += this.velocity.x;
                this.drag.y += this.velocity.y;
                this.scanIntensity = 1;
            }

            this.drag.x = Math.max(-0.72, Math.min(0.72, this.drag.x));
        });

        this.canvas.addEventListener("pointerdown", (event) => {
            this.isDragging = true;
            this.lastPointer.x = event.clientX;
            this.lastPointer.y = event.clientY;
            this.canvas.setPointerCapture?.(event.pointerId);
        });

        window.addEventListener("pointerup", () => {
            this.isDragging = false;
        });

        window.addEventListener("resize", () => {
            this.camera.aspect = innerWidth / innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(innerWidth, innerHeight);
            this.applyResponsiveScale();
        });
    }

    applyResponsiveScale() {
        const scale = innerWidth < 760 ? 0.5 : innerWidth < 1100 ? 0.76 : 0.92;
        this.shoe.scale.setScalar(scale);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsed = this.clock.getElapsedTime();
        const intro = this.prefersReducedMotion ? 1 : Math.min(elapsed / 1.35, 1);
        const introEase = 1 - Math.pow(1 - intro, 3);
        const introRotationY = -0.42 * (1 - introEase);
        const introLift = -0.18 * (1 - introEase);

        this.autoSpin += this.prefersReducedMotion || this.isDragging ? 0 : 0.0038;
        this.scanIntensity *= 0.94;

        if (!this.isDragging) {
            this.drag.x += this.velocity.x;
            this.drag.y += this.velocity.y;
            this.velocity.x *= 0.9;
            this.velocity.y *= 0.925;
            this.drag.x *= 0.945;
            this.drag.y *= 0.998;
        }

        this.drag.x = Math.max(-0.72, Math.min(0.72, this.drag.x));
        this.target.x = (this.prefersReducedMotion ? 0 : this.mouse.y * 0.075) + this.drag.x;
        this.target.y = this.autoSpin + this.drag.y + (this.prefersReducedMotion ? 0 : this.mouse.x * 0.035);

        const floatY = this.prefersReducedMotion ? 0 : Math.sin(elapsed * 0.86) * 0.065;
        const floatZ = this.prefersReducedMotion ? 0 : Math.sin(elapsed * 0.62) * 0.012;
        this.shoe.rotation.x += (this.target.x - this.shoe.rotation.x) * 0.038;
        this.shoe.rotation.y += (this.target.y + introRotationY - this.shoe.rotation.y) * 0.036;
        this.shoe.rotation.z = floatZ + Math.sin(this.target.y * 0.5) * 0.008;
        this.shoe.position.y = floatY + introLift;
        this.shoe.userData.setHologramPulse?.(elapsed, this.target.y, this.target.x);

        if (!this.prefersReducedMotion) {
            this.particles.rotation.y += 0.0012;
            this.particles.rotation.x = Math.sin(elapsed * 0.26) * 0.12;
        }

        this.renderer.render(this.scene, this.camera);
    }
}

window.addEventListener("DOMContentLoaded", () => new TravisScott3D());
