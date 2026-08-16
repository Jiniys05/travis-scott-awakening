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

const TRANSITION_DURATION = 720;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

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
    const progress = document.getElementById("faqStoryProgress");
    let activeKey = null;
    let swapTimer = 0;
    let closeTimer = 0;
    let pointerFrame = 0;
    let pointerTarget = null;

    const setPromptState = () => {
        root.dataset.activeRecord = activeKey || "";
        prompts.forEach((prompt) => {
            const selected = prompt.dataset.faqKey === activeKey;
            prompt.classList.toggle("is-active", selected);
            prompt.setAttribute("aria-expanded", String(selected && root.dataset.answerOpen === "true"));
        });
    };

    const renderNote = (note, key, animate) => {
        const applyContent = () => {
            image.decoding = "async";
            image.src = note.image;
            image.alt = note.alt;
            type.textContent = note.type;
            meta.textContent = note.meta;
            title.textContent = note.title;
            text.textContent = note.text;
            progress.textContent = `${String(prompts.findIndex((prompt) => prompt.dataset.faqKey === key) + 1).padStart(2, "0")} / ${String(prompts.length).padStart(2, "0")}`;
            close?.setAttribute("aria-label", `Close ${note.title} record`);
            story.classList.remove("is-swapping");
        };

        window.clearTimeout(swapTimer);
        if (!animate || prefersReducedMotion.matches) {
            applyContent();
            return;
        }

        story.classList.add("is-swapping");
        swapTimer = window.setTimeout(applyContent, 150);
    };

    const revealStoryOnMobile = () => {
        if (!window.matchMedia("(max-width: 760px)").matches) {
            return;
        }

        window.requestAnimationFrame(() => {
            const rect = story.getBoundingClientRect();
            if (rect.top < 0 || rect.bottom > window.innerHeight) {
                story.scrollIntoView({
                    behavior: prefersReducedMotion.matches ? "auto" : "smooth",
                    block: "nearest"
                });
            }
        });
    };

    const closeNote = ({ returnFocus = true } = {}) => {
        if (root.dataset.answerOpen !== "true") {
            return;
        }

        const activePrompt = prompts.find((prompt) => prompt.dataset.faqKey === activeKey);
        window.clearTimeout(closeTimer);
        root.dataset.answerOpen = "false";
        story.setAttribute("aria-hidden", "true");
        activeKey = null;
        setPromptState();
        closeTimer = window.setTimeout(() => {
            if (root.dataset.answerOpen === "false") {
                story.hidden = true;
            }
        }, prefersReducedMotion.matches ? 1 : TRANSITION_DURATION);

        if (returnFocus && activePrompt) {
            activePrompt.focus({ preventScroll: true });
        }
    };

    const openNote = (key) => {
        const note = FIELD_NOTES[key];
        if (!note) {
            return;
        }

        if (key === activeKey && root.dataset.answerOpen === "true") {
            story.focus({ preventScroll: true });
            return;
        }

        const isReplacing = root.dataset.answerOpen === "true";
        activeKey = key;
        window.clearTimeout(closeTimer);
        renderNote(note, key, isReplacing);
        story.hidden = false;
        story.setAttribute("aria-hidden", "false");
        root.dataset.answerOpen = "true";
        setPromptState();
        revealStoryOnMobile();
    };

    const updatePromptLight = () => {
        pointerFrame = 0;
        if (!pointerTarget) {
            return;
        }

        const { prompt, event } = pointerTarget;
        const rect = prompt.getBoundingClientRect();
        prompt.style.setProperty("--faq-light-x", `${Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)).toFixed(1)}%`);
        prompt.style.setProperty("--faq-light-y", `${Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)).toFixed(1)}%`);
    };

    prompts.forEach((prompt, index) => {
        const key = prompt.dataset.faqKey;
        prompt.addEventListener("click", () => openNote(key));
        prompt.addEventListener("pointermove", (event) => {
            if (prefersReducedMotion.matches || event.pointerType === "touch") {
                return;
            }

            pointerTarget = { prompt, event };
            if (!pointerFrame) {
                pointerFrame = window.requestAnimationFrame(updatePromptLight);
            }
        }, { passive: true });
        prompt.addEventListener("pointerleave", () => {
            pointerTarget = null;
            prompt.style.removeProperty("--faq-light-x");
            prompt.style.removeProperty("--faq-light-y");
        });
        prompt.addEventListener("keydown", (event) => {
            const keyMap = {
                ArrowDown: 1,
                ArrowRight: 1,
                ArrowUp: -1,
                ArrowLeft: -1
            };
            if (event.key === "Home") {
                event.preventDefault();
                prompts[0].focus();
                return;
            }

            if (event.key === "End") {
                event.preventDefault();
                prompts[prompts.length - 1].focus();
                return;
            }

            if (!(event.key in keyMap)) {
                return;
            }

            event.preventDefault();
            prompts[(index + keyMap[event.key] + prompts.length) % prompts.length].focus();
        });
    });

    close?.addEventListener("click", closeNote);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && root.contains(document.activeElement)) {
            closeNote();
        }
    });
}

window.addEventListener("DOMContentLoaded", initFieldNotes);
