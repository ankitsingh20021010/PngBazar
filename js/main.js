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


/*

 * Global data alias.

 * Keeps category-page scripts compatible with pngData.

 */

window.pngData = pngItems;


/* =========================================================


   DOM READY


   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    initTheme();


    initMobileMenu();


    initFavorites();


    renderHomePNGs();


 


    initImagePage();


});


/* =========================================================


   HOME PAGE


   ========================================================= */


function renderHomePNGs() {


    const grid = document.querySelector(".png-grid");


    if (!grid || pngItems.length === 0) return;


    const params = new URLSearchParams(window.location.search);


    /* Category pages use their own renderer. */


    if (params.has("category")) return;


    /* Search results are handled by search.js. */


    if (params.has("search")) {


        hideHomeLoadMore();


        return;


    }


    grid.innerHTML = "";


    const homeItems = getNextHomeItems(HOME_BATCH_SIZE);


    homeItems.forEach(item => {


        grid.appendChild(createPNGCard(item));


    });


    initHomeLoadMore();


}


/* =========================================================


   HOME PAGE PAGINATION / ROTATION


   ========================================================= */


const HOME_ROTATION_KEY = "pngbazarHomeRotation";


const HOME_BATCH_SIZE = 12;


function getHomeRotationState() {


    let rotation = {


        queue: [],


        shown: []


    };


    try {


        const saved = localStorage.getItem(HOME_ROTATION_KEY);


        if (saved) rotation = JSON.parse(saved);


    } catch (error) {


        console.warn("Home rotation data could not be read:", error);


    }


    if (!Array.isArray(rotation.queue)) rotation.queue = [];


    if (!Array.isArray(rotation.shown)) rotation.shown = [];


    const currentIds = pngItems.map(item => String(item.id));


    rotation.queue = rotation.queue.filter(id =>


        currentIds.includes(String(id))


    );


    rotation.shown = rotation.shown.filter(id =>


        currentIds.includes(String(id))


    );


    return rotation;


}


function saveHomeRotationState(rotation) {


    try {


        localStorage.setItem(


            HOME_ROTATION_KEY,


            JSON.stringify(rotation)


        );


    } catch (error) {


        console.warn("Home rotation data could not be saved:", error);


    }


}


function getNextHomeItems(count = HOME_BATCH_SIZE) {


    const rotation = getHomeRotationState();


    const currentIds = pngItems.map(item => String(item.id));


    /* Fill the queue from the current cycle. */


    if (rotation.queue.length < count) {


        const remainingIds = currentIds.filter(id =>


            !rotation.shown.includes(id) &&


            !rotation.queue.includes(id)


        );


        if (remainingIds.length > 0) {


            rotation.queue.push(...shuffleHomeIds(remainingIds));


        }


    }


    /*


     * If fewer than 12 remain in this cycle, finish those first,


     * then start a new shuffled cycle only if needed.


     */


    if (rotation.queue.length < count && rotation.shown.length > 0) {


        rotation.shown = [];


        const freshIds = currentIds.filter(id =>


            !rotation.queue.includes(id)


        );


        rotation.queue.push(...shuffleHomeIds(freshIds));


    }


    const ids = rotation.queue.splice(0, count);


    const items = ids.map(id =>


        pngItems.find(item => String(item.id) === String(id))


    ).filter(Boolean);


    items.forEach(item => {


        const id = String(item.id);


        if (!rotation.shown.includes(id)) {


            rotation.shown.push(id);


        }


    });


    saveHomeRotationState(rotation);


    return items;


}


function shuffleHomeIds(ids) {


    const shuffled = [...ids];


    for (let i = shuffled.length - 1; i > 0; i--) {


        const j = Math.floor(Math.random() * (i + 1));


        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];


    }


    return shuffled;


}


function initHomeLoadMore() {


    const button = document.querySelector("#loadMoreButton");


    const grid = document.querySelector(".png-grid");


    if (!button || !grid) return;


    button.style.display = "flex";


    if (button.dataset.homeLoadMoreInitialized === "true") return;


    button.dataset.homeLoadMoreInitialized = "true";


    button.addEventListener("click", () => {


        const nextItems = getNextHomeItems(HOME_BATCH_SIZE);


        nextItems.forEach(item => {


            grid.appendChild(createPNGCard(item));


        });


        if (nextItems.length === 0) {


            button.style.display = "none";


            return;


        }


        const cards = grid.querySelectorAll(".png-card");


        const firstNewCard = cards[Math.max(0, cards.length - nextItems.length)];


        if (firstNewCard) {


            window.setTimeout(() => {


                firstNewCard.scrollIntoView({


                    behavior: "smooth",


                    block: "center"


                });


            }, 80);


        }


    });


}


function hideHomeLoadMore() {


    const button = document.querySelector("#loadMoreButton");


    if (button) button.style.display = "none";


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


    setupImageNavigation(id);


}


