import {Page, Platform, NavController, Alert} from "ionic-angular";
import {Http} from "angular2/http";
import "rxjs/add/operator/map";

// Import the Ionic Native Geolocation Plugin
import {Geolocation} from "ionic-native";
// Import the Ionic Native Device Orientation Plugin
import {DeviceOrientation} from "ionic-native";

// Suppress typescript errors
declare var L: any;
declare var require: any;

// Import the leafletKnn library, see : https://github.com/mapbox/leaflet-knn
let leafletKnn = require("leaflet-knn");

// Add the RotatedMarker functions to the leaflet marker class, see : https://github.com/bbecquet/Leaflet.RotatedMarker
import "leaflet-rotatedmarker";

// Add the leaflet-routing-machine module, see : http://www.liedman.net/leaflet-routing-machine/
let leafletRouting = require("leaflet-routing-machine");

/*
  Generated class for the MapPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.

  @author : James Byrne
  @description
  This class manages the map loading and interactions.

  @functions :
    - loadMap() : Load the map from the leaflet CDN and assign it its default properties
    - followUser() : Follow the users movements and orientation
    - getDublinFood() : Load all of the GeoServer data into the map view
    - findNearest() : Find the five nearest amenities and give the user directions to the choosen one
    - findMe() : Center the map on the userMarker on button press
    - loadNearby() : Load only the markes which should be on the screen

  TODO : @functions
    - filterBy() : Allow a user to filter the type of amenity they are looking for by category
*/

@Page({
  templateUrl: "build/pages/map/map.html",
})
export class MapPage {
  private http: Http;
  private nav: NavController;
  private platform: Platform;

  // Layers for managing the number of markers to be loaded
  private tileLayer: any;
  private jsonLayer: any;

  private map: any;
  private geoJson: any;

  // Tell the app to use more accurate means of measurement if possible such as GPS
  private options = { enableHighAccuracy: true };

  private userMarker: any;
  private userOrientation: any;

  // Value for opening/closing the findNearest alert
  private radioOpen: boolean;

  constructor(http: Http, nav: NavController, platform: Platform) {
    this.http = http;
    this.nav = nav;
    this.platform = platform;

    // Load the users map
    this.loadMap();
  }

