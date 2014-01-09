var ready;
ready = function() {
    
    //variables
    var numberOfPieces = 12,
        aspect = "3:4", //It's important that the number of pieces can be equally divided by both the width and height components of the ratio.
        aspectW = parseInt(aspect.split(":")[0]),//evaluates to 3 
        aspectH = parseInt(aspect.split(":")[1]),//evaluates to 4
        //parseInt ensure that we end up with numbers, not strings.
        container = $("#puzzle"),
        imgContainer = container.find("figure"),
        img = imgContainer.find("img"),
        path = img.attr("src"),
        //set piece to refer to any div elem
        piece = $("<div/>"),
        //determines how the pieces must be sized, i.e. takes the total width of the picture divided by three and four to create a grid of twelve. Floor rounds to the nearest integer.
        pieceW = Math.floor(img.width() / aspectW),
        pieceH = Math.floor(img.height() / aspectH),
        idCounter = 0,
        //create an array to store the top and left positions of each piece
        positions = [],
        //set the position of the empty piece
        empty = {
            top: 0,
            left: 0,
            bottom: pieceH,
            right: pieceW
        },
        //create an empty object to keep track of the previous piece position
        previous = {},
        timer,
        currentTime = {},
        timerDisplay = container.find("#time").find("span");

    //generate puzzle pieces
    for (var x = 0, y = aspectH; x < y; x++) {
      //runs four iterations
        for (var a = 0, b = aspectW; a < b; a++) {
      //runs three times for each iteration
            var top = pieceH * x,
                left = pieceW * a;
      //top position is equal to the height of a piece multiplied by the outer loop's counter variable.
                
            piece.clone().attr("id", idCounter++).css({
                width: pieceW,
                height: pieceH,
                position: "absolute",
                top: top,
                left: left,
                backgroundImage: ["url(", path, ")"].join(""),
                backgroundPosition: ["-", pieceW * a, "px ", "-", pieceH * x, "px"].join("")
      //when using jQuery css() method, use CamelCase instead of hyphens
            }).appendTo(imgContainer);

            //store positions by pushing an object with top and left properties for each piece.
            positions.push({ top: top, left: left });
        }
    }

    //remove original image
    img.remove();

    //remove first piece from board
    container.find("#0").remove();

    //remove first item in positions array
    positions.shift();

    $("#start").on("click", function (e) {

        //shuffle the pieces randomly
        var pieces = imgContainer.children();
        //finds all the children of the figures element

        //uses a Fisher-Yates shuffle - an established pattern for creating a random ordering of a given set of values
        function shuffle(array) {
            var i = array.length;
            if (i === 0) {
                return false; //returns false, thus stopping the function if the array is empty
            }
            while (--i) {
                var j = Math.floor(Math.random() * (i + 1)),
                    tempi = array[i],
                    tempj = array[j];

                array[i] = tempj;
                array[j] = tempi;
            }
        }

        shuffle(pieces);

        //set position of shuffled images using .eq() basically allows you to choose from a set of like elements with an index. ex: selector.eq(index)
        $.each(pieces, function (i) {
            pieces.eq(i).css(positions[i]);
        });

        //replace existing pieces with shuffled pieces
        pieces.appendTo(imgContainer);

        //make sure empty slot is at position 0 when timer starts
        empty.top = 0;
        empty.left = 0;

        //remove any previous messages
        container.find("#ui").find("p").not("#time").remove();

        //cancel previous timer
        if (timer) {
            clearInterval(timer);
            timerDisplay.text("00:00:00");
        }

        //start the timer!
        timer = setInterval(updatetime, 1000);
        currentTime.seconds = 0;
        currentTime.minutes = 0;
        currentTime.hours = 0;

        //update the timer display
        function updatetime() {

            //stop timer if 24 hours
            if (currentTime.hours === 23 && currentTime.minutes === 59 && currentTime.seconds === 59) {
                clearinterval(timer);
            } else if (currentTime.minutes === 59 && currentTime.seconds === 59) {
                //increment hours if applicable
                currentTime.hours++;
                currentTime.minutes = 0;
                currentTime.seconds = 0;
            } else if (currentTime.seconds === 59) {
                //increment minutes if applicable
                currentTime.minutes++;
                currentTime.seconds = 0;
            } else {
                //increment seconds
                currentTime.seconds++;
            }

            //build time string
            newHours = (currentTime.hours <= 9) ? "0" + currentTime.hours : currentTime.hours;
            newMins = (currentTime.minutes <= 9) ? "0" + currentTime.minutes : currentTime.minutes;
            newSecs = (currentTime.seconds <= 9) ? "0" + currentTime.seconds : currentTime.seconds;

            //update display
            timerDisplay.text([newHours, ":", newMins, ":", newSecs].join(""));
        }

        //make pieces draggable
        pieces.draggable({
            //keeps the item from being dragged outside the parent element
            containment: "parent",
            //sets points that the piece being dragged should snap to. pieceW is the horizontal points, pieceH is the vertical points
            grid: [pieceW, pieceH],
            //e is the event object, ui is an object containing properties about the current draggable item
            start: function (e, ui) {
                //the helper property of the ui object is a jQuery-wrapped reference to the underlying DOM element that has started to be dragged
                var current = getPosition(ui.helper);

                //set axis depending on location relative to empty space
                if (current.left === empty.left) {
                    ui.helper.draggable("option", "axis", "y");
                    //checks if the draggable and the empty are in the same row. If so, then sets it so that it can only be moved along the y axis. i.e. horizontally
                } else if (current.top === empty.top) {
                    ui.helper.draggable("option", "axis", "x");
                } else {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                //prevent drag if not adjacent to empty space
                if (current.bottom < empty.top || current.top > empty.bottom || current.left > empty.right || current.right < empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                //remember current location
                previous.top = current.top;
                previous.left = current.left;

            },
            drag: function (e, ui) {

                var current = getPosition(ui.helper);

                //stop dragging if we are in the empty space
                if (current.top === empty.top && current.left === empty.left) {
                    ui.helper.trigger("mouseup");
                    return false;
                }

                //stop dragging if moving away from empty space
                if (current.top > empty.bottom || current.bottom < empty.top || current.left > empty.right || current.right < empty.left) {
                    ui.helper.trigger("mouseup").css({
                        top: previous.top,
                        left: previous.left
                    });
                    return false;
                }
            },
            stop: function (e, ui) {
                var current = getPosition(ui.helper),
                    correctPieces = 0;

                //move empty space if space now occupied
                if (current.top === empty.top && current.left === empty.left) {
                    empty.top = previous.top;
                    empty.left = previous.left;
                    empty.bottom = previous.top + pieceH;
                    empty.right = previous.left + pieceW;
                }

                //get positions of all pieces
                $.each(positions, function (i) {

                    var currentPiece = $("#" + (i + 1)),
                        currentPosition = getPosition(currentPiece);

                    //is the current piece in the correct place?
                    if (positions[i].top === currentPosition.top && positions[i].left === currentPosition.left) {
                        correctPieces++;
                    }
                });

                //end game
                if (correctPieces === positions.length) {

                    //stop timer
                    clearInterval(timer);

                    //display message
                    $("<p/>", {
                        text: "Congratulations, you solved the puzzle!"
                    }).appendTo("#ui");

                    //convert time to seconds
                    var totalSeconds = (currentTime.hours * 60 * 60) + (currentTime.minutes * 60) + currentTime.seconds;

                    //is there a saved best time?
                    if (localStorage.getItem("puzzlebesttime")) {
                        var bestTime = localStorage.getItem("puzzlebesttime");

                        if (totalSeconds < bestTime) {
                            //save new best time
                            localStorage.setItem("puzzlebesttime", totalSeconds);

                            $("<p/>", {
                                text: "you got a new best time!"
                            }).appendTo("#ui");
                        }
                    } else {
                        //save current time
                        localStorage.setItem("puzzlebesttime", totalSeconds);

                        //display another message
                        $("<p/>", {
                            text: "You got a new best time!"
                        }).appendTo("#ui");
                    }
                }
            }
        });

        //helper to generate location
        function getPosition(el) {
            return {
                top: parseInt(el.css("top")),
                bottom: parseInt(el.css("top")) + pieceH,
                left: parseInt(el.css("left")),
                right: parseInt(el.css("left")) + pieceW
            }
        }
    });
};

$(window).load(function() {
    ready();
});