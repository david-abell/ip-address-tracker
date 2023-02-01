const API_BASE_URL = "http://localhost:4000/";

// Setup Map
const map = L.map("map");

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let marker = L.marker([51.5, -0.09]).addTo(map);

// Setup text nodes for location results
const ipAddressNode = document.getElementById("ip-address");
const locationNode = document.getElementById("location");
const utcOffsetNode = document.getElementById("utc-offset");
const ispNode = document.getElementById("isp");

const searchButton = document.getElementById("search-button");

// Add listeners
window.addEventListener("load", (e) => handleLocationSearch(e));
searchButton.addEventListener("click", throttle(handleLocationSearch));

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

    setMapLocation(lat, lng);

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

function setMapLocation(lat, lng) {
  map.setView([lat, lng], 13);
  marker = L.marker([lat, lng]).addTo(map);
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
