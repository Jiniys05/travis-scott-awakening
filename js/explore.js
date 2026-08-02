const SHOE_PARTS = {
    toe: {
        meta: "01 / TOE BOX",
        title: "WHITE LEATHER",
        text: "A white leather mudguard frames the brown perforated toe and gives the profile its clearest material contrast.",
        image: "assets/hf-front.png",
        alt: "Front detail of the white leather toe"
    },
    swoosh: {
        meta: "02 / SIDE MARK",
        title: "REVERSE SWOOSH",
        text: "The pink Swoosh points back across the quarter panel. Its scale changes the visual balance without changing the AJ1's underlying construction.",
        image: "assets/hf-side-a.png",
        alt: "Side detail showing the reverse Swoosh"
    },
    sole: {
        meta: "03 / FOUNDATION",
        title: "AGED SAIL SOLE",
        text: "The off-white midsole stops the pink outsole from becoming graphic. It keeps the pair connected to the older Jordan palette.",
        image: "assets/shoe-side-main-2x.png",
        alt: "Side detail showing the sole"
    },
    heel: {
        meta: "04 / HEEL TAB",
        title: "CO-BRANDING",
        text: "The heel is where the collaborative signatures accumulate: Jordan Wings on one side and the Cactus Jack identity on the other.",
        image: "assets/hf-rear.png",
        alt: "Rear detail of the heel branding"
    }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SWAP_DELAY = 135;

function initExplorer() {
    const root = document.getElementById("exploreConsole");
    if (!root) {
        return;
    }

    const controls = [...root.querySelectorAll(".shoe-hotspot")];
    const image = document.getElementById("exploreInspectorImage");
    const meta = document.getElementById("exploreInspectorMeta");
    const title = document.getElementById("exploreInspectorTitle");
    const text = document.getElementById("exploreInspectorText");
    const inspector = root.querySelector(".explore-inspector");
    let activeKey = "toe";
    let swapTimer = 0;

    const setControlState = () => {
        controls.forEach((control) => {
            const selected = control.dataset.partKey === activeKey;
            control.classList.toggle("is-active", selected);
            control.setAttribute("aria-pressed", String(selected));
        });
    };

    const applyPart = (part) => {
        image.decoding = "async";
        image.src = part.image;
        image.alt = part.alt;
        meta.textContent = part.meta;
        title.textContent = part.title;
        text.textContent = part.text;
        inspector.classList.remove("is-swapping");
    };

    const selectPart = (key, { animate = true } = {}) => {
        const part = SHOE_PARTS[key];
        if (!part) {
            return;
        }

        const changed = key !== activeKey;
        activeKey = key;
        root.dataset.activePart = key;
        setControlState();
        if (!changed) {
            return;
        }

        window.clearTimeout(swapTimer);
        if (!animate || reducedMotion.matches) {
            applyPart(part);
            return;
        }

        inspector.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => applyPart(part), SWAP_DELAY);
    };

    controls.forEach((control, index) => {
        const key = control.dataset.partKey;
        control.addEventListener("click", () => selectPart(key));
        control.addEventListener("focus", () => selectPart(key));
        control.addEventListener("keydown", (event) => {
            const keyMap = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
            if (event.key === "Home") {
                event.preventDefault();
                controls[0].focus();
                return;
            }
            if (event.key === "End") {
                event.preventDefault();
                controls[controls.length - 1].focus();
                return;
            }
            if (!(event.key in keyMap)) {
                return;
            }
            event.preventDefault();
            controls[(index + keyMap[event.key] + controls.length) % controls.length].focus();
        });
    });

    selectPart(activeKey, { animate: false });
}

window.addEventListener("DOMContentLoaded", initExplorer);
