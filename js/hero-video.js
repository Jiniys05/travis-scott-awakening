const PHASES = [
    { name: "void", at: 0 },
    { name: "forming", at: 1.4 },
    { name: "title", at: 3.2 },
    { name: "subtitle", at: 5.4 },
    { name: "cards", at: 7.4 },
    { name: "afterglow", at: 10.8 }
];

function setPhase(scene, phaseName) {
    if (scene.dataset.phase === phaseName) {
        return;
    }
    scene.dataset.phase = phaseName;
    scene.classList.toggle("is-afterglow", phaseName === "afterglow");
}

function phaseFor(time) {
    let current = PHASES[0].name;
    for (const phase of PHASES) {
        if (time >= phase.at) {
            current = phase.name;
        }
    }
    return current;
}

function bindPointer(scene) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
        currentX += (targetX - currentX) * 0.055;
        currentY += (targetY - currentY) * 0.055;
        scene.style.setProperty("--scene-x", currentX.toFixed(4));
        scene.style.setProperty("--scene-y", currentY.toFixed(4));
        requestAnimationFrame(tick);
    };

    scene.addEventListener("pointermove", (event) => {
        const rect = scene.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    }, { passive: true });

    scene.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
    });

    requestAnimationFrame(tick);
}

function bootHeroVideo() {
    const scene = document.getElementById("heroScene");
    const video = document.getElementById("awakeningFilm");

    if (!scene || !video) {
        return;
    }

    scene.classList.add("is-video-scene");
    setPhase(scene, "void");
    bindPointer(scene);

    let playStartedAt = 0;
    let rafId = 0;

    const update = () => {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 1;
        const elapsed = playStartedAt ? (performance.now() - playStartedAt) / 1000 : 0;
        const sceneTime = Math.max(video.currentTime, elapsed);
        const progress = Math.min(1, Math.max(0, sceneTime / duration));
        scene.style.setProperty("--film-progress", progress.toFixed(4));
        setPhase(scene, phaseFor(sceneTime));
    };

    const loop = () => {
        update();
        rafId = requestAnimationFrame(loop);
    };

    video.addEventListener("loadedmetadata", () => {
        scene.style.setProperty("--film-duration", video.duration.toFixed(2));
        update();
    });

    video.addEventListener("play", () => {
        if (!playStartedAt) {
            playStartedAt = performance.now() - video.currentTime * 1000;
        }
        scene.classList.add("is-film-playing");
        cancelAnimationFrame(rafId);
        loop();
    });

    video.addEventListener("timeupdate", update);
    video.addEventListener("ended", () => {
        cancelAnimationFrame(rafId);
        scene.style.setProperty("--film-progress", "1");
        setPhase(scene, "afterglow");
        scene.classList.add("is-film-complete");
    });

    const tryPlay = () => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {
                scene.classList.add("is-film-waiting");
            });
        }
    };

    if (video.readyState >= 2) {
        tryPlay();
        update();
    } else {
        video.addEventListener("canplay", tryPlay, { once: true });
    }
}

window.addEventListener("DOMContentLoaded", bootHeroVideo);
