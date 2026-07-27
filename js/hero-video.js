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
    return PHASES.reduce((current, phase) => time >= phase.at ? phase.name : current, PHASES[0].name);
}

function bindPointer(scene) {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) {
        return;
    }

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frame = 0;

    const settle = () => {
        frame = 0;
        currentX += (targetX - currentX) * 0.075;
        currentY += (targetY - currentY) * 0.075;
        scene.style.setProperty("--scene-x", currentX.toFixed(4));
        scene.style.setProperty("--scene-y", currentY.toFixed(4));

        if (Math.abs(targetX - currentX) + Math.abs(targetY - currentY) > 0.0015) {
            frame = requestAnimationFrame(settle);
        }
    };

    const schedule = () => {
        if (!frame) {
            frame = requestAnimationFrame(settle);
        }
    };

    scene.addEventListener("pointermove", (event) => {
        const rect = scene.getBoundingClientRect();
        targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        schedule();
    }, { passive: true });

    scene.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        schedule();
    });
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

    let frame = 0;
    let hasCompleted = false;

    const update = () => {
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        const sceneTime = Math.max(0, video.currentTime || 0);
        const progress = duration ? Math.min(1, sceneTime / duration) : 0;
        scene.style.setProperty("--film-progress", progress.toFixed(4));
        setPhase(scene, phaseFor(sceneTime));
    };

    const stopFrame = () => {
        cancelAnimationFrame(frame);
        frame = 0;
    };

    const renderFrame = () => {
        frame = 0;
        update();
        if (!video.paused && !video.ended && !document.hidden) {
            frame = requestAnimationFrame(renderFrame);
        }
    };

    const startFrame = () => {
        if (!frame && !document.hidden) {
            frame = requestAnimationFrame(renderFrame);
        }
    };

    const finish = () => {
        if (hasCompleted) {
            return;
        }
        hasCompleted = true;
        stopFrame();
        scene.style.setProperty("--film-progress", "1");
        setPhase(scene, "afterglow");
        scene.classList.add("is-film-complete");
    };

    const failGracefully = () => {
        scene.classList.add("is-film-waiting");
        setPhase(scene, "afterglow");
    };

    const tryPlay = () => {
        if (document.hidden || hasCompleted) {
            return;
        }
        const playback = video.play();
        if (playback && typeof playback.catch === "function") {
            playback.catch(failGracefully);
        }
    };

    video.addEventListener("loadedmetadata", () => {
        scene.style.setProperty("--film-duration", video.duration.toFixed(2));
        update();
    });
    video.addEventListener("play", () => {
        scene.classList.remove("is-film-waiting");
        scene.classList.add("is-film-playing");
        startFrame();
    });
    video.addEventListener("pause", () => {
        if (!video.ended) {
            stopFrame();
        }
    });
    video.addEventListener("timeupdate", update);
    video.addEventListener("ended", finish);
    video.addEventListener("error", failGracefully);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopFrame();
            return;
        }
        if (!video.ended) {
            tryPlay();
        }
    });

    if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        tryPlay();
        update();
    } else {
        video.addEventListener("canplay", tryPlay, { once: true });
    }
}

window.addEventListener("DOMContentLoaded", bootHeroVideo);
