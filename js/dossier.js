const DOSSIER_CHAPTERS = {
    origin: {
        meta: "01 / ORIGIN",
        title: "ARCHIVE BASE",
        text: "The AJ1 Low OG structure keeps the original basketball proportions intact: a low collar, layered leather panels and a grounded cupsole.",
        image: "assets/hf-side-a.png",
        alt: "Air Jordan 1 Low in profile"
    },
    design: {
        meta: "02 / DESIGN",
        title: "THE REVERSED CODE",
        text: "The oversized Swoosh faces the wrong way on purpose. That one directional decision shifts the balance of the profile and makes the collaboration legible at a glance.",
        image: "assets/hf-side-b.png",
        alt: "Reverse Swoosh side profile"
    },
    materials: {
        meta: "03 / MATERIALS",
        title: "TACTILE CONTRAST",
        text: "White leather, brown nubuck and the aged sail midsole are kept in tension. The colour is quiet enough for the surface changes to do the work.",
        image: "assets/hf-top.png",
        alt: "Top view showing laces and mixed materials"
    },
    legacy: {
        meta: "04 / LEGACY",
        title: "COLLECTIBLE SIGNAL",
        text: "Heel marks, tongue labels and the reversed mark turn a familiar base into a readable collaborative object without overloading the silhouette.",
        image: "assets/hf-rear.png",
        alt: "Rear view showing the heel detailing"
    }
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SWAP_DELAY = 150;

function initDossier() {
    const root = document.getElementById("dossierConstellation");
    if (!root) {
        return;
    }

    const cards = [...root.querySelectorAll(".dossier-card")];
    const stage = root.querySelector(".dossier-stage");
    const image = document.getElementById("dossierStageImage");
    const meta = document.getElementById("dossierStageMeta");
    const title = document.getElementById("dossierStageTitle");
    const text = document.getElementById("dossierStageText");
    const openButton = document.getElementById("dossierOpen");
    const closeButton = document.getElementById("dossierClose");
    let activeKey = "origin";
    let swapTimer = 0;

    const setTabState = () => {
        cards.forEach((card) => {
            const selected = card.dataset.dossierKey === activeKey;
            card.classList.toggle("is-active", selected);
            card.setAttribute("aria-selected", String(selected));
            card.tabIndex = selected && !root.classList.contains("is-expanded") ? 0 : -1;
        });
        stage.setAttribute("aria-labelledby", `dossier-${activeKey}`);
    };

    const paintChapter = (chapter) => {
        image.decoding = "async";
        image.src = chapter.image;
        image.alt = chapter.alt;
        meta.textContent = chapter.meta;
        title.textContent = chapter.title;
        text.textContent = chapter.text;
        stage.classList.remove("is-swapping");
    };

    const selectChapter = (key, { animate = true } = {}) => {
        const chapter = DOSSIER_CHAPTERS[key];
        if (!chapter) {
            return;
        }

        const changed = activeKey !== key;
        activeKey = key;
        root.dataset.activeDossier = key;
        setTabState();

        if (!changed) {
            return;
        }

        window.clearTimeout(swapTimer);
        if (!animate || reducedMotion.matches) {
            paintChapter(chapter);
            return;
        }

        stage.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => paintChapter(chapter), SWAP_DELAY);
    };

    const setExpanded = (expanded) => {
        root.classList.toggle("is-expanded", expanded);
        openButton.setAttribute("aria-expanded", String(expanded));
        openButton.setAttribute("aria-controls", stage.id);
        openButton.tabIndex = expanded ? -1 : 0;
        closeButton.setAttribute("aria-hidden", String(!expanded));
        setTabState();

        if (expanded) {
            window.requestAnimationFrame(() => closeButton.focus({ preventScroll: true }));
        }
    };

    cards.forEach((card, index) => {
        const key = card.dataset.dossierKey;
        card.addEventListener("pointerenter", () => selectChapter(key), { passive: true });
        card.addEventListener("focus", () => selectChapter(key));
        card.addEventListener("click", () => {
            selectChapter(key);
            setExpanded(true);
        });
        card.addEventListener("keydown", (event) => {
            const keyMap = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 };
            if (event.key === "Home") {
                event.preventDefault();
                cards[0].focus();
                return;
            }
            if (event.key === "End") {
                event.preventDefault();
                cards[cards.length - 1].focus();
                return;
            }
            if (!(event.key in keyMap)) {
                return;
            }
            event.preventDefault();
            cards[(index + keyMap[event.key] + cards.length) % cards.length].focus();
        });
    });

    openButton.addEventListener("click", () => setExpanded(true));
    closeButton.addEventListener("click", () => {
        setExpanded(false);
        cards.find((card) => card.dataset.dossierKey === activeKey)?.focus({ preventScroll: true });
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && root.classList.contains("is-expanded")) {
            setExpanded(false);
            cards.find((card) => card.dataset.dossierKey === activeKey)?.focus({ preventScroll: true });
            return;
        }

        if (event.key === "Tab" && root.classList.contains("is-expanded")) {
            const focusable = [...stage.querySelectorAll("button:not([disabled]), a[href], [tabindex]:not([tabindex='-1'])")];
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (!first || !last) {
                return;
            }
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    selectChapter(activeKey, { animate: false });
    setExpanded(false);
}

window.addEventListener("DOMContentLoaded", initDossier);
