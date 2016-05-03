# Web Mapping Assignment
This is an assignment for the Web Mapping module as part of my final year DT228 course (DIT Computer Science). The project is a mobile app which uses leaflet to display a map to a user. The map contains a set of markers for all of the places to eat in Dublin, Ireland.



## [Table of Contents](#table-of-contents)
1. [Setup](#setup)
	- [Windows](#windows)
	- [Linux/Mac](#linuxmac)
2. [Running the App](#running-the-app)
	- [Browser](#browser)
	- [Mobile (with ionic view)](#mobile-with-ionic-view)
	- [Mobile Emulating](#mobile-emulating)
3. [Assignment Spec](#assignment-spec)
  - [Assignment - Dining in Dublin](#assignment-dining-in-dublin)
  - [Objective](#objective)
  - [Suggested design](#suggested-design)
  - [Marking scheme](#marking-scheme)
  - [Submission](#submission)


## Setup
In order to run the application you will need to have the following installed (Note command line instructions will  be given for Mac OSX/Linux operating systems). I am assuming you have git installed and know how to clone a repo.

##### Windows
For windows user you can download node from [here](https://nodejs.org/en/), note that the app will not work with node v6 as there is a conflict with ionic at the time of writing this.

In order to install Ionic and Cordova please follow the instructions [here](http://ionicframework.com/getting-started/). In order to avoid using the command line you can use the Ionic Lab application though it is a bit buggy itself. You can find it [here](http://lab.ionic.io/).

##### Linux/Mac
For (Debian based) Linux or Mac users (with brew) you can use the following commands in your terminal to install Node, Cordova and Ionic.

Linux :
- `apt-get install node`
- `npm install -g cordova ionic`

Mac :
- `brew install node`
- `npm install -g cordova ionic`

Note, if your running Ubuntu then [this script](https://github.com/nraboy/ubuntu-ionic-installer/) made by Nic Raboy allows you install everything you need to develop and run ionic apps with Android. However it does setup the Android dependencies so it is quite a large download for that bit. If you dont need that part just comment it out of the script.

## Running the App
In order to run the app first we have install its dependencies. To do that navigate to the directory you cloned the app into and then run `npm install`. Note that Device Orientation functionality will only work on a real mobile device or through Ionic View.

##### Browser
In order to use the app within the browser you must first comment out the following line within www/index.html.

```html
<!-- HACK : Ensures that cordova is loaded before trying to run the app, platform.ready executes immediately in ionic view -->
<script>window.phonegap = {}</script>
```

Once completed run `ìonic serve` to launch the app in your browser.

##### Mobile (with ionic view)
Download the Ionic View mobile app from your native mobile app store. Open the app and login or create an Ionic Framework account. Then return to your terminal and run `ionic upload`. Enter your username and password and once its completed uploading you can view it through the ionic view app.

##### Mobile Emulating
This will require you to have the Android or iOS platform installed. Once you have either of them run the following commands :

- `ionic platform add android`
- `ionic emulate android -c -l`

The `-c` and `-l` flags enable logging so you can see the applications logs in your terminal.

## Assignment Spec

##### Assignment - Dining in Dublin

There is a dataset available on mf2.dit.ie called "dublin_food". This represents an extract from the OpenStreetMap database which has the following tag values:

'amenity=>restaurant' or 'amenity=>fast_food' or 'amenity=>cafe'

It can be accessed from PostgreSQL/PostGIS directly using the connection string:

"dbname=osm user=stduser password=stduser host=mf2.dit.ie port=5432" and SQL query: "SELECT * FROM dublin_food"

or from Geoserver using the URL

"SomeURL"

The dataset contains the following fields:

osm_id	bigint	ID from OSM
location_astext	text	Location as WKT Point in Spherical Mercator coordinates
name	text	Name of amenity
cuisine	text	Type of cuisine
location	geometry(Point,900913)	Point Geometry stored as Spherical Mercator coordinates
website	text	Website link if available

###### Objective
Create a mobile-friendly web site that ascertains your current position, finds food outlets near your position and attaches a marker to each. The marker symbol should be appropriate for the amenity so pick different symbols to distinguish between cafe, fast food, fine dining, ethnic etc. On selection the marker will display a pop-up giving details of the amenity. You should be able to get "as the crow flies" direction and distance to the amenity. Direction and distance given on the marker should dynamically update as you move.

###### Suggested design

This project can be approached in stages.

- Establish current location.
- Track changes in location dynamically.
- Get data from PostGIS and/or Geoserver.
  - As this is not a database exercise, the dataset is provided.
- Visualise the output on a map.
- Compute distance to target.

Visual a direction indicator on the map. Suggestion is to create a transparent graphic of a north-pointing arrow and rotate it based on bearing to target. Suggest you use the HTML5 canvas object for this. Remember direction to target is computed with reference to compass bearing and current direction of travel.

If you're feeling particularly adventurous, try to implement your solution as a hybrid app using Cordova.
###### Marking scheme

An indicative marking scheme would be:

Functionality (40%)
the extent to which the solution meets the brief

Readability (20%)
the extent to which the solution is nicely laid out and commented

Elegance/Style (20%)
the extent to which the solution is implemented elegantly. Implies simplicity with completeness.

Language features (10%)
use and choice of appropriate techniques from the alternatives offered by the language(s)

Innovation (10%)
unexpected, creative or innovative code demonstrated by the student.

Obviously, there's a degree of flexibility within these. For example, a student mightn't demonstrate much innovation but might implement a very elegant solution so should be rewarded accordingly.

Marks awarded for any reasonable effort even if you don't achieve a complete solution. Remember, we're not trying to create a commercial product, it's a reasonably challenging learning exercise.

##### Submission

You'll need to submit a link to your web site on your MS Azure server. Also submit a zip archive containing any code (HTML, CSS, JavaScript) that you develop.
