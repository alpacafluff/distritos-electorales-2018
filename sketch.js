
/*

The geojson information on the districts used for this map was extracted from a Google MyMaps
page that I believe was made by members of Wikipolitica Jalisco. It was then converted from .kml to geojson

This sketch was built using an example shown in
Genevieve Hoffman's Data Art course at the Interactive Telecommunications
Program at NYU's Tisch School of the Arts
November 8th, 2017

Repo for this example: https://github.com/veev/DataArtFall2017/tree/master/section-3/turfjs-example
*/

mapboxgl.accessToken = 'pk.eyJ1IjoicGlsYXJnIiwiYSI6ImNqOXZxaThtNDBkZDIyemw3bDRicHZxbGIifQ.1Nlv0rO5QoTGh1bH_UYr-Q'; //<your access token here>
// the code won't run without your own token inserted between the single quotes

var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',
    center: [ -103.238774, 20.642147 ], // starting position [lng, lat]
    zoom: 9.09 // starting zoom level
});

// load geojson data once base map has loaded
map.on('load', function() {
	// load data with d3 (just my preference, load it another way if you prefer)
	d3.json('distritos-electorales-gdl.geojson', function(err, data) {
		if (err) throw err;

		console.log(data);

		// map source (data) needs a name, type and data
		map.addSource('distritos-electorales-gdl', { type: 'geojson', data: data });

		// map layer needs an id, type, the source and a style
		map.addLayer({
			'id': 'distritos-guadalajara',
			'type': 'fill',
			'source': 'distritos-electorales-gdl',
			'paint': {
				'fill-color': '#BAD8A7',
				'fill-outline-color': '#fff',
				'fill-opacity': 0.4
			}
		});

		// add interactivity to see a popup with info about a district
		map.on('click', 'distritos-guadalajara', function(e) {

			let popup = new mapboxgl.Popup()
				.setLngLat(e.lngLat)
				.setHTML("Perteneces al " + e.features[0].properties.Name)
				.addTo(map);
		});

		map.on('mouseenter', 'distritos-guadalajara', function() {
			// Change the cursor style as a UI indicator.
        	map.getCanvas().style.cursor = 'pointer';
		})

		map.on('mouseleave', 'distritos-guadalajara', function() {
			// Change the cursor style back as a UI indicator.
			map.getCanvas().style.cursor = '';
		});

		// add mapbox geocoder to look up an address!
		let geocoder = new MapboxGeocoder({
			accessToken: mapboxgl.accessToken
		});
		map.addControl(geocoder);

		// create an empty array to keep track of popups
		let popups = [];

		// listen to 'result' event to see which address and coordinate is searched
		geocoder.on('result', function(res) {

			// if there's already a city council popup, erase it!
			if (popups.length > 0) {
				console.log(popups);

				//remove all the popups from the map if they already exist
				popups.forEach(function(popup) {
					popup.remove();
				});
			}
			console.log(res.result);

			// put lat / lon into a turf point (just for a shorter variable name)
			let pt = turf.point(res.result.geometry.coordinates);
			// console.log(pt);

			//iterate through multipolygons to see which one point is inside
			data.features.forEach( function(feature) {
				// turf.inside is a method to check whether a point is inside a polygon
				if (turf.inside(pt, feature)) {

					let councilInfo = new mapboxgl.Popup()
						.setLngLat(pt.geometry.coordinates)
						.setHTML("Perteneces al" + feature.properties.Name)
						.addTo(map);
					popups.push(councilInfo);
				}
			})
		});
	});

});
