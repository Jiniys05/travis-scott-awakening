const FIELD_NOTES = {
    swoosh: {
        type: "PROFILE DETAIL",
        meta: "01 / IDENTITY",
        title: "REVERSE SWOOSH",
        text: "The oversized reversed mark changes the whole profile without abandoning the AJ1 Low base. It is the collaboration's fastest visual signal.",
        image: "assets/hf-side-a.png",
        alt: "Reverse Swoosh detail of the sneaker"
    },
    pink: {
        type: "COLOUR STUDY",
        meta: "02 / TEMPERATURE",
        title: "PINK PACK",
        text: "The pale pink treatment is balanced by brown nubuck, sail rubber and off-white leather. The palette changes the atmosphere, not the silhouette's weight.",
        image: "assets/colorways/pink-pack-sail.png",
        alt: "Pale pink colour study of the sneaker"
    },
    release: {
        type: "RELEASE RECORD",
        meta: "03 / CONTEXT",
        title: "LIMITED RELEASE",
        text: "Availability, dates and quantities vary by market and retailer. The durable part is the visual language: a recognisable Travis Scott code applied to the AJ1 Low.",
        image: "assets/awakening-poster.png",
        alt: "Cinematic release frame of the sneaker"
    }
};

function initFieldNotes() {
    const root = document.getElementById("faqInvestigation");
    if (!root) {
        return;
    }

    const prompts = [...root.querySelectorAll(".faq-prompt")];
    const story = document.getElementById("faqStory");
    const close = document.getElementById("faqStoryClose");
    const image = document.getElementById("faqStoryImage");
    const type = document.getElementById("faqStoryType");
    const meta = document.getElementById("faqStoryMeta");
    const title = document.getElementById("faqStoryTitle");
    const text = document.getElementById("faqStoryText");
    let activeKey = null;
    let swapTimer = 0;
    let closeTimer = 0;

    const setPromptState = () => {
        prompts.forEach((prompt) => {
            const selected = prompt.dataset.faqKey === activeKey;
            prompt.classList.toggle("is-active", selected);
            prompt.setAttribute("aria-expanded", String(selected && root.dataset.answerOpen === "true"));
        });
    };

    const closeNote = () => {
        if (root.dataset.answerOpen !== "true") {
            return;
        }

        window.clearTimeout(closeTimer);
        root.dataset.answerOpen = "false";
        story.setAttribute("aria-hidden", "true");
        activeKey = null;
        setPromptState();
        closeTimer = window.setTimeout(() => {
            if (root.dataset.answerOpen === "false") {
                story.hidden = true;
            }
        }, 520);
    };

    const openNote = (key) => {
        const note = FIELD_NOTES[key];
        if (!note) {
            return;
        }

        if (key === activeKey && root.dataset.answerOpen === "true") {
            closeNote();
            return;
        }

        activeKey = key;
        window.clearTimeout(closeTimer);
        story.hidden = false;
        story.setAttribute("aria-hidden", "false");
        root.dataset.answerOpen = "true";
        setPromptState();

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
        }, 130);
    };

    prompts.forEach((prompt, index) => {
        const key = prompt.dataset.faqKey;
        prompt.addEventListener("click", () => openNote(key));
        prompt.addEventListener("keydown", (event) => {
            if (!["ArrowDown", "ArrowRight", "ArrowUp", "ArrowLeft"].includes(event.key)) {
                return;
            }

            event.preventDefault();
            const direction = ["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1;
            prompts[(index + direction + prompts.length) % prompts.length].focus();
        });
    });

    close?.addEventListener("click", closeNote);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNote();
        }
    });
}

window.addEventListener("DOMContentLoaded", initFieldNotes);
