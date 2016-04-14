import {Page, Platform} from "ionic-angular";
import {Http} from "angular2/http";
import "rxjs/add/operator/map";

/*
  Generated class for the MapPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/

@Page({
  templateUrl: "build/pages/map/map.html",
})
export class MapPage {
  private platform: Platform;
  private http: Http;

  private map: any;
  // Tell the app to use more accurate means of measurement if possible such as GPS
  private options = {enableHighAccuracy: true};
  private userMarker: any;

  constructor(platform: Platform, http: Http) {
    this.platform = platform;
    this.http = http;

    // Load the users map
    this.loadMap();
  }

  // Load the map
  loadMap() {
    this.platform.ready().then(() => {

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Create a new instance of the Leaflet map
          this.map = L.map("map", {zoomControl: false}).setView([position.coords.latitude, position.coords.longitude], 13);

          // Control for zooming in and out
          let control = L.control.zoom({
            position: "bottomright"
          });

          // Add the control to the map
          this.map.addControl(control);

          // Add a tile layer to the map
          L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
            maxZoom: 18
          }).addTo(this.map);

          // Add a user marker which shows their current location
          // The zIndexOffset ensure that the users marker is always ontop of any other markers nearby
          this.userMarker = L.marker([position.coords.latitude, position.coords.longitude], {
            zIndexOffset: 1000
          }).addTo(this.map);

          // Add a popup to the userMarker
          this.userMarker.bindPopup("<h4>Your Location</h4>");

          // Follow the Users position
          this.followUser();

          // Get the list of food places in dublin
          this.getDublinFood();
        },
        (error) => {
          console.log(error);
        }, this.options);
    });
  }

  // Follow user
  followUser() {
    // Check for the users location twice a second
    window.setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Change the variable names for use with Leaflet
          position.lat = position.coords.latitude;
          position.lng = position.coords.longitude;
          // Set the markers new location
          this.userMarker.setLatLng(position);
        },
        (error) => {
          console.log("There was an error :  ......");
          console.log(error);
        }, this.options);
    }, 500);
  }

  getDublinFood() {
    // // Make a http request to the server and get the data
    this.http.get("http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326").map(res => res.json()).subscribe(data => {
      // Add the markers to the map
      L.geoJson(data.features).addTo(this.map);

    });
  }

}
