/* =========================================================
   PNG BAZAR - MAIN.JS
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

const pngItems =
    typeof pngData !== "undefined"
        ? pngData
        : [];


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initTheme();
    initMobileMenu();
    initFavorites();

    renderHomePNGs();
    renderCategoryPNGs();

    initImagePage();

});


/* =========================================================
   HOME PAGE
   ========================================================= */

function renderHomePNGs() {

    const grid =
        document.querySelector(".png-grid");

    if (!grid || pngItems.length === 0) {
        return;
    }

    grid.innerHTML = "";

    pngItems.forEach(item => {

        const card =
            createPNGCard(item);

        grid.appendChild(card);

    });

}


/* =========================================================
   CATEGORY PAGE
   ========================================================= */

function renderCategoryPNGs() {

    const grid =
        document.querySelector(".png-grid");

    if (!grid) {
        return;
    }

    const category =
        new URLSearchParams(
            window.location.search
        ).get("category");

    if (!category) {
        return;
    }

    const filtered =
        pngItems.filter(item =>
            item.category.toLowerCase() ===
            category.toLowerCase()
        );

    grid.innerHTML = "";

    if (filtered.length === 0) {

        showEmptyState(
            grid,
            "No PNGs found in this category."
        );

        return;
    }

    filtered.forEach(item => {

        grid.appendChild(
            createPNGCard(item)
        );

    });

}


/* =========================================================
   CREATE PNG CARD
   ========================================================= */

function createPNGCard(item) {

    const card =
        document.createElement("article");

    card.className = "png-card";

    card.innerHTML = `

        <a
            href="image.html?id=${item.id}"
            class="png-card-image">

            <img
                src="${item.image}"
                alt="${escapeHTML(item.title)}"
                loading="lazy">

        </a>


        <div class="png-card-content">

            <a
                href="image.html?id=${item.id}"
                class="png-card-title">

                ${escapeHTML(item.title)}

            </a>


            <div class="png-card-meta">

                <span>
                    ${escapeHTML(item.category)}
                </span>

            </div>

        </div>

    `;

    return card;
}


/* =========================================================
   IMAGE DETAIL PAGE
   ========================================================= */

function initImagePage() {

    if (!window.location.pathname.endsWith("image.html")) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        Number(params.get("id"));

    if (!id) {
        return;
    }

    const item =
        pngItems.find(
            png => Number(png.id) === id
        );

    if (!item) {
        console.warn(
            "PNG not found:",
            id
        );

        return;
    }

    populateImagePage(item);

}


/* =========================================================
   POPULATE IMAGE PAGE
   ========================================================= */

function populateImagePage(item) {

    /* ---------- IMAGE ---------- */

    const image =
        document.querySelector(
            ".transparent-preview img"
        );

    if (image) {

        image.src = item.image;

        image.alt = item.title;

        image.style.display = "block";

    }


    /* ---------- PLACEHOLDER ---------- */

    const placeholder =
        document.querySelector(
            ".image-placeholder"
        );

    if (placeholder) {
        placeholder.style.display = "none";
    }


    /* ---------- TITLE ---------- */

    const title =
        document.querySelector(
            ".image-information h1"
        );

    if (title) {
        title.textContent =
            item.title;
    }


    /* ---------- CATEGORY ---------- */

    const category =
        document.querySelector(
            ".image-category"
        );

    if (category) {
        category.textContent =
            item.category;
    }


    /* ---------- DESCRIPTION ---------- */

    const description =
        document.querySelector(
            ".image-description"
        );

    if (description) {

        description.textContent =
            item.description ||
            `Download this free ${item.category} PNG image from PNG Bazar.`;

    }


    /* ---------- META ---------- */

    updateMeta(
        "Format",
        "PNG"
    );

    updateMeta(
        "Background",
        "Transparent"
    );

    if (item.dimensions) {

        updateMeta(
            "Dimensions",
            item.dimensions
        );

    }

    if (item.size) {

        updateMeta(
            "File Size",
            item.size
        );

    }

    updateMeta(
        "Category",
        item.category
    );

    if (item.downloads !== undefined) {

        updateMeta(
            "Downloads",
            formatNumber(item.downloads)
        );

    }


    /* ---------- TAGS ---------- */

    renderTags(item);


    /* ---------- DOWNLOAD ---------- */

    setupDownloadButton(item);


    /* ---------- FAVORITE ---------- */

    setupDetailFavorite(item);


    /* ---------- BREADCRUMB ---------- */

    updateBreadcrumb(item);


    /* ---------- RELATED ---------- */

    renderRelatedPNGs(item);

}


/* =========================================================
   UPDATE META
   ========================================================= */

function updateMeta(label, value) {

    const metaItems =
        document.querySelectorAll(
            ".meta-item"
        );

    metaItems.forEach(item => {

        const text =
            item.innerText
                .trim()
                .toLowerCase();

        if (
            text.startsWith(
                label.toLowerCase()
            )
        ) {

            const valueElement =
                item.querySelector(
                    "strong, span:last-child"
                );

            if (valueElement) {
                valueElement.textContent =
                    value;
            }

        }

    });

}


/* =========================================================
   DOWNLOAD
   ========================================================= */

