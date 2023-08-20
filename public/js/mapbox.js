const locations = JSON.parse(document.getElementById("map").dataset.locations);

mapboxgl.accessToken =
  "pk.eyJ1IjoicHJlbXByZWV0YnJhciIsImEiOiJjbGxqdnAyam0xa213M2xxaG5iMGw3MzhsIn0.RxiGuSa7uSdU-wIrUdZhAw";
var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/prempreetbrar/clljw06vh00jm01po4ye7g2pq",
  scrollZoom: false,
});

const bounds = new mapboxgl.LngLatBounds();
locations.forEach((location) => {
  // create marker
  const element = document.createElement("div");
  element.className = "marker";

  // add marker
  new mapboxgl.Marker({
    element,
    anchor: "bottom",
  })
    .setLngLat(location.coordinates)
    .addTo(map);

  // add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(location.coordinates)
    .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
    .addTo(map);

  bounds.extend(location.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 100,
    left: 100,
    right: 100,
  },
});
