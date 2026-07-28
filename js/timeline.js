const PROCESS_STEPS = {
    sketch: {
        meta: "01 / SKETCH",
        title: "THE BASELINE",
        text: "The familiar AJ1 Low profile is kept deliberately legible before the collaboration changes its visual centre of gravity.",
        image: "assets/shoe-side-main-2x.png",
        alt: "Low profile study of the sneaker"
    },
    sampling: {
        meta: "02 / SAMPLING",
        title: "COLOUR AS MATERIAL",
        text: "Pink is handled as surface temperature, not an accent pasted onto a white base. The suede, leather and sole each take it differently.",
        image: "assets/hf-top.png",
        alt: "Top view of the lace and material sampling"
    },
    prototype: {
        meta: "03 / PROTOTYPE",
        title: "PROFILE SHIFT",
        text: "The reversed Swoosh gives the profile a new direction. It creates the visual tension that makes this line distinct even at a distance.",
        image: "assets/hf-side-b.png",
        alt: "Profile showing the reversed Swoosh"
    },
    release: {
        meta: "04 / RELEASE",
        title: "THE SIGNAL",
        text: "The finished pair reads through its system of signs: Nike Air, Wings, Cactus Jack marks and a specific mix of leather, nubuck and sail rubber.",
        image: "assets/hf-rear.png",
        alt: "Rear view of the finished sneaker"
    }
};

function initTimeline() {
    const root = document.getElementById("processJourney");
    if (!root) {
        return;
    }

    const steps = [...root.querySelectorAll(".process-step")];
    const image = document.getElementById("processStageImage");
    const meta = document.getElementById("processStageMeta");
    const title = document.getElementById("processStageTitle");
    const text = document.getElementById("processStageText");
    const stage = root.querySelector(".process-stage");
    let activeKey = "sketch";
    let swapTimer = 0;

    steps.forEach((step) => {
        const item = PROCESS_STEPS[step.dataset.processKey];
        if (!item) {
            return;
        }
        const visual = document.createElement("img");
        visual.className = "process-step-visual";
        visual.src = item.image;
        visual.alt = "";
        visual.loading = "lazy";
        visual.decoding = "async";
        step.append(visual);
    });

    const selectStep = (key) => {
        const item = PROCESS_STEPS[key];
        if (!item || key === activeKey) {
            return;
        }

        activeKey = key;
        root.dataset.activeProcess = key;
        steps.forEach((step) => step.classList.toggle("is-active", step.dataset.processKey === key));
        window.clearTimeout(swapTimer);
        stage.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => {
            image.src = item.image;
            image.alt = item.alt;
            meta.textContent = item.meta;
            title.textContent = item.title;
            text.textContent = item.text;
            stage.classList.remove("is-swapping");
        }, 140);
    };

    steps.forEach((step) => {
        const key = step.dataset.processKey;
        step.addEventListener("click", () => selectStep(key));
        step.addEventListener("focus", () => selectStep(key));
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio).forEach((entry) => selectStep(entry.target.dataset.processKey));
        }, { threshold: [0.4, 0.65], rootMargin: "-20% 0px -32% 0px" });
        steps.forEach((step) => observer.observe(step));
    }

    const desktopQuery = window.matchMedia("(min-width: 761px)");
    let pinFrame = 0;

    const updatePin = () => {
        pinFrame = 0;
        if (!desktopQuery.matches || document.hidden) {
            root.classList.remove("is-pinned");
            return;
        }

        const pinTop = Math.round(Math.max(28, window.innerHeight * 0.06));
        const journeyRect = root.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const shouldPin = journeyRect.top <= pinTop && journeyRect.bottom > pinTop + stageRect.height + 18;

        if (shouldPin && !root.classList.contains("is-pinned")) {
            root.style.setProperty("--process-stage-top", `${pinTop}px`);
            root.style.setProperty("--process-stage-left", `${Math.round(stageRect.left)}px`);
            root.style.setProperty("--process-stage-width", `${Math.round(stageRect.width)}px`);
            root.classList.add("is-pinned");
        } else if (!shouldPin && root.classList.contains("is-pinned")) {
            root.classList.remove("is-pinned");
        }
    };

    const schedulePin = () => {
        if (!pinFrame) {
            pinFrame = requestAnimationFrame(updatePin);
        }
    };

    window.addEventListener("scroll", schedulePin, { passive: true });
    window.addEventListener("resize", schedulePin, { passive: true });
    desktopQuery.addEventListener?.("change", schedulePin);
    schedulePin();
}

window.addEventListener("DOMContentLoaded", initTimeline);