function setupDownloadButton(item) {

    const button =
        document.querySelector(
            ".main-download-button"
        );

    if (!button) {
        return;
    }

    button.onclick = async (event) => {

        event.preventDefault();

        try {

            const response =
                await fetch(item.image);

            const blob =
                await response.blob();

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            link.href = url;

            link.download =
                createFileName(item.title);

            document.body.appendChild(link);

            link.click();

            link.remove();

            URL.revokeObjectURL(url);

        } catch (error) {

            console.error(
                "Download failed:",
                error
            );

            /*
             * Fallback
             */

            const link =
                document.createElement("a");

            link.href =
                item.image;

            link.download =
                createFileName(item.title);

            link.target = "_blank";

            document.body.appendChild(link);

            link.click();

            link.remove();

        }

    };

}


/* =========================================================
   CREATE FILE NAME
   ========================================================= */

function createFileName(title) {

    return title
        .toLowerCase()
        .replace(/png/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        + ".png";

}


/* =========================================================
   TAGS
   ========================================================= */

function renderTags(item) {

    const container =
        document.querySelector(
            ".image-tags"
        );

    if (!container) {
        return;
    }

    if (
        !item.tags ||
        item.tags.length === 0
    ) {

        container.innerHTML = "";

        return;
    }

    container.innerHTML =
        item.tags.map(tag => `
            <span class="image-tag">
                ${escapeHTML(tag)}
            </span>
        `).join("");

}


/* =========================================================
   BREADCRUMB
   ========================================================= */

function updateBreadcrumb(item) {

    const breadcrumb =
        document.querySelector(
            ".breadcrumb"
        );

    if (!breadcrumb) {
        return;
    }

    breadcrumb.innerHTML = `

        <a href="index.html">
            Home
        </a>

        <span>/</span>

        <a href="category.html?category=${encodeURIComponent(item.category)}">
            ${escapeHTML(item.category)}
        </a>

        <span>/</span>

        <span>
            ${escapeHTML(item.title)}
        </span>

    `;

}


/* =========================================================
   RELATED PNGS
   ========================================================= */

function renderRelatedPNGs(item) {

    const grid =
        document.querySelector(
            ".related-grid"
        );

    if (!grid) {
        return;
    }

    const related =
        pngItems
            .filter(png =>
                png.id !== item.id &&
                png.category.toLowerCase() ===
                item.category.toLowerCase()
            )
            .slice(0, 4);


    if (related.length === 0) {

        grid.innerHTML =
            "<p>No related PNGs available.</p>";

        return;
    }


    grid.innerHTML = "";

    related.forEach(png => {

        grid.appendChild(
            createPNGCard(png)
        );

    });

}


/* =========================================================
   FAVORITES
   ========================================================= */

function initFavorites() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    ".image-favorite"
                );

            if (!button) {
                return;
            }

            const params =
                new URLSearchParams(
                    window.location.search
                );

            const id =
                Number(params.get("id"));

            if (!id) {
                return;
            }

            toggleFavorite(
                id,
                button
            );

        }
    );

}


function toggleFavorite(id, button) {

    let favorites =
        JSON.parse(
            localStorage.getItem(
                "pngbazarFavorites"
            )
        ) || [];


    if (favorites.includes(id)) {

        favorites =
            favorites.filter(
                favoriteId =>
                    favoriteId !== id
            );

        button.classList.remove(
            "active"
        );

    } else {

        favorites.push(id);

        button.classList.add(
            "active"
        );

    }


    localStorage.setItem(
        "pngbazarFavorites",
        JSON.stringify(favorites)
    );

}


/* =========================================================
   DETAIL PAGE FAVORITE
   ========================================================= */

function setupDetailFavorite(item) {

    const button =
        document.querySelector(
            ".image-favorite"
        );

    if (!button) {
        return;
    }

    const favorites =
        JSON.parse(
            localStorage.getItem(
                "pngbazarFavorites"
            )
        ) || [];


    if (favorites.includes(item.id)) {

        button.classList.add(
            "active"
        );

    }

}


/* =========================================================
   THEME
   ========================================================= */

function initTheme() {

    const button =
        document.querySelector(
            ".theme-toggle"
        );

    if (!button) {
        return;
    }


    const savedTheme =
        localStorage.getItem(
            "pngbazarTheme"
        );


    if (savedTheme === "dark") {

        document.body.classList.add(
            "dark-mode"
        );

    }


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark-mode"
            );


            const isDark =
                document.body.classList.contains(
                    "dark-mode"
                );


            localStorage.setItem(
                "pngbazarTheme",
                isDark
                    ? "dark"
                    : "light"
            );

        }
    );

}


/* =========================================================
   MOBILE MENU
   ========================================================= */

function initMobileMenu() {

    const button =
        document.querySelector(
            ".mobile-menu-button"
        );

    const nav =
        document.querySelector(
            ".main-nav"
        );

    if (!button || !nav) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            nav.classList.toggle(
                "mobile-open"
            );

        }
    );

}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function showEmptyState(
    container,
    message
) {

    container.innerHTML = `

        <div class="empty-state">

            <h3>
                No PNG Found
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


/* =========================================================
   NUMBER FORMAT
   ========================================================= */

function formatNumber(number) {

    return Number(number)
        .toLocaleString("en-IN");

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    if (value === undefined ||
        value === null) {

        return "";

    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

