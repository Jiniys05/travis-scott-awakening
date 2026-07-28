const FIELD_NOTES = {
    swoosh: {
        type: "PROFILE DETAIL",
        meta: "01 / IDENTITY",
        title: "REVERSE SWOOSH",
        text: "The oversized reversed mark is the collaboration's quickest visual signal. It changes the profile without abandoning the AJ1 Low base.",
        image: "assets/hf-side-a.png",
        alt: "Reverse Swoosh detail"
    },
    pink: {
        type: "COLOUR STUDY",
        meta: "02 / TEMPERATURE",
        title: "WHY PINK PACK?",
        text: "The pale pink treatment does not soften the construction. It is balanced by brown nubuck, sail rubber and a more grounded material contrast.",
        image: "assets/colorways/pink-pack-sail.png",
        alt: "Pale pink colour study"
    },
    release: {
        type: "FILM FRAME",
        meta: "03 / CONTEXT",
        title: "LIMITED RELEASE?",
        text: "Availability, dates and quantities vary by market and retailer. What stays consistent is the collaboration's visual code, not a single universal retail story.",
        image: "assets/awakening-poster.png",
        alt: "Cinematic film frame of the sneaker"
    },
    materials: {
        type: "MATERIAL RECORD",
        meta: "04 / SURFACE",
        title: "LEATHER / NUBUCK / SAIL",
        text: "Read the object through its surfaces: leather grain on the overlays, the softer nap of nubuck, stitch rhythm and the warm tone of the midsole.",
        image: "assets/hf-top.png",
        alt: "Top material detail of the sneaker"
    }
};

function initFieldNotes() {
    const root = document.getElementById("faqInvestigation");
    if (!root) {
        return;
    }

    const prompts = [...root.querySelectorAll(".faq-prompt")];
    const story = root.querySelector(".faq-story");
    const image = document.getElementById("faqStoryImage");
    const type = document.getElementById("faqStoryType");
    const meta = document.getElementById("faqStoryMeta");
    const title = document.getElementById("faqStoryTitle");
    const text = document.getElementById("faqStoryText");
    let activeKey = "swoosh";
    let swapTimer = 0;

    const selectNote = (key) => {
        const note = FIELD_NOTES[key];
        if (!note || key === activeKey) {
            return;
        }

        activeKey = key;
        root.dataset.activeFaq = key;
        prompts.forEach((prompt) => {
            const selected = prompt.dataset.faqKey === key;
            prompt.classList.toggle("is-active", selected);
            prompt.setAttribute("aria-selected", String(selected));
        });
        window.clearTimeout(swapTimer);
        story.classList.add("is-swapping");
        swapTimer = window.setTimeout(() => {
            image.src = note.image;
            image.alt = note.alt;
            type.textContent = note.type;
            meta.textContent = note.meta;
            title.textContent = note.title;
            text.textContent = note.text;
            story.classList.remove("is-swapping");
        }, 145);
    };

    prompts.forEach((prompt, index) => {
        const key = prompt.dataset.faqKey;
        prompt.addEventListener("pointerenter", () => selectNote(key), { passive: true });
        prompt.addEventListener("focus", () => selectNote(key));
        prompt.addEventListener("click", () => selectNote(key));
        prompt.addEventListener("keydown", (event) => {
            if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(event.key)) {
                return;
            }
            event.preventDefault();
            const direction = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
            prompts[(index + direction + prompts.length) % prompts.length].focus();
        });
    });
}

window.addEventListener("DOMContentLoaded", initFieldNotes);
