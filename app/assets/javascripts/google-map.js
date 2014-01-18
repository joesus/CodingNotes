$(function() {

	var api = google.maps,
			mapCenter = new api.LatLng(50.91710, -1.40419),
      mapOptions = {
        zoom: 13,
        center: mapCenter,
        mapTypeId: api.MapTypeId.ROADMAP,
        disableDefaultUI: true
      },
      //defines the container for the map
      map = new api.Map(document.getElementById('map'),
      mapOptions),
      ui = $("#ui"),
      clicks = 0,
      positions = [],
      gmarkers = [];

  //add marker for company hq
  var homeMarker = new api.Marker({
    position: mapCenter,
    map: map,
    icon: "assets/hq.png"
  });

  //api provided constructor for InfoWindow()
  var infoWindow = new api.InfoWindow({
    content: document.getElementById("hqInfo")
  });

  //open() method takes two arguments, the map that the info window belongs to, and the location the info window is added to
  api.event.addListener(homeMarker, "click", function() {
    infoWindow.open(map, homeMarker);
  });

  var addMarker = function (e) {

    //checks twice, the first iteration will occur at clicks === 0, the second will occur at clicks === 1
    if (clicks <= 1) {

      //store the position of the click
      positions.push(e.latLng);
      //if the map has been clicked, add a marker
      var marker = new api.Marker({
          map: map,
          position: e.latLng,
          //removes the shadow that google add because we're using an image that already has a shadow
          //can also write this as clicks === 0, or !clicks
          flat: (clicks === 0) ? true : false,
          //include animation for dropping location pin
          animation: api.Animation.DROP,
          //when a cursor hovers over it, the desired text will appear
          title: (clicks === 0) ? "Start" : "End",
          //the empty string causes the default red marker to be added
          icon: (clicks === 0) ? "/assets/start.png" : "",
          draggable: true,
          //allows us to differentiate between markers
          id: (clicks === 0) ? "Start" : "End"
      });
      //pushes the marker to the empty array we created for holding the markers
      gmarkers.push(marker);

      //updates the marker from the addMarker() function to bind each new marker to the dragend event, which will be fired once the marker stops being dragged, 'dragend' is the the name of the built-in event, markerDrag is the function that will handle the event
      api.event.addListener(marker, "dragend", markerDrag);

      //specified 'map' instance as the object the event will originate from, locationAdd as the name of our custom event, and the event object from our addMarker function as a parameter to any handlers that may be listening for our custom event
      api.event.trigger(map, "locationAdd", e);

    } else {
      //stops listening after two clicks 
      api.event.removeListener(mapClick);
      return false;
    }
  };

  var mapClick = api.event.addListener(map, "click", addMarker);

  api.event.addListener(map, "locationAdd", function (e) {

    //set journeyE1 to $("#journey") which is a cached jQuery object that we grab or create with the 'outer' ternary statement
    var journeyE1 = $("#journey"),
        outer = (journeyE1.length) ? journeyE1 : $("<div>", {
          id: "journey"
        });

    //allows us to reverse-geocode a latLng object to get a street address, it also automatically passes a results object that contains the address
    new api.Geocoder().geocode({
      "latLng": e.latLng },
      function (results) {

        //we use jquery to create new elements to display the address and append them to the journey element
        $("<h3 />", {
          text: (clicks === 0) ? "Start:" : "End:"
        }).appendTo(outer);
        $("<p />", {
          text: results[0].formatted_address,
          id: (clicks === 0) ? "StartPoint" : "EndPoint",
          "data-latLng": e.latLng
        }).appendTo(outer);

        //if the journey element doesn't exist, we can append it to the UI in order to display the address of the location. If it does exist, we know that it's a second click and can logically add a quote button
        if (!journeyE1.length) {
          outer.appendTo(ui);
        } else {
          $("<button />", {
            id: "getQuote",
            text: "Get quote"
          //we disable the button using jQuery prop() method and we'll enable it later on when a weight is added to the input in the UI
          }).prop("disabled", true).appendTo(journeyE1);
        }
        //One we add the new elements showing the start/end point, we increment the clicks variable so we can keep track of how many markers have been added
        clicks++;
      });
  });

  //add markerDrag as a function expression, because it's an event handle, it will automatically be passed to the event object, which once again contains the latLng that we need to pass to a Geocoder() to get the new address that the marker was dragged to
  var markerDrag = function (e) {
    //set a new variable that will be used as the selector for the element in the UI we want to update
    var elId = ["#", this.get("id"), "Point"].join("");
    //once we have the selector, we use the geocode() method to give us the street address of the marker's position
    new api.Geocoder().geocode({
      "latLng": e.latLng
    }, function (results) {
      $(elId).text(results[0].formatted_address);
    });
  };

  //set an event handler and check if a timeout has been set, if so, clear it
  $("#weight").on("keyup", function () {
    if (timeout) {
      clearTimeout(timeout);
    }

    //caches the selector for the <input> element with the id of 'weight'
    var field = $(this),
      //check if input element has a value, if so, set disabled property to false, otherwise we disable it by setting it to true. This makes sure you can't click getQuote until you've entered a weight
      enableButton = function () {
        if (field.val()) {
          $("#getQuote").removeProp("disabled");
        } else {
          $("#getQuote").prop("disabled", true);
        }
      },
      //set the timeout to rate-limit the number of times the enableButton() function is executed
      timeout = setTimeout(enableButton, 250);
  });

  //3-argument form of the on() method = first arg is the name of the event, second is the selector to filter the event by, third is the function to trigger when the event occurs. Three arg form allows us to bind events for element which may or may not exist at the time of the binding. This is good practice - always should bind the event to something you know will be there
  $("body").on("click", "#getQuote", function (e) {
      e.preventDefault();

      //even though the event handler is bound to the body, the 'this' object still points to the element that triggered the event
      $(this).remove();

      //takes two args, 1- a configuration object, 2- a callback function to execute when the method returns. The callback function will automatically be passed an object containing the response
      new api.DistanceMatrixService().getDistanceMatrix({
        origins: [$("#StartPoint").attr("data-latLng")],
        destinations: [$("#EndPoint").attr("data-latLng")],
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.IMPERIAL
      }, function (response) {

        var list = $("<dl/>", {
          "class": "clearfix",
          "id": "quote"
        }),
        format = function (number) {
          var rounded = Math.round(number * 100) / 100,
              fixed = rounded.toFixed(2);

          return fixed;
        },
        term = $("<dt/>"),
        desc = $("<dd/>"),
        //extract the distance property from the multi-dimensional array buried in the respone object passed to the callback function
        distance = response.rows[0].elements[0].distance,
        weight = $("#weight").val(),
        distanceString = distance.text + "les",
        //parsefloat makes sure the value is a number and not a string
        distanceNum = parseFloat(distance.text.split(" ")[0]),
        //our home-made format method for getting the number into the format we want
        distanceCost = format(distanceNum * 3),
        weightCost = format(distanceNum * 0.25 * distanceNum),
        //the '+' stores the values as numbers and not strings
        totalCost = format(+distanceCost + +weightCost);

        $("<h3>", {
          text: "Your quote",
          id: "quoteHeading"
        }).appendTo(ui);

        term.clone().html("Distance:").appendTo(list);
        desc.clone().text(distanceString).appendTo(list);
        term.clone().text("Distance cost:").appendTo(list);
        desc.clone().text("£" + distanceCost).appendTo(list);
        term.clone().text("Weight cost:").appendTo(list);

        desc.clone().text("£" + weightCost).appendTo(list);
        term.clone().addClass("total").text("Total:").appendTo(list);
        desc.clone().addClass("total").text("£" + totalCost).appendTo(list);

        list.appendTo(ui);

        //add reset button to price quote
        $("<button>", {
          text: "Reset",
          id: "reset"
        }).appendTo(ui);

      });
  });

  //method for finding and removing markers from map
  function removeMarkers(){
    for(var i=0; i<positions.length; i++){
        gmarkers[i].setMap(null);
    }
  }

  //add functionality for reset button using removeMarkers function
  $("body").on("click", "#reset", function () {
      $("#journey, #quoteHeading, #quote").add(this).remove();
      $("#weight").val('');
      removeMarkers();
      console.log(clicks);
      clicks = 0;
      positions = [];
  });
});













