const API_BASE_URL = "https://ip-address-geo-ipify-proxy.onrender.com/";
const onLoadingState = {
  ip: "8.8.8.8",
  location: {
    country: "US",
    region: "California",
    city: "Mountain View",
    lat: 37.38605,
    lng: -122.08385,
    postalCode: "94035",
    timezone: "-08:00",
    geonameId: 5375480,
  },
  domains: [
    "0c2071772e3140b1bd81a6fc21f582b5.vip1.huaweicloudwaf.com",
    "finnheat.se",
    "golaro205.com",
    "infralabs.se",
    "load-balancer.anytype.io",
  ],
  as: {
    asn: 15169,
    name: "GOOGLE",
    route: "8.8.8.0/24",
    domain: "https://about.google/intl/en/",
    type: "Content",
  },
  isp: "Google LLC",
};

const MAP_ZOOM = 13;
const loadLat = onLoadingState.location.lat;
const loadLng = onLoadingState.location.lng;
const loadCity = onLoadingState.location.city;

// Setup Map
const map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let marker = L.marker([loadLat, loadLng]).addTo(map);

setMapLocation(loadLat, loadLng, loadCity);

// Setup text nodes for location results
const ipAddressNode = document.getElementById("ip-address");
const locationNode = document.getElementById("location");
const utcOffsetNode = document.getElementById("utc-offset");
const ispNode = document.getElementById("isp");

const searchForm = document.getElementById("search-form");

// Add listeners
window.addEventListener("load", (e) => handleLocationSearch(e));
searchForm.addEventListener("submit", throttle(handleLocationSearch));

async function handleLocationSearch(e) {
  e.preventDefault();
  const { value } = document.querySelector("#search-input");
  const encodedValue = encodeURIComponent(value.trim().toLowerCase());

  const queryParams = new URLSearchParams();
  let route = "noquery";

  // validate search for domain or ip addresses
  if (validator.isFQDN(encodedValue)) {
    queryParams.append("domain", encodedValue);
    route = "domain";
  } else if (validator.isIP(encodedValue)) {
    queryParams.append("ipAddress", encodedValue);
    route = "ip";
  }
  if (value.length && ![...queryParams].length) {
    console.log("not a valid search query");
    return;
  }

  try {
    const query = queryParams.toString();
    const url = `${API_BASE_URL}${route}${query.length ? `?${query}` : ""}`;
    const response = await fetch(url, {
      mode: "cors",
    });

    if (!response.ok) {
      throw new Error("There was an error");
    }
    const result = await response.json();

    const { ip, isp } = result;
    const { lat, lng, city, timezone } = result.location;

    if (!lat || !lng) {
      throw new Error("no location found");
    }

    setMapLocation(lat, lng, city);

    setNodeText(locationNode, city);
    setNodeText(ipAddressNode, ip);
    setNodeText(ispNode, isp);
    setNodeText(utcOffsetNode, timezone);

    return result;
  } catch (error) {
    console.error(error);
  }
}

function setNodeText(node, text) {
  node.innerText = text;
}

function setMapLocation(lat, lng, city) {
  map.setView([lat, lng], MAP_ZOOM);
  marker = L.marker([lat, lng])
    .addTo(map)
    .bindPopup(`<b>${city}</b><br>Lat. ${lat} Lon. ${lng}.`);
  marker.on("mouseover", function (ev) {
    marker.openPopup();
  });
  marker.on("mouseout", function (ev) {
    marker.closePopup();
  });
}

function throttle(func, limit = 800) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
