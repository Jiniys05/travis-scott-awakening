const PROCESS_STEPS = {
    sketch: {
        meta: "01 / ARCHIVE",
        title: "THE BASE",
        text: "The familiar AJ1 Low profile stays deliberately legible. The collaboration begins by preserving the original proportion, not hiding it.",
        image: "assets/shoe-side-main-2x.png",
        alt: "Low profile study of the sneaker"
    },
    sampling: {
        meta: "02 / COLOUR",
        title: "PINK, WEIGHTED",
        text: "Pink is handled as a surface temperature, not decoration. Nubuck, leather and rubber each hold it with a different visual weight.",
        image: "assets/hf-top.png",
        alt: "Top view of the lace and material sampling"
    },
    prototype: {
        meta: "03 / REVERSE",
        title: "THE SHIFT",
        text: "The reversed Swoosh redirects the silhouette in one move. It is the point where the profile stops reading like an ordinary AJ1 Low.",
        image: "assets/hf-side-b.png",
        alt: "Profile showing the reversed Swoosh"
    },
    release: {
        meta: "04 / RELEASE",
        title: "THE FINAL CODE",
        text: "Nike Air, Wings, Cactus Jack marks and the warm sail sole resolve the final object into one recognisable visual system.",
        image: "assets/hf-rear.png",
        alt: "Rear view of the finished sneaker"
    }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SWAP_DELAY = 140;

function initTimeline() {
    const root = document.getElementById("processJourney");
    if (!root) {
        return;
    }

    const steps = [...root.querySelectorAll(".process-step")];
    const stage = document.getElementById("processStage");
    const image = document.getElementById("processStageImage");
    const meta = document.getElementById("processStageMeta");
    const title = document.getElementById("processStageTitle");
    const text = document.getElementById("processStageText");
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

    const setStepState = () => {
        steps.forEach((step) => {
            const selected = step.dataset.processKey === activeKey;
            step.classList.toggle("is-active", selected);
            step.setAttribute("aria-selected", String(selected));
            step.tabIndex = selected ? 0 : -1;
        });
        stage.setAttribute("aria-labelledby", `process-${activeKey}`);
    };

    const applyStage = (item) => {
        image.src = item.image;
        image.alt = item.alt;
        meta.textContent = item.meta;
        title.textContent = item.title;
        text.textContent = item.text;
        stage.classList.remove("is-swapping");
    };

    const selectStep = (key, { animate = true } = {}) => {
        const item = PROCESS_STEPS[key];
        if (!item) {
            return;
        }

        const changed = activeKey !== key;
        activeKey = key;
        root.dataset.activeProcess = key;
        setStepState();
        if (!changed) {
            return;
        }

        window.clearTimeout(swapTimer);
        if (!animate || reducedMotion.matches) {
            applyStage(item);
            return;
        }

        stage.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => applyStage(item), SWAP_DELAY);
    };

    const focusStep = (index, direction) => {
        steps[(index + direction + steps.length) % steps.length].focus();
    };

    steps.forEach((step, index) => {
        const key = step.dataset.processKey;
        step.addEventListener("click", () => selectStep(key));
        step.addEventListener("focus", () => selectStep(key));
        step.addEventListener("keydown", (event) => {
            const keyMap = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
            if (event.key === "Home") {
                event.preventDefault();
                steps[0].focus();
                return;
            }
            if (event.key === "End") {
                event.preventDefault();
                steps[steps.length - 1].focus();
                return;
            }
            if (!(event.key in keyMap)) {
                return;
            }
            event.preventDefault();
            focusStep(index, keyMap[event.key]);
        });
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];
            if (visible) {
                selectStep(visible.target.dataset.processKey);
            }
        }, { threshold: [0.45, 0.7], rootMargin: "-18% 0px -34% 0px" });

        steps.forEach((step) => observer.observe(step));
    }

    selectStep(activeKey, { animate: false });
}

window.addEventListener("DOMContentLoaded", initTimeline);
