document.addEventListener("DOMContentLoaded", function () {

    // The filter form always posts back to the current page
    const baseUrl = window.location.pathname;

    const selects = document.querySelectorAll(".filter-buttons select");

    selects.forEach(function (select) {
        // Restore selection from current query string
        const params = new URLSearchParams(window.location.search);
        const currentVal = params.get(select.name);
        if (currentVal) {
            select.value = currentVal;
        }

        select.addEventListener("change", function () {
            const params = new URLSearchParams(window.location.search);
            if (this.value) {
                params.set(this.name, this.value);
            } else {
                params.delete(this.name);
            }
            window.location.href = baseUrl + "?" + params.toString();
        });
    });
});
