(function() {
    'use strict';



    var src = ""
    angular.module('app2', [])
    .controller('appController2', appController);

    appController.$inject = ['$scope', '$window'];
    function appController($scope, $window) {
        var mapsKey = "AIzaSyDu5GLqc08Ekgsd2InKtyLKRwsiumYpUwc";
        //var staticMapsKey = "AIzaSyDvWhGaST3901qlXqN1yOLMUhLweIUUBbc";
        var signature = "K6OAcgEPwEGjwkewMVtzJhCKPSQ=";
        var staticMapsKey2 = "AIzaSyAtWq_mPqLIhlLtC9DJrFlKWl6kXkNqVvQ";


        $scope.latitude = 47.643812; //37.530101;
        $scope.longitude = -122.1312316; //38.600062;
        $scope.zoom = 16; //14;
        $scope.sizeX = 640;
        $scope.sizeY = 400;


        $scope.currentImageSrc = "https://maps.googleapis.com/maps/api/staticmap?maptype=satellite&center=" + $scope.latitude + "," + $scope.longitude + "&zoom=" + $scope.zoom + "&size="+ $scope.sizeX + "x" + $scope.sizeY + "&key="+ staticMapsKey2 + "&signature=" + signature;
        src = $scope.currentImageSrc;
    }

    // var params = {
    //         // Request parameters
    //         "returnFaceId": "true",
    //         "returnFaceLandmarks": "false",
    //         "returnFaceAttributes": "{string}",
    //     };
    //
    //     $.ajax({
    //         //url: "https://api.projectoxford.ai/face/v1.0/detect?" + $.param(params),
    //         url: "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Color&language=en",
    //         headers: {
    //             // Request headers
    //             "Content-Type":"application/json",
    //             "Ocp-Apim-Subscription-Key":"6e9fdb8663554369899e59b7271b2390"
    //         },
    //         type: "POST",
    //         // Request body
    //         data: src,
    //     })
    //     .done(function(data) {
    //         console.log(data)
    //         alert("success");
    //     })
    //     .fail(function() {
    //         alert("error");
    //     });

        var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://api.projectoxford.ai/vision/v1.0/analyze?visualFeatures=Color&language=en",
  "method": "POST",
  "headers": {
    "content-type": "application/json",
    "ocp-apim-subscription-key": "6e9fdb8663554369899e59b7271b2390",
    "access-control-allow-origin": "*",
    "cache-control": "no-cache",
    "postman-token": "63cc14ff-de36-0975-234d-b8ccaeaa398a"
  },
  "processData": false,
  "data": "{\"url\":\"https://maps.googleapis.com/maps/api/staticmap?maptype=satellite&center=37.530101,38.600062&zoom=14&size=640x400&key=AIzaSyAtWq_mPqLIhlLtC9DJrFlKWl6kXkNqVvQ&signature=IxwbaPo27Y4ukmYnJvgi5cy26M8=\"}"
}
var quadrant = "";

$.ajax(settings).done(function (response) {
  //console.log(response);
  //console.log(response["color"]["accentColor"]);
  var accentHex = response["color"]["accentColor"];
  findQuadrantWithStrongestAccent(accentHex);


})

// (A) Get PNG and break into 2-D array of RGB objects
// (B) Start quad-recursive function
function findQuadrantWithStrongestAccent(accentHex) {
    console.log(accentHex);
    var image = new Image();
    image.onload = function() {

        // Convert accent hexedecimal color to rgb
        var accentRGB = hexToRgb(accentHex);

        // Retrieve PNG
        var canvas = document.createElement('canvas');
        var ctx=canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        // Move PNG 1-D array (of rgba) to 2-D array (of rgb)
        var rowLen = 400; var colLen = 640; // px
        var imgData = ctx.getImageData(0, 0, colLen, rowLen).data; // 1-D
        var imgRGB = []; // 2-D
        var tempRow = [];
        //console.log(imgData.length);
        for (var i = 0; i < imgData.length; i += 4) {

            var pixNum = (i / 4) + 1;

            // New row (but don't count first run)
            if ((pixNum % colLen) == 0) {
                imgRGB.push(tempRow);
                tempRow = [];
            }

            // Extract and push values into row
            var r = imgData[i];
            var g = imgData[i + 1];
            var b = imgData[i + 2];
            var a = imgData[i + 3]; // Not needed
            tempRow.push({"r": r, "g": g, "b": b});
        }

        // TODO: Fix columns and rows being 1 off
        //console.log(imgRGB);
        console.log(imgRGB.length);
        console.log(imgRGB[0].length);

        // Run our recursive function!
        var quad = quadTunnel(imgRGB, 4, accentRGB, "");
        //elevationDiff(spreadPoint(zoomLocation));
        var centerZoom = locationFromPath(quad, 640, 400);
        //Create jsGraphics object
        var gr = new jsGraphics(document.getElementById("canvas"));

        //Create jsColor object
        var col = new jsColor("red");

        //Create jsPen object
        var pen = new jsPen(col,1);
        var pt1 = new JSPoint(centerZoom[0], centerZoom[1]);
        gr.fillCircle(col,pt1,100);
        var points = spreadPoint(centerZoom);
        console.log(points);
        $.ajax("/elevation", {
            body:{"points": "points"}
        }).then(function(data) {
            console.log(data);
        });
    }
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = src;
}

function spreadPoint(point) {
    var results = [];
    console.log(point);
    results.push([point[0] + 1, point[1] + 1])
    results.push([point[0] - 1, point[1] - 1])
    results.push([point[0] - 1, point[1] + 1])
    results.push([point[0] + 1, point[1] + 1])
    return results;
}

// Recursive function for paritioning image (as rgb array)
// into quadrants, stopping when all image in current frame
// is under a certain threshold (e.g. a match with our accent
// value)
function quadTunnel(image, depth, accent, path) {

    // Dimensions for *current* image
    var numImgRows = image.length;
    var numImgCols = image[0].length;

    console.log("Image = [" + numImgRows + ", " + numImgCols + "]")

    // (1) Determine if image is similar enough to accent
    if (depth == 0) { //(isSimilar(image, accent)) {

        // (2.a) Set four internal coordinates from which
        // to get elevation values

        // TODO



        // (2.b) Run elevationDiff on image; send params to
        // server and process values returned
        // NOTE: Values returned from function scale from 0
        // (= smoothest) to infinity (= rocky as fuck)

        // TODO
        var rockiness = 0;

        return path;
    }

    // (2.b) Split into four "symmetrical" pieces

    for(var i = 0; i < numImgRows; i++) {
        for(var j = 0; j < numImgCols; j++) {
            var r = image[i][j].r - accent.r;
            var g = image[i][j].g - accent.g;
            var b = image[i][j].b - accent.b;
            image[i][j] = {"r": r, "g": g, "b": b};
        }
    }

    var topLeft = spliceImage(image, [0, 0], [(numImgRows / 2), (numImgCols / 2)]);
    var topRight = spliceImage(image, [0, (numImgCols / 2)], [(numImgRows / 2), numImgCols]);
    var bottomLeft = spliceImage(image, [(numImgRows / 2), 0], [numImgRows, (numImgCols / 2)]);
    var bottomRight = spliceImage(image, [(numImgRows / 2), (numImgCols / 2)], [numImgRows, numImgCols]);

    // (3.b) Recurse on each piece
    // TODO: Something with capturing the min value throughout
    var splicedImageArray = [(topLeft), (topRight), (bottomLeft), (bottomRight)];

    var min = Number.POSITIVE_INFINITY;
    var minInd = -1;
    for(var i = 0; i < 4 ; i++) {
        var value = colorDeltaFromAccent(splicedImageArray[i]);
        //console.log(value);
        if (value < min) {
            min = value;
            minInd = i;
        }
    }

    console.log(min);
    console.log(minInd);
    var newPath = path + String(minInd);
    if (minInd == 0) {
        return quadTunnel(topLeft, depth - 1, accent, newPath);
    } else if (minInd == 1) {
        return quadTunnel(topRight, depth - 1, accent, newPath);
    } else if (minInd == 2) {
        return quadTunnel(bottomLeft, depth - 1, accent, newPath);
    } else if (minInd == 3) {
        return quadTunnel(bottomRight, depth - 1, accent, newPath);
    } else {
        console.log("u fuked UP!");
    }
}

function locationFromPath(path, sizeX, sizeY) {
    console.log(path);
    var centerX = 0;
    var centerY = 0;
    if(path.length == 0) {
        // CALL HIS SHIT on sizeX / 2 sizeY /2
        var result = [sizeX / 2, sizeY / 2];
        return result;
    } else {
        var k = 0;
        var direction = path.charAt(path.length - 1);
        var n =4;
        var trueCenter = locationFromPath(path.substring(0, path.length - 1), centerX , centerY);
        if (direction == '3') {
            centerX = trueCenter[0] - sizeX / n;
            centerY = trueCenter[1] - sizeY / n;
        } else if (direction == '2') {
            centerX = trueCenter[0] + sizeX / n;
            centerY = trueCenter[1] - sizeY / n;
        } else if (direction == '1') {
            centerX = trueCenter[0] - sizeX / n;
            centerY = trueCenter[1] + sizeY / n;
        } else if (direction == '0') {
            centerX = trueCenter[0] + sizeX / n;
            centerY = trueCenter[1] + sizeY / n;
        }
        var largerTrueCenter = [centerX, centerY];
        console.log(largerTrueCenter);
        return largerTrueCenter;
    }
}

function colorDeltaFromAccent(image) {
    //console.log(image)
    var accentDifference = 0;
    for(var i = 0; i < image.length; i++) {
        for(var j = 0; j < image[1].length; j++) {
            var r = Math.abs(image[i][j].r);
            var g = Math.abs(image[i][j].g);
            var b = Math.abs(image[i][j].b);
            accentDifference = accentDifference + r + g  + b;
        }
    }

    //console.log(accentDifference);
    return accentDifference;
}

// Get subset of image such that start (= [row, col]) are
// top-left coordinates of image and end (= [row, col]) are
// bottom-right coordinates of image
function spliceImage(image, start, end) {
    var startRow = Math.floor(start[0]);
    var startCol = Math.floor(start[1]);

    var endRow = Math.floor(end[0]);
    var endCol = Math.floor(end[1]);

    //console.log("start = " + start);
    //console.log("end = " + end);

    var newImg = [];
    for (var row = startRow; row < endRow; row++) {
        var tempRow = [];

        for (var col = startCol; col < endCol; col++) {
            //console.log("row: " + row+ "col: " + col);
            tempRow.push(image[row][col]);
        }
        newImg.push(tempRow);
    }

    return newImg;
}

// Hex -> rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

})()
