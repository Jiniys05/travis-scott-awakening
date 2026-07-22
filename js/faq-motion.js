function extractFaqItems(root) {
    return [...root.querySelectorAll("article")].map((article, index) => ({
        id: `faq-${index}`,
        question: article.querySelector("h3")?.textContent.trim() || `Question ${index + 1}`,
        answer: article.querySelector("p")?.textContent.trim() || ""
    }));
}

async function enhanceFaq() {
    const root = document.querySelector(".faq-list");
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const items = extractFaqItems(root);
    const sampleStrip = root.querySelector(".faq-sample-strip")?.outerHTML || "";
    if (!items.length) {
        return;
    }

    try {
        const timeout = new Promise((_, reject) => {
            window.setTimeout(() => reject(new Error("FAQ motion CDN timeout")), 5200);
        });
        const modules = Promise.all([
            import("https://esm.sh/react@18.2.0"),
            import("https://esm.sh/react-dom@18.2.0/client"),
            import("https://esm.sh/framer-motion@11.18.2?deps=react@18.2.0,react-dom@18.2.0")
        ]);
        const [{ default: React }, { createRoot }, framer] = await Promise.race([modules, timeout]);
        const { AnimatePresence, LayoutGroup, motion } = framer;
        const h = React.createElement;

        function FaqExperience() {
            const [active, setActive] = React.useState(0);

            return h(LayoutGroup, null,
                h(motion.div, {
                    className: "faq-motion-grid",
                    initial: "hidden",
                    whileInView: "show",
                    viewport: { once: true, amount: 0.22 },
                    variants: {
                        hidden: {},
                        show: { transition: { staggerChildren: 0.08 } }
                    }
                }, [
                    ...items.map((item, index) => {
                    const selected = active === index;
                    return h(motion.button, {
                        key: item.id,
                        type: "button",
                        className: `faq-motion-item${selected ? " is-active" : ""}`,
                        onClick: () => setActive(index),
                        onMouseEnter: () => setActive(index),
                        layout: true,
                        variants: {
                            hidden: { y: 52, clipPath: "inset(100% 0 0 0)", filter: "blur(8px)" },
                            show: { y: 0, clipPath: "inset(0% 0 0 0)", filter: "blur(0px)" }
                        },
                        transition: { duration: 0.72, ease: [0.16, 1, 0.3, 1] },
                        whileHover: { rotateX: -3, rotateY: index % 2 ? -2 : 2, y: -8 },
                        whileTap: { scale: 0.985 }
                    }, [
                        selected ? h(motion.span, {
                            key: "mark",
                            className: "faq-active-mark",
                            layoutId: "faq-active-mark",
                            transition: { type: "spring", stiffness: 380, damping: 32 }
                        }) : null,
                        h("span", { className: "faq-number", key: "num" }, `0${index + 1}`),
                        h("h3", { key: "q" }, item.question),
                        h(AnimatePresence, { key: "presence", initial: false },
                            selected ? h(motion.p, {
                                key: "answer",
                                initial: { height: 0, opacity: 0, filter: "blur(6px)" },
                                animate: { height: "auto", opacity: 1, filter: "blur(0px)" },
                                exit: { height: 0, opacity: 0, filter: "blur(6px)" },
                                transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] }
                            }, item.answer) : null
                        )
                    ]);
                    }),
                    sampleStrip ? h(motion.div, {
                        key: "samples",
                        className: "faq-motion-samples",
                        initial: { clipPath: "inset(100% 0 0 0)", filter: "blur(8px)" },
                        whileInView: { clipPath: "inset(0% 0 0 0)", filter: "blur(0px)" },
                        viewport: { once: true, amount: 0.18 },
                        transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
                        dangerouslySetInnerHTML: { __html: sampleStrip }
                    }) : null
                ])
            );
        }

        root.innerHTML = "";
        root.classList.add("is-faq-motion");
        createRoot(root).render(h(FaqExperience));
    } catch (error) {
        console.warn("FAQ motion fallback:", error);
    }
}

window.addEventListener("DOMContentLoaded", enhanceFaq);
