/* elevation.js */

"use strict";

// Globals
var SEP = "--------------------------------------";
var API_KEY = 'AIzaSyBWSwJBu9LUrLkw6Y10YUeUVs3h7tOgTAQ';
var client = require('@google/maps').createClient({
	key: API_KEY
});

function transformGroup(group) {
	return Promise.all(group.map(s => transformSet(s)));
}

function transformSet(set) {
	return Promise.all(set.map(l => transformLoc(l)));
}

function transformLoc(loc) {
	return new Promise((res, rej) => {
		client.elevation({
			locations: [loc]
		}, function(err, response) {
			if (!err) {
				var elevation = response.json.results[0].elevation;
				res(elevation); // successful
			} else {
				// TODO: Console log
				rej(new Error("[Error] Could not get elevation!")); // unsuccessful
			}
		});
	});
}

// Determine elevation difference between 2+
// given points, as well as variance
function elevationDiff(locs, callback) {
	//transformGroup([[[0, 0], [0, 0], [0, 0], [0, 0]], [[0, 0], [0, 0], [0, 0], [0, 0]]]).then(z => {
	transformGroup(locs).then(z => {
		// We've got all the elevations; now, let's get the variance

		// NOTE: Assuming z is 1-D
		var data = z[0];

		callback(variance(data));
	});
}

// Get variance of elevation data (i.e. how rough is surface)
function variance(data) {

	const sumF = arr => arr.reduce((a, b) => parseInt(a) + parseInt(b), 0);
	var sum = sumF(data);
	var n = data.length;
	var avg = sum / n;

	var v = 0;
	data.forEach(function(it) {
		var iti = parseInt(it);
		v += Math.pow(iti - avg, 2);
	});
	v /= n - 1;

	return v;
}

function rangeRand(min, max) {
	return (Math.random() * (max - min)) + (min);
}

function test() {
  // Start
  console.log("Determining elevation difference...");
  console.log(SEP);

  // Create random GPS coordinates
 	//  - Latitudes range from -90 to 90,
	//  - Longitudes range from -180 to 180.
	var latRange = [-90, 90];
	var longRange = [-180, 180];
  var coord = [];
	var numCoord = Math.floor(Math.random() * 1 + 1);
  for (var i = 0; i < numCoord; i++) {
    var center = [];
    for (var j = 0; j < 4; j++) {
      var x = rangeRand(latRange[0], latRange[1]);
      var y = rangeRand(longRange[0], longRange[1]);;
      center.push([x, y]);
    }
    coord.push(center);
  }
  console.log("Coordinates:");
	coord.forEach(function(c) {
		console.log(c);
	});
  console.log();

  // Get elevation difference
	elevationDiff(coord, function(val) {

		console.log("Elevation variance:");
		console.log(val);

		// End
		console.log(SEP);
	});
}

// Start 'er up
//test();

// Module stuff
module.exports = {
	elevationDiff
};
