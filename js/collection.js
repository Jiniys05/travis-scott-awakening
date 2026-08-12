const ASSET_REVISION = "portfolio-02";

const COLOUR_STUDIES = [
    {
        id: "shy",
        code: "01 / SHY PINK",
        name: "SHY PINK",
        note: "Pale pink, sail and off-white leather keep the silhouette close to its archive proportions.",
        image: "assets/colorways/pink-pack-sail.png",
        alt: "Shy Pink colour study",
        camera: "translate3d(-2%, 1%, 0) rotate(-1deg) scale(1.03)",
        glow: "rgba(244, 160, 184, 0.34)",
        field: "#4a3039"
    },
    {
        id: "tropical",
        code: "02 / TROPICAL PINK",
        name: "TROPICAL PINK",
        note: "The tonal magenta study brings the material forward and lets the Swoosh dissolve into the body.",
        image: "assets/colorways/pink-pack-hot-pink.png",
        alt: "Tropical Pink colour study",
        camera: "translate3d(3%, -2%, 0) rotate(1.5deg) scale(1.08)",
        glow: "rgba(220, 21, 128, 0.34)",
        field: "#51233d"
    },
    {
        id: "dust",
        code: "03 / DUST",
        name: "DUST PHASE",
        note: "Muted rose and a cooler Swoosh pull the object closer to analog film, direct flash and dark studio air.",
        image: "assets/colorways/pink-pack-dust.png",
        alt: "Dust colour study",
        camera: "translate3d(-4%, 2%, 0) rotate(-2deg) scale(1.06)",
        glow: "rgba(172, 145, 160, 0.3)",
        field: "#33303a"
    },
    {
        id: "mint",
        code: "04 / MINT",
        name: "MINT SHIFT",
        note: "Mint cools the coral base without changing the low-cut construction. The temperature moves; the form remains fixed.",
        image: "assets/colorways/pink-pack-mint.png",
        alt: "Mint colour study",
        camera: "translate3d(4%, 1%, 0) rotate(1.6deg) scale(1.06)",
        glow: "rgba(125, 211, 192, 0.3)",
        field: "#273b3c"
    }
];

function assetUrl(path) {
    return `${path}?v=${ASSET_REVISION}`;
}

function preloadImage(source) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.decoding = "async";
        image.onload = async () => {
            try {
                await image.decode();
            } catch {
                // The image is still safe to display when decode is unavailable.
            }
            resolve();
        };
        image.onerror = reject;
        image.src = source;
    });
}

function renderMuseum(root) {
    const initial = COLOUR_STUDIES[0];
    root.innerHTML = `
        <div class="colour-museum-stage" data-active-colour="${initial.id}" style="--museum-glow:${initial.glow};--museum-field:${initial.field};--museum-camera:${initial.camera}">
            <div class="museum-sky" aria-hidden="true"></div>
            <div class="museum-plinth" aria-hidden="true"><i></i><i></i></div>
            <div class="museum-product" id="colourPanel" role="tabpanel" aria-labelledby="colour-${initial.id}">
                <img class="museum-shoe is-active" id="museumShoe" src="${assetUrl(initial.image)}" alt="${initial.alt}" decoding="async" fetchpriority="high">
            </div>
            <div class="museum-copy" aria-live="polite">
                <span id="museumCode">${initial.code}</span><h3 id="museumTitle">${initial.name}</h3><p id="museumNote">${initial.note}</p>
            </div>
            <div class="museum-rail" role="tablist" aria-label="Colour studies">
                ${COLOUR_STUDIES.map((study, index) => `<button class="museum-marker${index === 0 ? " is-active" : ""}" id="colour-${study.id}" type="button" role="tab" aria-controls="colourPanel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-colour-key="${study.id}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${study.name}</strong></button>`).join("")}
            </div>
        </div>
    `;

    const stage = root.querySelector(".colour-museum-stage");
    const panel = root.querySelector("#colourPanel");
    const shoe = root.querySelector("#museumShoe");
    const buttons = [...root.querySelectorAll(".museum-marker")];
    const code = root.querySelector("#museumCode");
    const title = root.querySelector("#museumTitle");
    const note = root.querySelector("#museumNote");
    let activeId = initial.id;
    let pendingId = null;
    let hoverTimer = 0;
    let requestId = 0;

    const preloadStudies = () => {
        if (navigator.connection?.saveData) {
            return;
        }
        COLOUR_STUDIES.slice(1).forEach(({ image }) => preloadImage(assetUrl(image)).catch(() => {}));
    };

    if ("requestIdleCallback" in window) {
        window.requestIdleCallback(preloadStudies, { timeout: 2200 });
    } else {
        window.setTimeout(preloadStudies, 1200);
    }

    const updateControls = (study) => {
        activeId = study.id;
        stage.dataset.activeColour = study.id;
        stage.style.setProperty("--museum-glow", study.glow);
        stage.style.setProperty("--museum-field", study.field);
        stage.style.setProperty("--museum-camera", study.camera);
        panel.setAttribute("aria-labelledby", `colour-${study.id}`);
        buttons.forEach((button) => {
            const selected = button.dataset.colourKey === study.id;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-selected", String(selected));
            button.tabIndex = selected ? 0 : -1;
        });
        code.textContent = study.code;
        title.textContent = study.name;
        note.textContent = study.note;
    };

    const selectStudy = async (id) => {
        const study = COLOUR_STUDIES.find((item) => item.id === id);
        if (!study || study.id === activeId || study.id === pendingId) {
            return;
        }

        const selection = ++requestId;
        pendingId = study.id;
        stage.classList.add("is-image-switching");

        try {
            await preloadImage(assetUrl(study.image));
            if (selection !== requestId) {
                return;
            }

            shoe.classList.remove("is-active");
            window.setTimeout(() => {
                if (selection !== requestId) {
                    return;
                }
                shoe.src = assetUrl(study.image);
                shoe.alt = study.alt;
                updateControls(study);
                pendingId = null;
                stage.classList.remove("is-image-switching");
                requestAnimationFrame(() => shoe.classList.add("is-active"));
            }, 130);
        } catch {
            if (selection === requestId) {
                pendingId = null;
                stage.classList.remove("is-image-switching");
            }
        }
    };

    const moveFocus = (index, direction) => {
        buttons[(index + direction + buttons.length) % buttons.length].focus();
    };

    buttons.forEach((button, index) => {
        const id = button.dataset.colourKey;
        button.addEventListener("pointerenter", () => {
            window.clearTimeout(hoverTimer);
            hoverTimer = window.setTimeout(() => selectStudy(id), 90);
        }, { passive: true });
        button.addEventListener("pointerleave", () => window.clearTimeout(hoverTimer), { passive: true });
        button.addEventListener("focus", () => selectStudy(id));
        button.addEventListener("click", () => selectStudy(id));
        button.addEventListener("keydown", (event) => {
            const keyMap = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
            if (event.key === "Home") {
                event.preventDefault();
                buttons[0].focus();
                return;
            }
            if (event.key === "End") {
                event.preventDefault();
                buttons[buttons.length - 1].focus();
                return;
            }
            if (!(event.key in keyMap)) {
                return;
            }
            event.preventDefault();
            moveFocus(index, keyMap[event.key]);
        });
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("shoeGrid");
    if (root) {
        renderMuseum(root);
    }
});
