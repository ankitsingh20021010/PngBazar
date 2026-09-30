/* =========================================================
   PNG BAZAR - SEARCH.JS
   ========================================================= */


/* =========================================================
   GLOBAL DATA
   ========================================================= */

const searchData =
    typeof pngData !== "undefined"
        ? pngData
        : [];


/* =========================================================
   DOM READY
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initSearch();

        initPopularTags();

        initCategoryLinks();

    }
);


/* =========================================================
   INITIALIZE SEARCH
   ========================================================= */

function initSearch() {

    const searchInputs =
        document.querySelectorAll(
            'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
        );


    if (!searchInputs.length) {
        return;
    }


    searchInputs.forEach(input => {

        /* -----------------------------------------
           LIVE SEARCH
           ----------------------------------------- */

        input.addEventListener(
            "input",
            () => {

                const query =
                    input.value.trim();

                if (query.length >= 2) {

                    showSearchResults(
                        query
                    );

                } else if (
                    query.length === 0
                ) {

                    restoreOriginalResults();

                }

            }
        );


        /* -----------------------------------------
           ENTER SEARCH
           ----------------------------------------- */

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    const query =
                        input.value.trim();

                    if (!query) {
                        return;
                    }

                    performSearch(
                        query
                    );

                }

            }
        );

    });

}


/* =========================================================
   PERFORM SEARCH
   ========================================================= */

function performSearch(query) {

    const cleanQuery =
        query
            .toLowerCase()
            .trim();


    if (!cleanQuery) {
        return;
    }


    /* -----------------------------------------
       Search current page
       ----------------------------------------- */

    if (
        document.querySelector(
            ".png-grid"
        )
    ) {

        showSearchResults(
            cleanQuery
        );

        return;

    }


    /* -----------------------------------------
       Otherwise open search URL
       ----------------------------------------- */

    window.location.href =
        `index.html?search=${encodeURIComponent(cleanQuery)}`;

}


/* =========================================================
   SHOW SEARCH RESULTS
   ========================================================= */

function showSearchResults(query) {

    const grid =
        document.querySelector(
            ".png-grid"
        );


    if (!grid) {
        return;
    }


    const cleanQuery =
        query.toLowerCase().trim();


    const results =
        searchData.filter(item => {

            const title =
                String(
                    item.title || ""
                ).toLowerCase();

            const category =
                String(
                    item.category || ""
                ).toLowerCase();

            const tags =
                Array.isArray(item.tags)
                    ? item.tags.join(" ").toLowerCase()
                    : "";


            return (
                title.includes(cleanQuery) ||
                category.includes(cleanQuery) ||
                tags.includes(cleanQuery)
            );

        });


    grid.innerHTML = "";


    /* -----------------------------------------
       NO RESULTS
       ----------------------------------------- */

    if (results.length === 0) {

        showSearchEmptyState(
            grid,
            query
        );

        return;

    }


    /* -----------------------------------------
       RESULTS
       ----------------------------------------- */

    results.forEach(item => {

        if (
            typeof createPNGCard ===
            "function"
        ) {

            grid.appendChild(
                createPNGCard(item)
            );

        } else {

            grid.appendChild(
                createSearchCard(item)
            );

        }

    });


    updateSearchResultCount(
        results.length,
        query
    );

}


/* =========================================================
   SEARCH CARD FALLBACK
   ========================================================= */

function createSearchCard(item) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "png-card";


    card.innerHTML = `

        <a
            href="image.html?id=${item.id}"
            class="png-card-image">

            <img
                src="${item.image}"
                alt="${escapeSearchHTML(item.title)}"
                loading="lazy">

        </a>


        <div class="png-card-content">

            <a
                href="image.html?id=${item.id}"
                class="png-card-title">

                ${escapeSearchHTML(item.title)}

            </a>


            <div class="png-card-meta">

                <span>
                    ${escapeSearchHTML(item.category)}
                </span>

            </div>

        </div>

    `;


    return card;

}


