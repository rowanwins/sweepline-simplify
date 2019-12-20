<template>
  <div id="app"></div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './coords';
import isSimple from '../../src/main'

// Hack to get the markers into Vue correctly
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: marker2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

const trouble = require('../../test/fixtures/example.geojson')

export default {
  name: 'App',
  mounted: function () {
    
    const layer = L.geoJSON(trouble)
    let map = window.map = L.map('app', {
      crs: L.CRS.Simple
    }).fitBounds(layer.getBounds())  

    layer.addTo(map)

    map.addControl(new L.Coordinates());


    function getRandomColor() {
      var letters = '0123456789ABCDEF';
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    }


   const r = isSimple(trouble)

   const simple = L.geoJSON(r.simpleContours, {
    style: function (f) {
      return {
        color: getRandomColor(),
        fillOpacity: 1,
        weight: f.properties.netWinding === 1 ? 3 : 1
      };
    }
   })
  .bindPopup(function (layer) {
    return JSON.stringify(layer.feature.properties);
  }).addTo(map)


var overlays = {
    "Original": layer,
    "Simplified": simple
};
L.control.layers({}, overlays, {
  collapsed: false
}).addTo(map);


  }
}

</script>

<style>
 html, body, #app {
  height: 100%;
  width: 100%;
  margin: 0px;
 }
</style>
