import {Page, Platform} from "ionic-angular";
import {Http} from "angular2/http";
import "rxjs/add/operator/map";

// Import the Ionic Native Geolocation Plugin
import {Geolocation} from "ionic-native";
// Import the Ionic Native Deveice Orientation Plugin
import {DeviceOrientation} from "ionic-native";

// Suppress typescript errors
declare var L: any;

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
  private options = { enableHighAccuracy: true };

  private userMarker: any;
  private userOrientation: any;

  constructor(platform: Platform, http: Http) {
    this.platform = platform;
    this.http = http;

    // Load the users map
    this.loadMap();
  }

  // Load the map
  loadMap() {
    this.platform.ready().then(() => {

      Geolocation.getCurrentPosition().then(pos => {
        // Create a new instance of the Leaflet map
        this.map = L.map("map", { zoomControl: false }).setView([pos.coords.latitude, pos.coords.longitude], 13);

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

        // Create a custom icon for the user
        let userIcon = L.icon({
          iconUrl: "./images/navigation-icon.png",
          iconSize: [40, 40], // size of the icon
          iconAnchor: [20, 20], // point of the icon which will correspond to marker"s location
          popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
        });

        // Add a user marker which shows their current location
        // The zIndexOffset ensure that the users marker is always ontop of any other markers nearby
        this.userMarker = L.marker([pos.coords.latitude, pos.coords.longitude], {
          zIndexOffset: 1000,
          icon: userIcon,
        }).addTo(this.map);

        // Add a popup to the userMarker
        this.userMarker.bindPopup("<h4>Your Location</h4>");

        // Follow the Users position
        this.followUser();

        // Get the list of food places in dublin
        // this.getDublinFood();
      }).catch(err => {
        console.log("There was an error getting the map ");
        console.log(err);
      });
    });
  }

  // Follow user
  followUser() {
    // Follow the users location
    let watch = Geolocation.watchPosition();
    // When the users location changes update the location of the marker
    watch.subscribe(pos => {
      this.userMarker.setLatLng([pos.coords.latitude, pos.coords.longitude]);
    });

    // Get the users current heading
    DeviceOrientation.getCurrentHeading().then(
      data => {
        // TODO : rotate the icon to match users orientation
        // this.userMarker.setIconAngle(data.magneticHeading);
      },
      error => console.log(error)
    );

    // Watch the device compass heading change
    this.userOrientation = DeviceOrientation.watchHeading().subscribe(
      data => {
        // TODO : rotate the icon to match users orientation
      }
    );
  }

  getDublinFood() {
    // // Make a http request to the server and get the data
    this.http.get("http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326").map(res => res.json()).subscribe(data => {
      // Add the markers to the map
      L.geoJson(data.features).addTo(this.map);

    });
  }

}
