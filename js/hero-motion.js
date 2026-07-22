function splitTitleLetters(title) {
    if (!title || title.dataset.split === "true") {
        return [];
    }

    const letters = [];
    const parts = title.innerHTML.split("<br>");
    title.innerHTML = parts.map((part, lineIndex) => {
        const line = [...part].map((char) => {
            if (char === " ") {
                return `<span class="title-space">&nbsp;</span>`;
            }
            const index = letters.length;
            letters.push(index);
            return `<span class="title-letter" style="--letter-index:${index};--line-index:${lineIndex}">${char}</span>`;
        }).join("");
        return `<span class="title-line">${line}</span>`;
    }).join("<br>");
    title.dataset.split = "true";
    return [...title.querySelectorAll(".title-letter")];
}

async function enhanceHeroMotion() {
    const hero = document.querySelector(".hero");
    if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    splitTitleLetters(document.querySelector(".title-top"));
    hero.classList.add("hero-is-awakening-scene");
}

window.addEventListener("DOMContentLoaded", enhanceHeroMotion);
