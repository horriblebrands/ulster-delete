document.addEventListener("DOMContentLoaded", function () {

    // Grab dynamic values
    const scriptTag = document.getElementById("load-more-script");

    // Fallback to defaults (e.g., || 3) if the attributes are missing
    const itemsPerClick = parseInt(scriptTag.dataset.itemsPerClick) || 3;
    const initialVisible = parseInt(scriptTag.dataset.initialVisible) || 9;
    let visibleCount = initialVisible;
    let lastIndex = -1;

    const items = document.querySelectorAll("#cards-grid .cell");
    const loadMoreBtn = document.getElementById("load-more-btn");

    if (!loadMoreBtn || items.length === 0) return;

    // State is kept per page + filter combination, so each listing remembers how
    // many cards were on screen before the visitor opened one of them.
    const storageKey = "loadMore:" + window.location.pathname + window.location.search;

    function readState() {
        try {
            return JSON.parse(window.sessionStorage.getItem(storageKey)) || null;
        } catch (e) {
            return null;
        }
    }

    function saveState() {
        try {
            window.sessionStorage.setItem(storageKey, JSON.stringify({ visibleCount: visibleCount, lastIndex: lastIndex }));
        } catch (e) {
            // Storage unavailable (private browsing / quota) - carry on without it.
        }
    }

    function clearState() {
        try {
            window.sessionStorage.removeItem(storageKey);
        } catch (e) {
            // Nothing to do.
        }
    }

    function isBackNavigation() {
        const entry = window.performance && window.performance.getEntriesByType
            ? window.performance.getEntriesByType("navigation")[0]
            : null;

        if (entry) {
            return entry.type === "back_forward";
        }

        // Legacy fallback: 2 === TYPE_BACK_FORWARD
        return !!(window.performance && window.performance.navigation && window.performance.navigation.type === 2);
    }

    // Only pick the state back up when the visitor actually came back to this page,
    // otherwise a fresh visit should start at the first "page" of cards again.
    const savedState = isBackNavigation() ? readState() : null;

    if (savedState) {
        visibleCount = Math.min(Math.max(savedState.visibleCount || 0, initialVisible), items.length);
        lastIndex = savedState.lastIndex;
    } else {
        clearState();
    }

    // Hide items after the visible count
    items.forEach((item, index) => {
        if (index >= visibleCount) {
            item.classList.add("hidden-items");
        }
    });

    if (visibleCount >= items.length) {
        loadMoreBtn.style.display = "none";
    }

    loadMoreBtn.addEventListener("click", function () {

        let nextVisible = visibleCount + itemsPerClick;

        items.forEach((item, index) => {
            if (index < nextVisible && item.classList.contains("hidden-items")) {
                item.classList.remove("hidden-items");
                item.classList.add("fade-in-more");

                setTimeout(() => {
                    item.classList.remove("fade-in-more");
                }, 400);
            }
        });

        visibleCount = nextVisible;
        lastIndex = -1;

        if (visibleCount >= items.length) {
            loadMoreBtn.style.display = "none";
        }

        saveState();
    });

    // Remember which card was opened so we can scroll back to it
    items.forEach((item, index) => {
        item.addEventListener("click", function (e) {
            if (!e.target.closest("a")) return;

            lastIndex = index;
            saveState();
        });
    });

    // The browser restores the old scroll position before the re-shown cards have
    // loaded their images, so nudge the card that was opened back into view.
    if (savedState && lastIndex >= 0 && lastIndex < items.length) {
        const target = items[lastIndex];

        window.addEventListener("load", function () {
            window.requestAnimationFrame(function () {
                const rect = target.getBoundingClientRect();
                const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;

                if (!inView) {
                    target.scrollIntoView({ block: "center" });
                }
            });
        });
    }
});
