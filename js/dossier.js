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

    const selectChapter = (key) => {
        const chapter = DOSSIER_CHAPTERS[key];
        if (!chapter) {
            return;
        }

        root.dataset.activeDossier = key;
        cards.forEach((card) => {
            const selected = card.dataset.dossierKey === key;
            card.classList.toggle("is-active", selected);
            card.setAttribute("aria-selected", String(selected));
        });

        if (activeKey === key) {
            return;
        }

        activeKey = key;
        window.clearTimeout(swapTimer);
        stage.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => {
            image.src = chapter.image;
            image.alt = chapter.alt;
            meta.textContent = chapter.meta;
            title.textContent = chapter.title;
            text.textContent = chapter.text;
            stage.classList.remove("is-swapping");
        }, 150);
    };

    const setExpanded = (expanded) => {
        root.classList.toggle("is-expanded", expanded);
        openButton.setAttribute("aria-expanded", String(expanded));
        cards.forEach((card) => card.setAttribute("aria-expanded", String(expanded && card.classList.contains("is-active"))));
        if (expanded) {
            closeButton.focus({ preventScroll: true });
        }
    };

    cards.forEach((card) => {
        const key = card.dataset.dossierKey;
        card.addEventListener("pointerenter", () => selectChapter(key), { passive: true });
        card.addEventListener("focus", () => selectChapter(key));
        card.addEventListener("click", () => {
            selectChapter(key);
            setExpanded(true);
        });
    });

    openButton.addEventListener("click", () => setExpanded(true));
    closeButton.addEventListener("click", () => setExpanded(false));
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && root.classList.contains("is-expanded")) {
            setExpanded(false);
            cards.find((card) => card.classList.contains("is-active"))?.focus({ preventScroll: true });
        }
    });
}

window.addEventListener("DOMContentLoaded", initDossier);
