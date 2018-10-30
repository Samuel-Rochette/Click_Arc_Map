var projection = d3.geoEqualEarth(),
  path = d3.geoPath(projection);

var map = new Datamap({
  element: document.getElementById("container"),
  fills: {
    MAJOR: "#306596",
    MEDIUM: "#0fa0fa",
    MINOR: "#bada55",
    defaultFill: "#dddddd"
  },
  arcConfig: {
    strokeColor: "#DD1C77",
    strokeWidth: 1,
    arcSharpness: 1,
    animationSpeed: 2000, // Milliseconds
    popupOnHover: false, // True to show the popup while hovering
    popupTemplate: function(geography, data) {
      // This function should just return a string
      // Case with latitude and longitude
      if (
        data.origin &&
        data.destination &&
        data.origin.latitude &&
        data.origin.longitude &&
        data.destination.latitude &&
        data.destination.longitude
      ) {
        return (
          '<div class="hoverinfo"><strong>Arc</strong><br>Origin: ' +
          JSON.stringify(data.origin) +
          "<br>Destination: " +
          JSON.stringify(data.destination) +
          "</div>"
        );
      } else if (data.origin && data.destination) {
        // Case with only country name
        return (
          '<div class="hoverinfo"><strong>Arc</strong><br>' +
          data.origin +
          " -> " +
          data.destination +
          "</div>"
        );
      } else {
        return "Missing information";
      }
    }
  }
});

map.addPlugin("markers", Datamap.customMarkers);

map.addPlugin("pins", function(layer, data, options) {
  var self = this,
    fillData = this.options.fills,
    svg = this.svg;

  if (!data || (data && !data.slice)) {
    throw "Datamaps Error - bubbles must be an array";
  }

  var bubbles = layer
    .selectAll("image.datamaps-pins")
    .data(data, JSON.stringify);

  bubbles
    .enter()
    .append("image")
    .attr("class", "datamaps-pin")
    .attr("xlink:href", "assets/map-marker.png")
    .attr("height", 20)
    .attr("width", 20)
    .attr("x", function(datum) {
      var latLng;
      if (datumHasCoords(datum)) {
        latLng = self.latLngToXY(datum.latitude, datum.longitude - 3.9);
      } else if (datum.centered) {
        latLng = self.path.centroid(
          svg.select("path." + datum.centered).data()[0]
        );
      }
      if (latLng) return latLng[0];
    })
    .attr("y", function(datum) {
      var latLng;
      if (datumHasCoords(datum)) {
        latLng = self.latLngToXY(datum.latitude + 6.5, datum.longitude);
      } else if (datum.centered) {
        latLng = self.path.centroid(
          svg.select("path." + datum.centered).data()[0]
        );
      }
      if (latLng) return latLng[1];
    });

  bubbles
    .exit()
    .transition()
    .delay(options.exitDelay)
    .attr("height", 0)
    .remove();

  function datumHasCoords(datum) {
    return (
      typeof datum !== "undefined" &&
      typeof datum.latitude !== "undefined" &&
      typeof datum.longitude !== "undefined"
    );
  }
});

var arcs = [];
var pins = [];

d3.select("svg").on("mousedown.log", function() {
  let newPin = {
    latitude: invert(d3.mouse(this))[1],
    longitude: invert(d3.mouse(this))[0]
  };
  pins.push(newPin);

  if (pins.length % 2 == 0) {
    let index = pins.length - 1;
    let newArc = {
      origin: pins[index - 1],
      destination: pins[index]
    };
    arcs.push(newArc);
    map.arc(arcs);
  }

  function invert(xy) {
    let arr = [];
    arr.push((xy[0] - 500) / 1000 * 360);
    arr.push((xy[1] - 330) / 500 * 180 * -1);
    return arr;
  }
  map.pins(pins);
});

map.pins(pins);
