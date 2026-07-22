const HERO_VIEWS = [
    {
        id: "side-a",
        code: "01",
        label: "SIDE PROFILE",
        detail: "Reverse Swoosh / brown nubuck",
        image: "assets/hf-side-a.png",
        fit: "wide",
        depth: 0.94,
        biasX: 0,
        biasY: 0
    },
    {
        id: "front",
        code: "02",
        label: "FRONT LOCK",
        detail: "Nike Air tongue / toe geometry",
        image: "assets/hf-front.png",
        fit: "front",
        depth: 1.08,
        biasX: -20,
        biasY: -8
    },
    {
        id: "side-b",
        code: "03",
        label: "COUNTER SIDE",
        detail: "Opposite angle / low sole line",
        image: "assets/hf-side-b.png",
        fit: "wide",
        depth: 0.96,
        biasX: 8,
        biasY: 0
    },
    {
        id: "rear",
        code: "04",
        label: "HEEL DETAIL",
        detail: "Cactus Jack embroidery / heel tab",
        image: "assets/hf-rear-original.png",
        fit: "rear",
        depth: 1.05,
        biasX: 6,
        biasY: -10
    },
    {
        id: "top",
        code: "05",
        label: "TOP SCAN",
        detail: "Laces / tongue / toe box map",
        image: "assets/hf-top.png",
        fit: "top",
        depth: 1.12,
        biasX: -8,
        biasY: -18
    }
];

const CDN_TIMEOUT = 5200;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1];
const EASE_IN_OUT = [0.76, 0, 0.24, 1];

function angleButtonMarkup(view, index) {
    return `
        <button class="hero-angle-button ${index === 0 ? "is-active" : ""}" type="button" data-angle-index="${index}">
            <i aria-hidden="true"></i>
            <span>${view.code}</span>
            <img src="${view.image}" alt="">
            <strong>${view.label}</strong>
        </button>
    `;
}

function setSceneVars(shell, event) {
    const rect = shell.getBoundingClientRect();
    const nx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    shell.style.setProperty("--mx", nx.toFixed(4));
    shell.style.setProperty("--my", ny.toFixed(4));
    shell.style.setProperty("--tilt-x", `${(-ny * 2.2).toFixed(2)}deg`);
    shell.style.setProperty("--tilt-y", `${(nx * 3.4).toFixed(2)}deg`);
    shell.style.setProperty("--depth-x", `${(nx * 18).toFixed(2)}px`);
    shell.style.setProperty("--depth-y", `${(ny * 12).toFixed(2)}px`);
    shell.style.setProperty("--dx-sm", `${(nx * 8).toFixed(2)}px`);
    shell.style.setProperty("--dy-sm", `${(ny * 6).toFixed(2)}px`);
    shell.style.setProperty("--dx-md", `${(nx * 15).toFixed(2)}px`);
    shell.style.setProperty("--dy-md", `${(ny * 10).toFixed(2)}px`);
    shell.style.setProperty("--dx-lg", `${(nx * 26).toFixed(2)}px`);
    shell.style.setProperty("--dy-lg", `${(ny * 16).toFixed(2)}px`);
    shell.style.setProperty("--rx-sm", `${(-ny * 0.9).toFixed(2)}deg`);
    shell.style.setProperty("--ry-sm", `${(nx * 1.4).toFixed(2)}deg`);
    shell.style.setProperty("--rz-sm", `${(nx * 0.8).toFixed(2)}deg`);
}

