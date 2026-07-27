const colorways = [
    {
        name: "SAIL PINK",
        code: "STUDY 01",
        tag: "SOFT SAIL / PINK NUBUCK",
        note: "The lightest reading of the silhouette: off-white leather, a quiet pink field and an archive sole.",
        image: "assets/colorways/pink-pack-sail.png"
    },
    {
        name: "ROSE BROWN",
        code: "STUDY 02",
        tag: "DUSTY ROSE / EARTH SWOOSH",
        note: "A more grounded study: pink gives way to earth tones while the Swoosh carries the visual weight.",
        image: "assets/colorways/pink-pack-rose-brown.png"
    },
    {
        name: "DUST PHASE",
        code: "STUDY 03",
        tag: "MUTED PINK / GREY SWOOSH",
        note: "A subdued option designed to sit naturally with analog grain, soft flash and a dark environment.",
        image: "assets/colorways/pink-pack-dust.png"
    },
    {
        name: "HOT PINK",
        code: "STUDY 04",
        tag: "TONAL MAGENTA / WHITE SOLE",
        note: "The highest-energy study: tonal magenta compresses the palette and brings the material forward.",
        image: "assets/colorways/pink-pack-hot-pink.png"
    },
    {
        name: "MINT SHIFT",
        code: "STUDY 05",
        tag: "CORAL PINK / MINT SWOOSH",
        note: "A cold counterpoint to coral: the mint Swoosh changes the temperature without changing the form.",
        image: "assets/colorways/pink-pack-mint.png"
    },
    {
        name: "RED STRIKE",
        code: "STUDY 06",
        tag: "PALE PINK / RED SWOOSH",
        note: "A direct red hit holds the composition even when the product is reduced to a small frame.",
        image: "assets/colorways/pink-pack-red.png"
    }
];

function cardMarkup(item, index) {
    return `
        <button class="shoe-item${index === 0 ? " is-active" : ""}" type="button" data-index="${index}" aria-pressed="${index === 0}">
            <span class="shoe-index">${item.code}</span>
            <span class="shoe-frame">
                <img src="${item.image}" alt="Visual study: Air Jordan 1 Low ${item.name}" loading="lazy" decoding="async">
            </span>
            <span class="shoe-label"><span>${item.tag}</span>${item.name}</span>
        </button>
    `;
}

function renderGallery(root) {
    const initial = colorways[0];
    root.innerHTML = `
        <div class="colorway-gallery" data-active-colorway="${initial.code}">
            <article class="colorway-feature" aria-live="polite">
                <div class="feature-image-wrap">
                    <img src="${initial.image}" alt="Visual study: Air Jordan 1 Low ${initial.name}" loading="lazy" decoding="async">
                </div>
                <div class="feature-copy">
                    <span>${initial.code} / FEATURED STUDY</span>
                    <h3>${initial.name}</h3>
                    <p>${initial.note}</p>
                </div>
            </article>
            <div class="colorway-stack">
                ${colorways.map(cardMarkup).join("")}
            </div>
        </div>
    `;

    const gallery = root.querySelector(".colorway-gallery");
    const feature = root.querySelector(".colorway-feature");
    const featureImage = root.querySelector(".feature-image-wrap img");
    const featureCode = root.querySelector(".feature-copy > span");
    const featureTitle = root.querySelector(".feature-copy h3");
    const featureNote = root.querySelector(".feature-copy p");
    const cards = [...root.querySelectorAll(".shoe-item")];
    let activeIndex = 0;
    let swapTimer = 0;

    const setActive = (index) => {
        if (index === activeIndex || !colorways[index]) {
            return;
        }

        const next = colorways[index];
        activeIndex = index;
        window.clearTimeout(swapTimer);
        feature.classList.add("is-changing");
        gallery.dataset.activeColorway = next.code;

        cards.forEach((card, cardIndex) => {
            const selected = cardIndex === index;
            card.classList.toggle("is-active", selected);
            card.setAttribute("aria-pressed", String(selected));
        });

        swapTimer = window.setTimeout(() => {
            featureImage.src = next.image;
            featureImage.alt = `Visual study: Air Jordan 1 Low ${next.name}`;
            featureCode.textContent = `${next.code} / FEATURED STUDY`;
            featureTitle.textContent = next.name;
            featureNote.textContent = next.note;
            feature.classList.remove("is-changing");
        }, 180);
    };

    cards.forEach((card) => {
        card.dataset.tiltBound = "true";
        card.addEventListener("click", () => setActive(Number(card.dataset.index)));
        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const x = (event.clientX - rect.left) / rect.width - 0.5;
            const y = (event.clientY - rect.top) / rect.height - 0.5;
            card.style.setProperty("--hover-tilt-x", `${(-y * 4).toFixed(2)}deg`);
            card.style.setProperty("--hover-tilt-y", `${(x * 5).toFixed(2)}deg`);
        }, { passive: true });
        card.addEventListener("pointerleave", () => {
            card.style.setProperty("--hover-tilt-x", "0deg");
            card.style.setProperty("--hover-tilt-y", "0deg");
        });
    });

    if ("IntersectionObserver" in window) {
        const reveal = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                gallery.classList.add("is-revealed");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.12 });
        reveal.observe(gallery);
    } else {
        gallery.classList.add("is-revealed");
    }

    window.dispatchEvent(new CustomEvent("site:collection-ready"));
}

window.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("shoeGrid");
    if (root) {
        renderGallery(root);
    }
});
