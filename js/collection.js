const colorways = [
    {
        name: "SAIL PINK",
        code: "CW-01",
        tag: "SOFT SAIL / PINK NUBUCK",
        note: "Самая чистая пара для главного кадра: светлая кожа, мягкий pink и архивная подошва.",
        image: "assets/colorways/pink-pack-sail.png"
    },
    {
        name: "ROSE BROWN",
        code: "CW-02",
        tag: "DUSTY ROSE / EARTH SWOOSH",
        note: "Ближе к Travis-коду: розовый уходит в земляной тон, Swoosh становится тяжелее.",
        image: "assets/colorways/pink-pack-rose-brown.png"
    },
    {
        name: "DUST PHASE",
        code: "CW-03",
        tag: "MUTED PINK / GREY SWOOSH",
        note: "Пыльный вариант, который лучше всего дружит с analog grain и темным фоном.",
        image: "assets/colorways/pink-pack-dust.png"
    },
    {
        name: "HOT PINK",
        code: "CW-04",
        tag: "TONAL MAGENTA / WHITE SOLE",
        note: "Самый агрессивный pink: почти монохром, больше энергии, меньше архивности.",
        image: "assets/colorways/pink-pack-hot-pink.png"
    },
    {
        name: "MINT SHIFT",
        code: "CW-05",
        tag: "CORAL PINK / MINT SWOOSH",
        note: "Контрастный tropical-вектор: мягкий коралл против холодного mint.",
        image: "assets/colorways/pink-pack-mint.png"
    },
    {
        name: "RED STRIKE",
        code: "CW-06",
        tag: "PALE PINK / RED SWOOSH",
        note: "Самый прямой visual hit: красный Swoosh держит карточку даже в малом размере.",
        image: "assets/colorways/pink-pack-red.png"
    }
];

function fallbackRender(root) {
    root.innerHTML = `
        <div class="colorway-gallery">
            <article class="colorway-feature">
                <div class="feature-image-wrap">
                    <img src="${colorways[0].image}" alt="Travis Scott Air Jordan 1 Low ${colorways[0].name}">
                </div>
                <div class="feature-copy">
                    <span>${colorways[0].code} / FEATURED MODEL</span>
                    <h3>${colorways[0].name}</h3>
                    <p>${colorways[0].note}</p>
                </div>
            </article>
            <div class="colorway-stack">
                ${colorways.map((item, index) => `
                    <button class="shoe-item is-framer-motion${index === 0 ? " is-active" : ""}" type="button" style="--tilt:${index % 2 === 0 ? "-2deg" : "2deg"}">
                        <span class="shoe-index">${item.code}</span>
                        <div class="shoe-frame">
                            <img src="${item.image}" alt="Travis Scott Air Jordan 1 Low ${item.name}" loading="lazy" decoding="async">
                        </div>
                        <span class="shoe-label"><span>${item.tag}</span>${item.name}</span>
                    </button>
                `).join("")}
            </div>
        </div>
    `;
}

