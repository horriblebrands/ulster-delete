var activeListItem = null;
var mapObject;
var markersCollArray = [];
var markerObjects = [];
var activeMarker = null;
var iconDefault;
var iconSelected;

function initMappingCollection(_ID, _lat, _lng, _markersCollection, _zoom) {
  markersCollArray = _markersCollection;

  var loca = { lat: _lat, lng: _lng };

  if (window.innerWidth < 768) {
    _zoom = 12;
  }

  // Set-up the map
  mapObject = new google.maps.Map(document.getElementById(_ID), {
    zoom: _zoom,
    center: loca,
    // styles: arrStyle,
    disableDefaultUI: true,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
  });

  iconDefault = {
    url: '/img/layout/map-pin.png',
    labelOrigin: new google.maps.Point(16, 19),
  };

  iconSelected = {
    url: '/img/layout/active-map-pin.png',
    labelOrigin: new google.maps.Point(16, 19),
    labelColor: '#ffffff',
  };

  // Clear markers + list items from any previous search so repeat submissions don't stack
  markerObjects.forEach(function (m) { m.setMap(null); });
  markerObjects = [];
  activeMarker = null;
  activeListItem = null;
  var listEl = document.getElementById('mapMarkerList');
  if (listEl) listEl.innerHTML = '';

  for (var i = 0; i < markersCollArray.length; i++) {
    addMarker(markersCollArray[i]);
  }

  // Fit map to user origin + nearest few markers so a distant outlier doesn't zoom the view out to nothing.
  // Controller returns retailers sorted nearest-first, so the first N entries are the closest.
  var bounds = new google.maps.LatLngBounds();
  bounds.extend(loca);
  var fitCount = Math.min(markerObjects.length, 5);
  for (var j = 0; j < fitCount; j++) {
    bounds.extend(markerObjects[j].getPosition());
  }
  if (fitCount > 0) {
    mapObject.fitBounds(bounds, 50);
    // Clamp zoom-in for tightly-clustered results so we don't end up at street level.
    google.maps.event.addListenerOnce(mapObject, 'bounds_changed', function () {
      if (mapObject.getZoom() > 14) mapObject.setZoom(14);
    });
  }
}

function addMarker(marker) {
  const markerID = marker[0];
  const markerTitle = marker[1];
  const markerAddress = marker[4];
  const markerDistance = marker[5];
  const markerWebsite = marker[6];
  const markerPos = new google.maps.LatLng(marker[2], marker[3]);

  const markerPin = new google.maps.Marker({
    title: markerTitle,
    position: markerPos,
    icon: iconDefault,
    map: mapObject,
    label: makeLabel(markerID.toString(), false),
  });
  markerObjects.push(markerPin);

  markerPin.addListener('click', function () {
    const listItem = document.getElementById(`markerListItem${markerID}`);
    activateMarker(markerPin, listItem);
  });

  addToMarkerList(markerPin, markerID, markerTitle, markerAddress, markerDistance, markerWebsite);
}

function addToMarkerList(markerPin, markerID, markerTitle, markerAddress, markerDistance, markerWebsite) {
  const markerList = document.getElementById('mapMarkerList');

  const listItem = document.createElement('li');
  listItem.id = `markerListItem${markerID}`;
  listItem.className = 'markerListItem';

  const divItem = document.createElement('div');
  divItem.className = 'map-item';

  const pinNum = document.createElement('div');
  pinNum.className = 'pin-num';
  pinNum.textContent = markerID;

  const content = document.createElement('div');
  content.className = 'content';

  const title = document.createElement('p');
  title.className = 'title';
  title.appendChild(document.createTextNode(markerTitle + ' '));
  const distSpan = document.createElement('span');
  distSpan.textContent = markerDistance;
  title.appendChild(distSpan);

  const addressP = document.createElement('p');
  addressP.textContent = markerAddress;

  content.appendChild(title);
  content.appendChild(addressP);

  if (markerWebsite) {
    const websiteP = document.createElement('p');
    websiteP.className = 'website';

    const websiteLink = document.createElement('a');
    var href = markerWebsite.trim();
    if (!/^https?:\/\//i.test(href)) {
      href = 'https://' + href;
    }
    websiteLink.href = href;
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    // Display without the scheme / trailing slash for readability
    websiteLink.textContent = markerWebsite.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    // Don't let clicking the link also trigger the list-item's marker activation
    websiteLink.addEventListener('click', function (e) { e.stopPropagation(); });

    websiteP.appendChild(websiteLink);
    content.appendChild(websiteP);
  }

  divItem.appendChild(pinNum);
  divItem.appendChild(content);
  listItem.appendChild(divItem);

  listItem.addEventListener('click', function () {
    activateMarker(markerPin, listItem);
  });

  markerList.appendChild(listItem);
}

function activateMarker(pin, listItem) {
  if (activeMarker === pin) return;

  if (activeMarker) {
    activeMarker.setIcon(iconDefault);
    activeMarker.setLabel(makeLabel(activeMarker.getLabel().text, false));
  }
  if (activeListItem) {
    activeListItem.classList.remove('active');
  }

  pin.setIcon(iconSelected);
  pin.setLabel(makeLabel(pin.getLabel().text, true));
  activeMarker = pin;

  if (listItem) {
    listItem.classList.add('active');
    const container = document.getElementById('mapMarkerListContainer');
    if (container) {
      container.scrollTop = listItem.offsetTop - container.offsetTop;
    }
  }
  activeListItem = listItem;
}

function makeLabel(text, isSelected) {
  return {
    color: isSelected ? iconSelected.labelColor : '#375462',
    fontFamily: 'Open Sans, sans-serif',
    fontWeight: '600',
    fontSize: '16px',
    text: text,
  };
}

function gmInit() {
  console.log('Google Maps Callback')
}
