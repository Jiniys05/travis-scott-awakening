function initFinale() {
    const replay = document.querySelector("[data-replay-film]");
    if (!replay) {
        return;
    }

    replay.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("hero:replay"));
    });
}

window.addEventListener("DOMContentLoaded", initFinale);
