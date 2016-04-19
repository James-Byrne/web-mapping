import {Page, Platform, NavController, Alert} from "ionic-angular";
import {Http} from "angular2/http";
import "rxjs/add/operator/map";

// Import the Ionic Native Geolocation Plugin
import {Geolocation} from "ionic-native";
// Import the Ionic Native Deveice Orientation Plugin
import {DeviceOrientation} from "ionic-native";

// Suppress typescript errors
declare var L: any;
declare var require: any;

// Import the leafletKnn library
let leafletKnn = require("leaflet-knn");

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
    - addRotateMarker() : Code from : https://github.com/bbecquet/Leaflet.RotatedMarker. Its put here because the node module isnt working

  TODO : @functions
    - followMe() : The user can set the screen to follow them, essentially making their location the center of the screen
    - showOnly() : Show only the selected type of amenity on the map
    - findNearest() : Give the user directions to the nearest X where X is a type of amenity
*/

@Page({
  templateUrl: "build/pages/map/map.html",
})
export class MapPage {
  private http: Http;
  private nav: NavController;
  private platform: Platform;

  private map: any;
  private geoJson: any;
  // Tell the app to use more accurate means of measurement if possible such as GPS
  private options = { enableHighAccuracy: true };

  private userMarker: any;
  private userOrientation: any;

  constructor(http: Http, nav: NavController, platform: Platform) {
    this.http = http;
    this.nav = nav;
    this.platform = platform;

    // Add the rotate marker function to L
    this.addRotateMarker();

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
        this.map = L.map("map", { zoomControl: false }).setView([pos.coords.latitude, pos.coords.longitude], 16);

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
        console.log(error);
        // Show the error as an alert
        let alert = Alert.create({
          title: "Error!",
          subTitle: error.error,
          buttons: ["OK"]
        });

        this.nav.present(alert);
      });

    // Watch the device compass heading change
    this.userOrientation = DeviceOrientation.watchHeading().subscribe(
      (data) => {
        this.userMarker.setRotationAngle(data.magneticHeading);
      },
      (error) => {
        console.log(error);
        // Show the error as an alert
        let alert = Alert.create({
          title: "Error!",
          subTitle: error.error,
          buttons: ["OK"]
        });

        this.nav.present(alert);
      });
  }

  getDublinFood() {
    // TODO : Load only the nearby markers, see : https://github.com/mapbox/leaflet-knn
    // TODO : Give the markers custom icons, see : http://leafletjs.com/examples/custom-icons.html and above
    // TODO : Add markers to a cluster group, see : https://github.com/Leaflet/Leaflet.markercluster && https://github.com/DefinitelyTyped/DefinitelyTyped/blob/cc3d223a946f661eff871787edeb0fcb8f0db156/leaflet-markercluster/leaflet-markercluster-tests.ts

    function onEachFeature(feature, layer) {
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
      }
    }
    // Make a http request to the server and get the data
    this.http.get("http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326").map(res => res.json()).subscribe(data => {
      // Make data available for other functions
      this.geoJson = data;

      // Add the markers to the map
      L.geoJson(data.features, {
        onEachFeature: onEachFeature
      }).addTo(this.map);
    });
  }

  // TODO : Move this to its own file and properly reference it
  addRotateMarker() {
    // save these original methods before they are overwritten
    let proto_initIcon = L.Marker.prototype._initIcon;
    let proto_setPos = L.Marker.prototype._setPos;

    let oldIE = (L.DomUtil.TRANSFORM === "msTransform");

    L.Marker.addInitHook(function() {
      let iconAnchor = this.options.icon.options.iconAnchor;
      if (iconAnchor) {
        iconAnchor = (iconAnchor[0] + "px " + iconAnchor[1] + "px");
      }
      this.options.rotationOrigin = this.options.rotationOrigin || iconAnchor || "center bottom";
      this.options.rotationAngle = this.options.rotationAngle || 0;
    });

    L.Marker.include({
      _initIcon: function() {
        proto_initIcon.call(this);
      },

      _setPos: function(pos) {
        proto_setPos.call(this, pos);

        if (this.options.rotationAngle) {
          this._icon.style[L.DomUtil.TRANSFORM + "Origin"] = this.options.rotationOrigin;

          if (oldIE) {
            // for IE 9, use the 2D rotation
            this._icon.style[L.DomUtil.TRANSFORM] = " rotate(" + this.options.rotationAngle + "deg)";
          } else {
            // for modern browsers, prefer the 3D accelerated version
            this._icon.style[L.DomUtil.TRANSFORM] += " rotateZ(" + this.options.rotationAngle + "deg)";
          }
        }
      },

      setRotationAngle: function(angle) {
        this.options.rotationAngle = angle;
        this.update();
        return this;
      },

      setRotationOrigin: function(origin) {
        this.options.rotationOrigin = origin;
        this.update();
        return this;
      }
    });
  }

}