async function renderMotionGallery(root) {
    try {
        const timeout = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error("Framer Motion CDN timeout")), 6500);
        });
        const modules = Promise.all([
            import("https://esm.sh/react@18.2.0"),
            import("https://esm.sh/react-dom@18.2.0/client"),
            import("https://esm.sh/framer-motion@11.18.2?deps=react@18.2.0,react-dom@18.2.0")
        ]);
        const [{ default: React }, { createRoot }, framer] = await Promise.race([modules, timeout]);

        const { motion, AnimatePresence, LayoutGroup } = framer;
        const h = React.createElement;

        function Gallery() {
            const [activeIndex, setActiveIndex] = React.useState(0);
            const active = colorways[activeIndex];

            const cards = colorways.map((item, index) => {
                const selected = index === activeIndex;

                return h(motion.button, {
                    key: item.code,
                    type: "button",
                    className: `shoe-item is-framer-motion${selected ? " is-active" : ""}`,
                    style: { "--tilt": index % 2 === 0 ? "-2deg" : "2deg" },
                    onClick: () => setActiveIndex(index),
                    onMouseEnter: () => setActiveIndex(index),
                    "aria-pressed": selected,
                    initial: { opacity: 0, y: 38, rotate: index % 2 === 0 ? -2 : 2 },
                    whileInView: { opacity: 1, y: 0, rotate: 0 },
                    viewport: { once: true, amount: 0.25 },
                    transition: { duration: 0.72, delay: index * 0.055, ease: [0.16, 1, 0.3, 1] },
                    whileHover: { y: -10, scale: 1.025 },
                    whileTap: { scale: 0.985 }
                }, [
                    selected ? h(motion.b, {
                        className: "colorway-active-mark",
                        layoutId: "colorway-active-mark",
                        transition: { type: "spring", stiffness: 360, damping: 34, mass: 0.8 }
                    }) : null,
                    h("span", { className: "shoe-index", key: "index" }, item.code),
                    h("div", { className: "shoe-frame", key: "frame" },
                        h(motion.img, {
                            src: item.image,
                            alt: `Travis Scott Air Jordan 1 Low ${item.name}`,
                            loading: "lazy",
                            decoding: "async",
                            animate: selected ? { scale: 1.13, rotate: 0 } : { scale: 1.03, rotate: index % 2 === 0 ? -2 : 2 },
                            transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
                        })
                    ),
                    h("span", { className: "shoe-label", key: "label" }, [
                        h("span", { key: "tag" }, item.tag),
                        item.name
                    ])
                ]);
            });

            return h(LayoutGroup, null, h(motion.div, {
                className: "colorway-gallery",
                "data-active-colorway": active.code,
                initial: { opacity: 0, y: 42 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.18 },
                transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] }
            }, [
                h(motion.article, {
                    className: "colorway-feature",
                    key: "feature",
                    layout: true
                }, [
                    h("div", { className: "feature-image-wrap", key: "image-wrap" },
                        h(AnimatePresence, { mode: "wait" },
                            h(motion.img, {
                                key: active.image,
                                src: active.image,
                                alt: `Travis Scott Air Jordan 1 Low ${active.name}`,
                                initial: {
                                    opacity: 0,
                                    x: 86,
                                    y: 18,
                                    scale: 0.84,
                                    rotateY: -18,
                                    filter: "blur(14px) saturate(0.78)",
                                    clipPath: "polygon(48% 0, 52% 0, 58% 100%, 42% 100%)"
                                },
                                animate: {
                                    opacity: 1,
                                    x: 0,
                                    y: 0,
                                    scale: 1,
                                    rotateY: 0,
                                    filter: "blur(0px) saturate(1)",
                                    clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                                },
                                exit: {
                                    opacity: 0,
                                    x: -72,
                                    y: -10,
                                    scale: 0.92,
                                    rotateY: 16,
                                    filter: "blur(12px) saturate(0.72)",
                                    clipPath: "polygon(0 0, 100% 0, 62% 100%, 38% 100%)"
                                },
                                transition: { duration: 0.76, ease: [0.76, 0, 0.24, 1] }
                            })
                        )
                    ),
                    h(motion.div, {
                        className: "feature-copy",
                        key: active.code,
                        initial: { opacity: 0, y: 12 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.38, ease: [0.16, 1, 0.3, 1] }
                    }, [
                        h("span", { key: "code" }, `${active.code} / FEATURED MODEL`),
                        h("h3", { key: "name" }, active.name),
                        h("p", { key: "note" }, active.note)
                    ])
                ]),
                h("div", { className: "colorway-stack", key: "stack" }, cards)
            ]));
        }

        root.classList.add("is-motion-enhanced");
        createRoot(root).render(h(Gallery));
    } catch (error) {
        console.warn("Framer Motion gallery fallback:", error);
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("shoeGrid");
    if (!root) {
        return;
    }

    fallbackRender(root);
    renderMotionGallery(root);
});