/* =========================================================


   IMAGE NAVIGATION


   ========================================================= */


function setupImageNavigation(currentId) {


    const previousButton =

        document.getElementById("previousImage");


    const nextButton =

        document.getElementById("nextImage");


    if (!previousButton || !nextButton) {

        return;

    }


    const currentIndex =

        pngItems.findIndex(

            item => Number(item.id) === Number(currentId)

        );


    if (currentIndex === -1) {

        return;

    }


    const previousItem = pngItems[currentIndex - 1];

    const nextItem = pngItems[currentIndex + 1];


    previousButton.onclick = null;

    nextButton.onclick = null;


    if (previousItem) {

        previousButton.disabled = false;

        previousButton.onclick = () => {

            window.location.href = `image.html?id=${previousItem.id}`;

        };

    } else {

        previousButton.disabled = true;

    }


    if (nextItem) {

        nextButton.disabled = false;

        nextButton.onclick = () => {

            window.location.href = `image.html?id=${nextItem.id}`;

        };

    } else {

        nextButton.disabled = true;

    }

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

    const grid = document.querySelector(".related-grid");


    if (!grid) {

        return;

    }


    /*

     * RELATED PNGS

     * ------------

     * Pick random images on every image-page load.

     * Prefer the same category, then fill from matching tags,

     * then use the remaining PNGs if necessary.

     *

     * The previous selection is remembered only for this image so

     * a refresh does not keep showing the exact same four cards.

     */


    const currentId = Number(item.id);


    const shuffle = (array) => {

        const result = [...array];


        for (let i = result.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [result[i], result[j]] = [result[j], result[i]];

        }


        return result;

    };


    const sameCategory = pngItems.filter(png =>

        Number(png.id) !== currentId &&

        String(png.category || "").toLowerCase() ===

        String(item.category || "").toLowerCase()

    );


    const currentTags = Array.isArray(item.tags)

        ? item.tags.map(tag => String(tag).toLowerCase())

        : [];


    const tagMatches = pngItems.filter(png => {

        if (Number(png.id) === currentId) {

            return false;

        }


        if (sameCategory.some(other =>

            Number(other.id) === Number(png.id)

        )) {

            return false;

        }


        const tags = Array.isArray(png.tags)

            ? png.tags.map(tag => String(tag).toLowerCase())

            : [];


        return currentTags.some(tag => tags.includes(tag));

    });


    const others = pngItems.filter(png => {

        if (Number(png.id) === currentId) {

            return false;

        }


        return !sameCategory.some(other =>

            Number(other.id) === Number(png.id)

        ) && !tagMatches.some(other =>

            Number(other.id) === Number(png.id)

        );

    });


    /*

     * Shuffle every source before combining them.

     * This means the first four are not permanently tied

     * to the order in png-data.js.

     */

    let pool = [

        ...shuffle(sameCategory),

        ...shuffle(tagMatches),

        ...shuffle(others)

    ];


    if (pool.length === 0) {

        grid.innerHTML = "<p>No related PNGs available.</p>";

        return;

    }


    /*

     * Avoid showing exactly the same four IDs as the previous

     * page load for the same image when enough alternatives exist.

     */

    const storageKey = "pngbazar_related_" + currentId;


    let previousIds = [];


    try {

        previousIds =

            JSON.parse(localStorage.getItem(storageKey) || "[]");

    } catch (error) {

        previousIds = [];

    }


    let related = pool.slice(0, 4);


    if (pool.length > 4 && previousIds.length === related.length) {

        const sameSelection = related.every(png =>

            previousIds.includes(Number(png.id))

        );


        if (sameSelection) {

            for (let attempt = 0; attempt < 5; attempt++) {

                pool = [

                    ...shuffle(sameCategory),

                    ...shuffle(tagMatches),

                    ...shuffle(others)

                ];


                related = pool.slice(0, 4);


                const changed = related.some(png =>

                    !previousIds.includes(Number(png.id))

                );


                if (changed) {

                    break;

                }

            }

        }

    }


    try {

        localStorage.setItem(

            storageKey,

            JSON.stringify(

                related.map(png => Number(png.id))

            )

        );

    } catch (error) {

        /* localStorage may be unavailable; random selection still works. */

    }


    grid.innerHTML = "";


    related.forEach(png => {

        grid.appendChild(createPNGCard(png));

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


            ".mobile-nav"


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


    nav.querySelectorAll("a").forEach(link => {


        link.addEventListener(


            "click",


            () => {


                nav.classList.remove(


                    "mobile-open"


                );


                button.setAttribute(


                    "aria-expanded",


                    "false"


                );


            }


        );


    });


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


    if (value === undefined || value === null) {


        return "";  }


    return String(value)


        .replace(/&/g, "&")


        .replace(/</g, "<")


        .replace(/>/g, ">")


        .replace(/"/g, "&quot;")


        .replace(/'/g, "&#039;");


 }