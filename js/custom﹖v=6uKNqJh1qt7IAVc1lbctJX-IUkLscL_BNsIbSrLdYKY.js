function swapDivsById(divId1, divId2) {

    var div1 = document.getElementById(divId1);
    if (!div1) { console.error(`div1 ${divId1} not found.`); }

    var div2 = document.getElementById(divId2);
    if (!div2) { console.error(`div2 ${divId2} not found.`); }

    var parent1 = div1.parentNode;
    var sibling1 = div1.nextElementSibling === div2 ? div1 : div1.nextElementSibling;
    div2.parentNode.insertBefore(div1, div2);
    parent1.insertBefore(div2, sibling1);
}

document.addEventListener('DOMContentLoaded', function () {

    const dropdowns = document.querySelectorAll('.region-dropdown');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const regionPrefix = pathParts[0];  // Get the first part of the pathname
    const validRegions = ['uk', 'us', 'fr', 'de'];
    const locationfilter = document.querySelectorAll('#locationFilter');

    function setDropdownValue(dropdown) {
        if (validRegions.includes(regionPrefix)) {
            dropdown.value = regionPrefix;
        } else {
            dropdown.value = 'uk';
        }
    }

    function handleRegionChange(event) {
        const selectedRegion = event.target.value;  // Get the selected value (prefix)
        const newUrl = `${window.location.origin}/${selectedRegion}`;
        window.location.href = newUrl;  // Redirect to the new URL
    }

    dropdowns.forEach(function (dropdown) {
        setDropdownValue(dropdown);
        dropdown.addEventListener('change', handleRegionChange);
    });

    locationfilter.forEach(function (dropdown) {    
      dropdown.addEventListener('change', handleLocationFilterChange);
    });
    function handleLocationFilterChange(event) {
      const url = event.target.value;     
      if (url) {
        window.location.href = url;
      }
    }

});