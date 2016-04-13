import {Page, Platform} from "ionic-angular";

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
  private map: any;

  constructor(platform: Platform) {
    this.platform = platform;
    this.loadMap();
  }

  // Load the map
  loadMap () {
    // Wait for the platform to be ready otherwise google will not be referenced
    this.platform.ready().then( () => {

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

          // show the user their location
          this.addMarker("Your location");
        },
        (error) => {
          console.log(error);
        }, options
      );
    });
  }

  // Follow user
  followUser () {
    // TODO : Follow the user and provide their location
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
