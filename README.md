#### Web Mapping Assignment

Table of contents goes here 



This is an assignment for the web mapping module. The spec for the assignment is as follows

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
Marking scheme

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