/* =========================================================
   SEARCH EMPTY STATE
   ========================================================= */

function showSearchEmptyState(
    grid,
    query
) {

    grid.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">
                🔍
            </div>

            <h3>
                No PNGs Found
            </h3>

            <p>
                We couldn't find anything for
                "<strong>
                    ${escapeSearchHTML(query)}
                </strong>"
            </p>

            <button
                type="button"
                class="clear-search-button">

                Clear Search

            </button>

        </div>

    `;


    const clearButton =
        grid.querySelector(
            ".clear-search-button"
        );


    if (clearButton) {

        clearButton.addEventListener(
            "click",
            clearAllSearch
        );

    }

}


/* =========================================================
   CLEAR SEARCH
   ========================================================= */

function clearAllSearch() {

    const inputs =
        document.querySelectorAll(
            'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
        );


    inputs.forEach(input => {

        input.value = "";

    });


    restoreOriginalResults();

}


/* =========================================================
   RESTORE ORIGINAL RESULTS
   ========================================================= */

function restoreOriginalResults() {

    const grid =
        document.querySelector(
            ".png-grid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    searchData.forEach(item => {

        if (
            typeof createPNGCard ===
            "function"
        ) {

            grid.appendChild(
                createPNGCard(item)
            );

        }

    });


    removeSearchResultCount();

}


/* =========================================================
   SEARCH RESULT COUNT
   ========================================================= */

function updateSearchResultCount(
    count,
    query
) {

    let resultInfo =
        document.querySelector(
            ".search-result-info"
        );


    if (!resultInfo) {

        resultInfo =
            document.createElement(
                "div"
            );

        resultInfo.className =
            "search-result-info";


        const grid =
            document.querySelector(
                ".png-grid"
            );


        if (
            grid &&
            grid.parentElement
        ) {

            grid.parentElement.insertBefore(
                resultInfo,
                grid
            );

        }

    }


    if (resultInfo) {

        resultInfo.innerHTML = `

            <strong>
                ${count}
            </strong>

            PNG${count !== 1 ? "s" : ""} found
            for
            "<strong>
                ${escapeSearchHTML(query)}
            </strong>"

        `;

    }

}


/* =========================================================
   REMOVE RESULT COUNT
   ========================================================= */

function removeSearchResultCount() {

    const resultInfo =
        document.querySelector(
            ".search-result-info"
        );


    if (resultInfo) {

        resultInfo.remove();

    }

}


/* =========================================================
   POPULAR TAGS
   ========================================================= */

function initPopularTags() {

    const tags =
        document.querySelectorAll(
            ".tag"
        );


    if (!tags.length) {
        return;
    }


    tags.forEach(tag => {

        tag.style.cursor =
            "pointer";


        tag.addEventListener(
            "click",
            () => {

                const query =
                    tag.textContent.trim();


                const inputs =
                    document.querySelectorAll(
                        'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
                    );


                inputs.forEach(input => {

                    input.value =
                        query;

                });


                performSearch(
                    query
                );

            }
        );

    });

}


/* =========================================================
   CATEGORY LINKS
   ========================================================= */

function initCategoryLinks() {

    const categoryLinks =
        document.querySelectorAll(
            "[data-category]"
        );


    categoryLinks.forEach(link => {

        link.addEventListener(
            "click",
            event => {

                const category =
                    link.dataset.category;


                if (!category) {
                    return;
                }


                event.preventDefault();


                window.location.href =
                    `category.html?category=${encodeURIComponent(category)}`;

            }
        );

    });

}


/* =========================================================
   URL SEARCH
   ========================================================= */

function handleURLSearch() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const query =
        params.get("search");


    if (!query) {
        return;
    }


    const input =
        document.querySelector(
            'input[type="search"], input[placeholder*="Search"], input[placeholder*="search"]'
        );


    if (input) {

        input.value =
            query;

    }


    showSearchResults(
        query
    );

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeSearchHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   START URL SEARCH
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    handleURLSearch
);