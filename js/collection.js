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

function renderMuseum(root) {
    const initial = COLOUR_STUDIES[0];
    root.innerHTML = `
        <div class="colour-museum-stage" data-active-colour="${initial.id}" style="--museum-glow:${initial.glow};--museum-field:${initial.field};--museum-camera:${initial.camera}">
            <div class="museum-sky" aria-hidden="true"></div>
            <div class="museum-plinth" aria-hidden="true"><i></i><i></i></div>
            <div class="museum-product" aria-live="polite">
                ${COLOUR_STUDIES.map((study, index) => `<img class="museum-shoe${index === 0 ? " is-active" : ""}" data-colour-image="${study.id}" src="${study.image}" alt="${study.alt}" loading="lazy" decoding="async">`).join("")}
            </div>
            <div class="museum-copy">
                <span id="museumCode">${initial.code}</span><h3 id="museumTitle">${initial.name}</h3><p id="museumNote">${initial.note}</p>
            </div>
            <div class="museum-rail" role="tablist" aria-label="Colour studies">
                ${COLOUR_STUDIES.map((study, index) => `<button class="museum-marker${index === 0 ? " is-active" : ""}" type="button" role="tab" aria-selected="${index === 0}" data-colour-key="${study.id}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${study.name}</strong></button>`).join("")}
            </div>
        </div>
    `;

    const stage = root.querySelector(".colour-museum-stage");
    const buttons = [...root.querySelectorAll(".museum-marker")];
    const images = [...root.querySelectorAll(".museum-shoe")];
    const code = root.querySelector("#museumCode");
    const title = root.querySelector("#museumTitle");
    const note = root.querySelector("#museumNote");
    let activeId = initial.id;

    const selectStudy = (id) => {
        const study = COLOUR_STUDIES.find((item) => item.id === id);
        if (!study || id === activeId) {
            return;
        }

        activeId = id;
        stage.dataset.activeColour = id;
        stage.style.setProperty("--museum-glow", study.glow);
        stage.style.setProperty("--museum-field", study.field);
        stage.style.setProperty("--museum-camera", study.camera);
        buttons.forEach((button) => {
            const selected = button.dataset.colourKey === id;
            button.classList.toggle("is-active", selected);
            button.setAttribute("aria-selected", String(selected));
        });
        images.forEach((image) => image.classList.toggle("is-active", image.dataset.colourImage === id));
        code.textContent = study.code;
        title.textContent = study.name;
        note.textContent = study.note;
    };

    buttons.forEach((button, index) => {
        const id = button.dataset.colourKey;
        button.addEventListener("pointerenter", () => selectStudy(id), { passive: true });
        button.addEventListener("focus", () => selectStudy(id));
        button.addEventListener("click", () => selectStudy(id));
        button.addEventListener("keydown", (event) => {
            if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
                return;
            }
            event.preventDefault();
            const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
            const nextIndex = (index + direction + buttons.length) % buttons.length;
            buttons[nextIndex].focus();
        });
    });
}

window.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("shoeGrid");
    if (root) {
        renderMuseum(root);
    }
});