function fallbackHero(root) {
    const active = HERO_VIEWS[0];
    root.innerHTML = `
        <div class="hero-product-shell is-fallback" style="--mx:0;--my:0;--tilt-x:0deg;--tilt-y:0deg;--depth-x:0px;--depth-y:0px;--hero-scroll:0;">
            <div class="hero-depth-field" aria-hidden="true">
                <span></span><span></span><span></span>
            </div>
            <div class="hero-product-meta">
                <span>[${active.code} / ${active.label}]</span>
                <strong>${active.detail}</strong>
            </div>
            <div class="hero-product-viewport">
                <div class="hero-air-field" aria-hidden="true">
                    <span></span><span></span><span></span><span></span><span></span><span></span>
                </div>
                <div class="hero-product-floor"></div>
                <div class="hero-product-rings" aria-hidden="true"></div>
                <div class="hero-orbit-lines" aria-hidden="true"></div>
                <img class="hero-product-img is-${active.fit}" src="${active.image}" alt="Travis Scott Air Jordan 1 Low ${active.label}">
                <img class="hero-product-skin is-${active.fit}" src="${active.image}" alt="">
                <img class="hero-product-laces is-${active.fit}" src="${active.image}" alt="">
                <img class="hero-product-tongue is-${active.fit}" src="${active.image}" alt="">
                <img class="hero-product-logo-glow is-${active.fit}" src="${active.image}" alt="">
                <div class="hero-energy-wave" aria-hidden="true"></div>
                <img class="hero-product-reflection is-${active.fit}" src="${active.image}" alt="">
                <div class="hero-sole-pressure" aria-hidden="true"></div>
                <div class="hero-product-shadow"></div>
                <div class="hero-scan-line" aria-hidden="true"></div>
                <div class="hero-depth-slab" aria-hidden="true"></div>
            </div>
            <div class="hero-angle-strip" aria-label="Product angles">
                ${HERO_VIEWS.map(angleButtonMarkup).join("")}
            </div>
        </div>
    `;

    let activeIndex = 0;
    let timer = null;
    const shell = root.querySelector(".hero-product-shell");
    const image = root.querySelector(".hero-product-img");
    const skin = root.querySelector(".hero-product-skin");
    const laces = root.querySelector(".hero-product-laces");
    const tongue = root.querySelector(".hero-product-tongue");
    const logoGlow = root.querySelector(".hero-product-logo-glow");
    const reflection = root.querySelector(".hero-product-reflection");
    const meta = root.querySelector(".hero-product-meta");
    const buttons = [...root.querySelectorAll(".hero-angle-button")];

    const setActive = (nextIndex) => {
        activeIndex = nextIndex;
        const next = HERO_VIEWS[activeIndex];
        image.className = `hero-product-img is-${next.fit} is-switching`;
        window.setTimeout(() => {
            image.src = next.image;
            image.alt = `Travis Scott Air Jordan 1 Low ${next.label}`;
            skin.src = next.image;
            skin.className = `hero-product-skin is-${next.fit}`;
            laces.src = next.image;
            laces.className = `hero-product-laces is-${next.fit}`;
            tongue.src = next.image;
            tongue.className = `hero-product-tongue is-${next.fit}`;
            logoGlow.src = next.image;
            logoGlow.className = `hero-product-logo-glow is-${next.fit}`;
            reflection.src = next.image;
            reflection.className = `hero-product-reflection is-${next.fit}`;
            meta.innerHTML = `<span>[${next.code} / ${next.label}]</span><strong>${next.detail}</strong>`;
            image.classList.remove("is-switching");
        }, 170);

        buttons.forEach((button, index) => {
            button.classList.toggle("is-active", index === activeIndex);
        });
    };

    const restart = () => window.clearInterval(timer);

    shell.addEventListener("pointermove", (event) => setSceneVars(shell, event));
    shell.addEventListener("pointerleave", () => {
        shell.style.setProperty("--mx", "0");
        shell.style.setProperty("--my", "0");
        shell.style.setProperty("--tilt-x", "0deg");
        shell.style.setProperty("--tilt-y", "0deg");
        shell.style.setProperty("--depth-x", "0px");
        shell.style.setProperty("--depth-y", "0px");
        shell.style.setProperty("--dx-sm", "0px");
        shell.style.setProperty("--dy-sm", "0px");
        shell.style.setProperty("--dx-md", "0px");
        shell.style.setProperty("--dy-md", "0px");
        shell.style.setProperty("--dx-lg", "0px");
        shell.style.setProperty("--dy-lg", "0px");
        shell.style.setProperty("--rx-sm", "0deg");
        shell.style.setProperty("--ry-sm", "0deg");
        shell.style.setProperty("--rz-sm", "0deg");
    });

    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            setActive(index);
        });
    });

    const onScroll = () => {
        const max = Math.max(window.innerHeight, 1);
        const amount = Math.min(1, Math.max(0, window.scrollY / max));
        shell.style.setProperty("--hero-scroll", amount.toFixed(3));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
        window.clearInterval(timer);
        window.removeEventListener("scroll", onScroll);
    };
}