  // Load the map
  loadMap() {
    // Ensures that the application is ready before attempting to reach the Cordova plugins
    this.platform.ready().then(() => {
      // Get the users current location
      Geolocation.getCurrentPosition().then(pos => {
        // Create a new instance of the Leaflet map
        this.map = L.map("map", { zoomControl: false }).setView([pos.coords.latitude, pos.coords.longitude], 17);

        // Control for zooming in and out
        let control = L.control.zoom({
          position: "bottomright"
        });

        // Add the control to the map
        this.map.addControl(control);

        // Add a tile layer to the map
        this.tileLayer = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
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
          rotationOrigin: "center center"
        }).addTo(this.map);

        // Add a popup to the userMarker
        this.userMarker.bindPopup("<h4>Your Location</h4>");

        // Follow the Users position
        this.followUser();

        // Get the list of food places in dublin
        this.getDublinFood();

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
      (data) => {
        this.userMarker.setRotationAngle(data.magneticHeading);
      },
      (error) => {
        // Show the error as an alert
        let alert = Alert.create({
          title: "Error!",
          subTitle: error.error,
          buttons: ["OK"]
        });

        this.nav.present(alert);
      });

    // TODO : This is broken in the current builds, the device calibration is sometimes called but the icon does not rotate to follow the user
    // No errors thrown by the app on the device
    // Watch the device compass heading change
    this.userOrientation = DeviceOrientation.watchHeading().subscribe(
      (data) => {
        this.userMarker.setRotationAngle(data.magneticHeading);
      },
      (error) => {
        // Show the error as an alert
        let alert = Alert.create({
          title: "Error!",
          subTitle: error.error,
          buttons: ["OK"]
        });

        this.nav.present(alert);
      });
  }

  // Center the map on the users icon
  findMe() {
    this.map.setView(this.userMarker.getLatLng(), 17);
  }

  // Get the data from the server
  getDublinFood() {
    // Make a http request to the server and get the data
    this.http.get("http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326").map(res => res.json()).subscribe(data => {
      // Make data available for other functions
      this.geoJson = data;

      // Load only the markers that are visible on the map
      this.loadNearby();
    });
  }

  // Load the nearby Markers
  loadNearby() {

    // Function that is executed each time a marker is added
    // TODO : Give the markers custom icons, see : http://leafletjs.com/examples/custom-icons.html
    // TODO : Add the different categories to different layers, see : http://bl.ocks.org/zross/f0306ca14e8202a0fe73
    let onEachFeature = (feature, layer) => {
      // does this feature have a property named name
      if (feature.properties && feature.properties.name) {
        // If so add its name
        let popupText = feature.properties.name;

        if (feature.properties.cuisine) {
          // Does it serve food, if so add that on a new line
          // Regex to get rid of underscroes in words such as fish_and_chips
          popupText = popupText + " - Serving : " + feature.properties.cuisine.replace(/_/g, " ");
        }
        // Add the popup to the icon with text
        layer.bindPopup(popupText);
      } else {
        // Inform the user there is no info about the location
        let popupText = "No info available";
        layer.bindPopup(popupText);
      }
    };

    // TODO : Filter out markers that should not be displayed
    let filter = (feature, layer) => {
      // Look for the markers within the current maps bounds
      // The coords have to be specified as below in order for the function to read the features coords correctly
      if (this.map.getBounds().contains([feature.geometry.coordinates[1], feature.geometry.coordinates[0]])) {
        return feature;
      }
    };

    // When the map is first loaded get the markers within the map bounds
    this.jsonLayer = L.geoJson(this.geoJson.features, {
      onEachFeature: onEachFeature,
      filter: filter
    }).addTo(this.map);


    // When the user drags the map to a different area load the markers for that area
    this.map.on("dragend", () => {
      this.jsonLayer.clearLayers();
      this.jsonLayer = L.geoJson(this.geoJson.features, {
        onEachFeature: onEachFeature,
        filter: filter
      }).addTo(this.map);
    });

    // When the map is zoomed in or out clear the layers
    this.map.on("zoomend", () => {
      this.jsonLayer.clearLayers();
      this.jsonLayer = L.geoJson(this.geoJson.features, {
        onEachFeature: onEachFeature,
        filter: filter
      }).addTo(this.map);
    });
  }

  // Find the 5 nearest markers to the user
  findNearest() {
    // Create an index that can be used to search for the nearest marker
    let index = leafletKnn(L.geoJson(this.geoJson.features));

    // Get the 5 closest markers to the userMarker
    let nearest = index.nearest(this.userMarker.getLatLng(), 5, 2000);

    // List the five options in an alert
    let alert = Alert.create();

    // Add an input for each of the nearest amenities
    for (let i = 0; i < nearest.length; i++) {
      alert.addInput({
        type: "radio",
        label: nearest[i].layer.feature.properties.name,
        value: [nearest[i].lat, nearest[i].lon].toString()
      });
    }

    // If there is no amenities within 2km show a different alert
    if (alert.data.inputs.length === 0) {
      alert.setTitle("No amenities nearby");
    } else {
      // Set the alerts title
      alert.setTitle("5 closest");

      // Add the ok button which will return the users selected value
      alert.addButton({
        text: "OK",
        handler: data => {
          this.radioOpen = false;

          // Check that the user has selected an item
          if (data) {
            // Split the data into two floats (Lat, Lng)
            data = data.split(",");

            // Plot a route from the user to their target
            L.Routing.control({
              waypoints: [
                this.userMarker.getLatLng(),
                [parseFloat(data[0]), parseFloat(data[1])]
              ]
            }).addTo(this.map);
          }
        }
      });
    }

    // Add a cancel button
    alert.addButton("Cancel");

    // Open the alert to the user
    this.nav.present(alert).then(() => {
      this.radioOpen = true;
    });
  }
}
