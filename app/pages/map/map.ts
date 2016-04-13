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
  private dublinFood: any;

  private userMarker: any;
  private userPosition: any;

  constructor(platform: Platform, http: Http) {
    this.platform = platform;
    this.http = http;

    // Load the users map
    this.loadMap();

    // Get the list of food places in dublin
    this.getDublinFood();
  }

  // Load the map
  loadMap () {
    // Wait for the platform to be ready otherwise google will not be referenced
    this.platform.ready().then( () => {
      // Tell the app to use more accurate means of measurement if possible
      let options = {enableHighAccuracy: true};

      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get the users Alattitude and longitude
          let latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

          // Set the maps default options
          let mapOptions = {
            center: latlng,
            zoom: 15,
            mapTypeID: google.maps.MapTypeId.ROADMAP
          };

          // set the map
          this.map = new google.maps.Map(document.getElementById("map"), mapOptions);

          // Set the users marker to the users current location
          this.userMarker = new google.maps.Marker({
            map: this.map,
            position: this.userPosition,
            title: "Your location"
          });

          this.followUser();
        },
        (error) => {
          console.log(error);
        }, options
      );
    });
  }

  // Follow user
  followUser () {
    let options = {enableHighAccuracy: true};

    // Update the users location every 5 seconds
    window.setInterval(() => {
      console.log("Updating user position");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get the users Alattitude and longitude
          this.userPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          this.userMarker.setPosition(this.userPosition);
        },
        (error) => {
          console.log(error);
        }, options
      );
    }, 500);

  }

  getDublinFood () {
    // Make a http request to the server and get the data
    this.http.get("http://mf2.dit.ie:8080/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=dit:dublin_food&outputFormat=json&srsName=epsg:4326").map(res => res.json()).subscribe(data => {
      this.dublinFood = data.features;
      console.log(this.dublinFood);
    });
  }

  addMarker (markerContent: String) {
    // Setup the markers options
    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    // Add the info window to the marker
    this.addInfoWindow(marker, markerContent);
  }

  addInfoWindow (marker, content: String) {
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, "click", () => {
      infoWindow.open(this.map, marker);
    });
  }

}