async function importMotion() {
    const timeout = new Promise((_, reject) => {
        window.setTimeout(() => reject(new Error("Framer Motion CDN timeout")), CDN_TIMEOUT);
    });

    const modules = Promise.all([
        import("https://esm.sh/react@18.2.0"),
        import("https://esm.sh/react-dom@18.2.0/client"),
        import("https://esm.sh/framer-motion@11.18.2?deps=react@18.2.0,react-dom@18.2.0")
    ]);

    return Promise.race([modules, timeout]);
}

function mountFramerHero(root, React, ReactDOM, Motion) {
    const { useMemo, useRef, useState } = React;
    const {
        AnimatePresence,
        LayoutGroup,
        motion,
        useMotionValue,
        useScroll,
        useSpring,
        useVelocity,
        useMotionTemplate,
        useTransform
    } = Motion;

    function ProductScanner() {
        const [activeIndex, setActiveIndex] = useState(0);
        const [hoverIndex, setHoverIndex] = useState(null);
        const shellRef = useRef(null);
        const mx = useMotionValue(0);
        const my = useMotionValue(0);
        const sx = useSpring(mx, { stiffness: 58, damping: 24, mass: 1.6 });
        const sy = useSpring(my, { stiffness: 58, damping: 24, mass: 1.6 });
        const vx = useVelocity(sx);
        const { scrollYProgress } = useScroll();
        const scrollLift = useTransform(scrollYProgress, [0, 0.18], [0, -72]);
        const scrollFade = useTransform(scrollYProgress, [0, 0.2], [1, 0.72]);
        const rotateX = useTransform(sy, [-1, 1], [2.2, -2.2]);
        const rotateY = useTransform(sx, [-1, 1], [-3.8, 3.8]);
        const dxSm = useTransform(sx, [-1, 1], ["-8px", "8px"]);
        const dySm = useTransform(sy, [-1, 1], ["-6px", "6px"]);
        const dxMd = useTransform(sx, [-1, 1], ["-15px", "15px"]);
        const dyMd = useTransform(sy, [-1, 1], ["-10px", "10px"]);
        const dxLg = useTransform(sx, [-1, 1], ["-26px", "26px"]);
        const dyLg = useTransform(sy, [-1, 1], ["-16px", "16px"]);
        const rxSm = useTransform(sy, [-1, 1], ["0.9deg", "-0.9deg"]);
        const rySm = useTransform(sx, [-1, 1], ["-1.4deg", "1.4deg"]);
        const rzSm = useTransform(sx, [-1, 1], ["-0.8deg", "0.8deg"]);
        const lightX = useTransform(sx, [-1, 1], [32, 68]);
        const velocityGlow = useTransform(vx, [-1200, 0, 1200], [0.18, 0.34, 0.58]);
        const lightGradient = useMotionTemplate`radial-gradient(circle at ${lightX}% 48%, rgba(244, 160, 184, ${velocityGlow}), transparent 32%)`;
        const active = HERO_VIEWS[activeIndex];
        const preview = hoverIndex === null ? active : HERO_VIEWS[hoverIndex];

        const updateMouse = (event) => {
            const shell = shellRef.current;
            if (!shell) {
                return;
            }
            const rect = shell.getBoundingClientRect();
            mx.set(((event.clientX - rect.left) / rect.width - 0.5) * 2);
            my.set(((event.clientY - rect.top) / rect.height - 0.5) * 2);
        };

        const resetMouse = () => {
            mx.set(0);
            my.set(0);
            setHoverIndex(null);
        };

        const angleButtons = useMemo(() => HERO_VIEWS.map((view, index) => (
            React.createElement(motion.button, {
                className: `hero-angle-button ${index === activeIndex ? "is-active" : ""}`,
                type: "button",
                key: view.id,
                onClick: () => {
                    setActiveIndex(index);
                    setHoverIndex(null);
                },
                onPointerEnter: () => {
                    setHoverIndex(index);
                },
                onPointerLeave: () => setHoverIndex(null),
                initial: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
                animate: { opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" },
                exit: { opacity: 0, y: 16, clipPath: "inset(0 0 100% 0)" },
                whileHover: {
                    y: -10,
                    rotateZ: index % 2 === 0 ? -1.4 : 1.4,
                    "--card-depth": "18px"
                },
                whileTap: { scale: 0.96, y: -2 },
                transition: {
                    duration: 0.01,
                    delay: 0,
                    ease: EASE_OUT_EXPO
                }
            },
                index === activeIndex ? React.createElement(motion.b, {
                    className: "hero-angle-active-mark",
                    layoutId: "hero-angle-active-mark",
                    transition: { type: "spring", stiffness: 420, damping: 34, mass: 0.8 }
                }) : null,
                React.createElement("i", { "aria-hidden": "true" }),
                React.createElement("span", null, view.code),
                React.createElement("img", { src: view.image, alt: "" }),
                React.createElement("strong", null, view.label)
            )
        )), [activeIndex]);

        return React.createElement(motion.div, {
            className: "hero-product-shell is-framer-product",
            ref: shellRef,
            onPointerMove: updateMouse,
            onPointerLeave: resetMouse,
            initial: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
            animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
            exit: { opacity: 0, y: -48, scale: 1.03, filter: "blur(8px)" },
            transition: { duration: 0.01, ease: EASE_OUT_EXPO },
            style: {
                y: scrollLift,
                opacity: scrollFade,
                rotateX,
                rotateY,
                transformPerspective: 1200,
                "--mx": sx,
                "--my": sy,
                "--dx-sm": dxSm,
                "--dy-sm": dySm,
                "--dx-md": dxMd,
                "--dy-md": dyMd,
                "--dx-lg": dxLg,
                "--dy-lg": dyLg,
                "--rx-sm": rxSm,
                "--ry-sm": rySm,
                "--rz-sm": rzSm
            }
        },
            React.createElement("div", { className: "hero-depth-field", "aria-hidden": "true" },
                React.createElement(motion.span, {
                    animate: { x: [0, 28, 0], y: [0, -14, 0], opacity: [0.25, 0.7, 0.25] },
                    transition: { duration: 12.6, delay: 8.4, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(motion.span, {
                    animate: { x: [0, -34, 0], y: [0, 18, 0], opacity: [0.18, 0.58, 0.18] },
                    transition: { duration: 13.8, delay: 8.9, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(motion.span, {
                    animate: { x: [0, 18, 0], y: [0, 22, 0], opacity: [0.12, 0.5, 0.12] },
                    transition: { duration: 15.2, delay: 9.5, repeat: Infinity, ease: "easeInOut" }
                })
            ),
            React.createElement(AnimatePresence, { mode: "wait" },
                React.createElement(motion.div, {
                    className: "hero-product-meta",
                    key: `${preview.id}-meta`,
                    initial: { opacity: 1, y: 0, x: 0, clipPath: "inset(0 0% 0 0)" },
                    animate: { opacity: 1, y: 0, x: 0, clipPath: "inset(0 0% 0 0)" },
                    exit: { opacity: 0, y: -14, x: 18, clipPath: "inset(0 0 0 100%)" },
                    transition: { duration: 0.01, ease: EASE_OUT_EXPO }
                },
                    React.createElement("span", null, `[${preview.code} / ${preview.label}]`),
                    React.createElement("strong", null, preview.detail)
                )
            ),
            React.createElement(LayoutGroup, null,
            React.createElement("div", { className: "hero-product-viewport" },
                React.createElement("div", { className: "hero-air-field", "aria-hidden": "true" },
                    Array.from({ length: 6 }).map((_, index) => React.createElement(motion.span, {
                        key: `air-${index}`,
                        animate: {
                            x: [0, index % 2 ? -8 : 10, 0],
                            y: [0, -8 - index, 0],
                            rotate: [0, index % 2 ? -1.2 : 1.2, 0]
                        },
                        transition: {
                            duration: 8.8 + index * 0.8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 8.8 + index * 0.42
                        }
                    }))
                ),
                React.createElement(motion.div, {
                    className: "hero-live-light",
                    "aria-hidden": "true",
                    style: { background: lightGradient },
                    animate: { opacity: [0.18, 0.26, 0.18] },
                    transition: { duration: 12.4, delay: 8.8, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(motion.div, {
                    className: "hero-product-floor",
                    initial: { opacity: 0.76, rotateX: 62, scale: 1 },
                    animate: { opacity: 0.76, rotateX: 62, scale: 1 },
                    transition: { duration: 0.01, ease: EASE_OUT_EXPO }
                }),
                React.createElement(motion.div, {
                    className: "hero-product-rings",
                    "aria-hidden": "true",
                    initial: { opacity: 0.82, scale: 1, rotateX: 64 },
                    animate: {
                        opacity: [0.78, 0.9, 0.78],
                        scale: [1, 1.012, 1],
                        rotateZ: [0, 0.55, 0]
                    },
                    transition: { duration: 13.8, delay: 8.6, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(motion.div, {
                    className: "hero-orbit-lines",
                    "aria-hidden": "true",
                    animate: { rotateZ: [-0.7, 0.7, -0.7], opacity: [0.3, 0.48, 0.3] },
                    transition: { duration: 16.5, delay: 9.2, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: active.id,
                        className: `hero-product-img is-${active.fit}`,
                        src: active.image,
                        alt: `Travis Scott Air Jordan 1 Low ${active.label}`,
                        initial: false,
                        animate: {
                            opacity: 1,
                            x: active.biasX,
                            y: active.biasY,
                            scale: active.depth,
                            rotateZ: 0,
                            filter: "blur(0px) saturate(1.06) brightness(1)",
                            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        },
                        exit: {
                            opacity: 0,
                            x: -90 + active.biasX,
                            y: -8 + active.biasY,
                            scale: active.depth * 1.025,
                            rotateZ: 1.3,
                            filter: "blur(10px) saturate(0.92) brightness(0.86)",
                            clipPath: "polygon(0 0, 100% 0, 58% 100%, 42% 100%)"
                        },
                        transition: {
                            duration: 0.82,
                            ease: EASE_IN_OUT
                        },
                        draggable: "false"
                    })
                ),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: `${active.id}-skin`,
                        className: `hero-product-skin is-${active.fit}`,
                        src: active.image,
                        alt: "",
                        initial: false,
                        animate: {
                            x: active.biasX * 0.72,
                            y: active.biasY + 2,
                            rotateZ: -0.15,
                            filter: "blur(0px) saturate(1.22) brightness(1.08)",
                            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        },
                        exit: {
                            x: -70 + active.biasX,
                            y: active.biasY,
                            rotateZ: 1,
                            filter: "blur(10px) saturate(0.78) brightness(0.9)",
                            clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)"
                        },
                        transition: {
                            duration: 0.96,
                            delay: 0.055,
                            ease: EASE_IN_OUT
                        },
                        draggable: "false"
                    })
                ),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: `${active.id}-laces`,
                        className: `hero-product-laces is-${active.fit}`,
                        src: active.image,
                        alt: "",
                        initial: false,
                        animate: {
                            x: active.biasX * 0.48,
                            y: active.biasY + 4,
                            rotateZ: 0.18,
                            filter: "blur(0px) brightness(1.12)",
                            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        },
                        exit: {
                            x: -58 + active.biasX,
                            y: active.biasY + 8,
                            rotateZ: 0.7,
                            filter: "blur(8px) brightness(0.92)",
                            clipPath: "polygon(0 0, 100% 0, 60% 100%, 40% 100%)"
                        },
                        transition: {
                            duration: 1.02,
                            delay: 0.105,
                            ease: EASE_IN_OUT
                        },
                        draggable: "false"
                    })
                ),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: `${active.id}-tongue`,
                        className: `hero-product-tongue is-${active.fit}`,
                        src: active.image,
                        alt: "",
                        initial: false,
                        animate: {
                            x: active.biasX * 0.42,
                            y: active.biasY + 2,
                            filter: "blur(0px) brightness(1.08)",
                            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                        },
                        exit: {
                            x: -46 + active.biasX,
                            y: active.biasY + 4,
                            filter: "blur(8px) brightness(0.94)",
                            clipPath: "polygon(0 0, 100% 0, 58% 100%, 42% 100%)"
                        },
                        transition: {
                            duration: 1.04,
                            delay: 0.14,
                            ease: EASE_IN_OUT
                        },
                        draggable: "false"
                    })
                ),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: `${active.id}-logo-glow`,
                        className: `hero-product-logo-glow is-${active.fit}`,
                        src: active.image,
                        alt: "",
                        initial: false,
                        animate: {
                            opacity: 1,
                            x: active.biasX * 0.36,
                            y: active.biasY + 1,
                            filter: "blur(2px) brightness(1.38)"
                        },
                        exit: {
                            opacity: 0,
                            x: -54 + active.biasX,
                            y: active.biasY,
                            filter: "blur(10px) brightness(0.9)"
                        },
                        transition: {
                            duration: 0.92,
                            delay: 0.18,
                            ease: EASE_IN_OUT
                        },
                        draggable: "false"
                    })
                ),
                React.createElement(motion.div, {
                    className: "hero-energy-wave",
                    "aria-hidden": "true"
                }),
                React.createElement(AnimatePresence, { mode: "wait", initial: false },
                    React.createElement(motion.img, {
                        key: `${active.id}-reflection`,
                        className: `hero-product-reflection is-${active.fit}`,
                        src: active.image,
                        alt: "",
                        initial: { opacity: 0, scaleY: -0.22, y: -10, filter: "blur(12px) saturate(0.7)" },
                        animate: { opacity: active.fit === "wide" ? 0.2 : 0.14, scaleY: -0.36, y: 0, filter: "blur(7px) saturate(0.86)" },
                        exit: { opacity: 0, scaleY: -0.18, y: 12, filter: "blur(14px) saturate(0.62)" },
                        transition: { duration: 0.78, ease: EASE_IN_OUT },
                        draggable: "false"
                    })
                ),
                React.createElement(motion.div, {
                    className: "hero-sole-pressure",
                    key: `${active.id}-pressure`,
                    initial: { scaleX: 0.62, y: 12, filter: "blur(18px)" },
                    animate: {
                        scaleX: active.fit === "wide" ? [0.86, 1, 0.92] : [0.42, 0.56, 0.48],
                        y: [4, 0, 4],
                        filter: ["blur(18px)", "blur(10px)", "blur(18px)"]
                    },
                    transition: { duration: 12.2, delay: 8.2, repeat: Infinity, ease: "easeInOut" }
                }),
                React.createElement(motion.div, {
                    className: "hero-product-shadow",
                    key: `${active.id}-shadow`,
                    initial: {
                        opacity: active.fit === "wide" ? 0.74 : 0.56,
                        scaleX: active.fit === "wide" ? 1 : 0.62,
                        y: 0
                    },
                    animate: {
                        opacity: active.fit === "wide" ? 0.74 : 0.56,
                        scaleX: active.fit === "wide" ? 1 : 0.62,
                        y: 0
                    },
                    transition: { duration: 0.01, ease: EASE_OUT_EXPO }
                }),
                React.createElement(motion.div, {
                    className: "hero-scan-line",
                    "aria-hidden": "true",
                    animate: { x: ["-22%", "118%"], opacity: [0, 0.95, 0] },
                    transition: { duration: 1.08, delay: 10.8, repeat: Infinity, repeatDelay: 7.4, ease: EASE_OUT_EXPO }
                }),
                React.createElement(motion.div, {
                    className: "hero-depth-slab",
                    key: `${preview.id}-slab`,
                    initial: { opacity: 0.54, x: 0, skewX: -13 },
                    animate: { opacity: 0.54, x: 0, skewX: -13 },
                    exit: { opacity: 0, x: -28, skewX: -13 },
                    transition: { duration: 0.01, ease: EASE_OUT_EXPO }
                }),
                React.createElement(motion.div, {
                    className: "hero-flash-cut",
                    key: `${active.id}-flash`,
                    initial: { opacity: 0.42, scaleX: 0 },
                    animate: { opacity: 0, scaleX: 1 },
                    transition: { duration: 0.52, ease: EASE_OUT_EXPO }
                })
            ),
            React.createElement("div", { className: "hero-angle-strip", "aria-label": "Product angles" }, angleButtons)
            )
        );
    }

    root.innerHTML = "";
    ReactDOM.createRoot(root).render(React.createElement(ProductScanner));
}

async function bootHeroProduct() {
    const root = document.getElementById("heroProductStage");
    if (!root) {
        return;
    }

    const cleanupFallback = fallbackHero(root);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    try {
        const [React, ReactDOM, Motion] = await importMotion();
        cleanupFallback();
        mountFramerHero(root, React, ReactDOM, Motion);
    } catch (error) {
        console.warn("Hero product fallback:", error);
    }
}

window.addEventListener("DOMContentLoaded", bootHeroProduct);
