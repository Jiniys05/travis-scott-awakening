function enhanceFaq() {
    const root = document.querySelector(".faq-list");
    if (!root) {
        return;
    }

    const articles = [...root.querySelectorAll(":scope > article")];
    const sampleStrip = root.querySelector(":scope > .faq-sample-strip");
    if (!articles.length) {
        return;
    }

    const grid = document.createElement("div");
    grid.className = "faq-motion-grid";

    const selectItem = (selected) => {
        articles.forEach((article) => {
            const button = article.querySelector(".faq-question");
            const answer = article.querySelector("p");
            const isSelected = article === selected;
            article.classList.toggle("is-active", isSelected);
            button?.setAttribute("aria-expanded", String(isSelected));
            answer?.setAttribute("aria-hidden", String(!isSelected));
        });
    };

    articles.forEach((article, index) => {
        const heading = article.querySelector("h3");
        const answer = article.querySelector("p");
        if (!heading || !answer) {
            return;
        }

        const answerId = `detail-answer-${index + 1}`;
        answer.id = answerId;
        answer.setAttribute("aria-hidden", "true");
        article.classList.add("faq-motion-item");
        article.style.setProperty("--faq-index", String(index));

        const button = document.createElement("button");
        button.className = "faq-question";
        button.type = "button";
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", answerId);
        button.innerHTML = `<span class="faq-number">0${index + 1}</span><span class="faq-question-copy"></span><span class="faq-indicator" aria-hidden="true"></span>`;
        button.querySelector(".faq-question-copy").append(heading);
        article.insertBefore(button, answer);

        button.addEventListener("click", () => {
            const willOpen = !article.classList.contains("is-active");
            selectItem(willOpen ? article : null);
        });

        grid.append(article);
    });

    if (sampleStrip) {
        grid.append(sampleStrip);
    }

    root.innerHTML = "";
    root.classList.add("is-faq-motion");
    root.append(grid);
    selectItem(articles[0]);
    articles[0].querySelector("p")?.setAttribute("aria-hidden", "false");

    if ("IntersectionObserver" in window) {
        const reveal = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.14 });
        [...articles, sampleStrip].filter(Boolean).forEach((item) => reveal.observe(item));
    } else {
        [...articles, sampleStrip].filter(Boolean).forEach((item) => item.classList.add("is-visible"));
    }
}

window.addEventListener("DOMContentLoaded", enhanceFaq);
