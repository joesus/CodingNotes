//set iife, this helps create closure and shield the global namespace
(function() {

	var tags = "",
		getBounties = function(page, callback) {
			//.ajax() method is simply the way to use AJAX with jQuery
			$.ajax({
				//sets the url that the request is made to
				url: "https://api.stackexchange.com/2.0/questions/featured",
				//JSONP (JSON with padding), gets around browser restriction that might be triggered by JSON
				dataType: "jsonp",
				//data is a jQuery AJAX property
				data: {
					//specifies which page of the results we'd like to get
					page: page,
					//the number of questions to be returned
					pagesize: 10,
					//optional way of searching tags
					tagged: tags,
					order: "desc",
					//most recent activity first
					sort: "activity",
					site: "stackoverflow",
					//you set the filter on the stackExchange site. this is using a premade one for this exercise
					filter: "!)4k2jB7EKv1OvDDyMLKT2zyrACssKmSCXeX5DeyrzmOdRu8sC5L8d7X3ZpseW5o_nLvVAFfUSf"
				},
				//jQuery method to show the spinner before the request is made. 
				beforeSend: function() {
					$.mobile.loadingMessageTextVisible = true;
					$.mobile.showPageLoadingMsg("a", "Searching");
				}
			}).done(function (data) {
					//callback will be passed into getBounties() as a second argument, passing it the data from the response.
					callback(data);

			});
		};

		//pageinit event executes code when page is initalized for the first time, works better than document ready for for AJAX with jQueryMobile, second argument makes ure the event handler is only executed when the event originates from the welcome page.		
		$(document).on("pageinit", "#welcome", function () {

			//bind a handler for the click event to the search button
			$("#search").on("click", function () {

				//disable the outer button container to stop further requests
				$(this).closest(".ui-btn").addClass("ui-disabled");

				//obtain the user input from the input with id='tags'
				tags = $("tags").val();

				//call getBounties function with the first page of results as the first argument, and an anonymous function for the second argument in order to manipulate the data returned by the callback
				getBounties(1, function(data) {

					//add a new property to the data object to store the page number
					data.currentPage = 1;

					//need to convert it to a string with JSON in order for localStorage to accept it as an input
					localStorage.setItem("res", JSON.stringify(data));

					//changes the page to the page where we'll display the response
					$.mobile.changePage("bountyhunterlist", {
						transition: "slide"
					});
				});
			});
		});

		//bind pageshow event to the welcome page, allowing us to perform a new search, basically just resets the buttons when you return to the welcome page.
		$(document).on("pageshow", "#welcome", function () {
			$("#search").closest(".ui-btn").removeClass("ui-disabled");
		});

		$(document).on("pageinit", "#list", function () {
			
					//reference to earlier stored data
			var data = JSON.parse(localStorage.getItem("res")),
					//total number of results as property of data
					total = parseInt(data.total, 10),
//not sure how it determines page_size
					size = parseInt(data.page_size, 10),
					// ? why do we need this step?
					totalPages = Math.ceil(total / size),
					//array of shortened month names to use when we format the dates
					months = [
						"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul",
						"Aug", "Sep", "Oct", "Nov", "Dec"
			];

			var createDate = function (date) {
						//creates date formatted to work with js Date() constructor, this way it returns UTC instead of UNIX format
				var cDate = new Date(date * 1000),
						//the UTC is too long so we define new array where we pull out the parts we want
						fDate = [
							cDate.getDate(), months[cDate.getMonth()],
							cDate.getFullYear()
						].join(" ");

						return fDate;
			};
			
			//the helpers method of the views object (created by JsRender) allows us to map helper new methods that we can then use in our template views
			$.views.helpers({ CreateDate: createDate });

			//select the listview widget by id and append to the template
			$("#results").append($("#listTemplate")
										//.render is a JsRender method
										.render(data))
										//after rendering we initialize the Listview widget by getting the <ul> element inside the results container and calling the method listview()
										.find("ul")
										.listview();

			//This is based on the currentPage property set in the pageinit event...
			var setClasses = function () {
				if (data.currentPage > 1) {
					$("a[data-icon='back']").removeClass("ui-disabled");
				} else {
					$("a[data-icon='back']").addClass("ui-disabled");
				}

				if (data.currentPage < totalPages) {
					$("a[data-icon='forward']").removeClass("ui-disabled");
				} else {
					$("a[data-icon='forward'").removeClass("ui-disabled");
				}
			};

			//finds the spans by class and uses .text() to insert the data
			$("span.num").text(data.currentPage);
			$("span.of").text(totalPages);

			if (totalPages > 1) {
				$("a[data-icon='forward']").removeClass("ui-disabled");
			}

		
			$("#results").on("click", "li", function () {

				//finds the position of the question, the results are returned as an array with id="item-0" as the first item. the index variable grabs the id attribute, splits 'item-0' into an array and returns the second item in the array (position 1) 
				var index = $(this).find("a").attr("id").split("-")[1],
						//we set 'question' to our desired question by passing the position of the item we just found to the data object
						question = data.items[index];

				//why this step, it adds an id to the <div data-role="page" id="this"> ..is this just for the template?
				question.pageid = "item-view-" + index;


				$("body").append($("#itemTemplate").render(question));


				var page = $("#item-view-" + index);

				//hmm... not sure why the data-external-page true, but the result of the two lines is that the markup from the listview template is removed from the dom. Without the _bindPageRemove method the markup just becomes hidden
				page.attr("data-external-page", true).on
				("pageinit", $.mobile._bindPageRemove);

				$.mobile.changePage(page, {
						transition: "slide"
				});
			});

			$("a[data-icon='forward'], a[data-icon='back']").on("click", function () {
				
				//reference to the just clicked button
				var button = $(this),
						//the direction of the button icon
						dir = button.attr("data-icon"),
						//find the value of the current page
						page = parseInt($("span.num").eq(0).text(), 10);

				if (dir === "forward") {
					page++;
				}	else {
					page--;
				}

				getBounties(page, function (newData) {

					data = newData;
					data.currentPage = page;
					localStorage.setItem("res", JSON.stringify(newData));

					$.mobile.hidePageLoadingMsg();

					$("#results").empty()
											.append($("#listTemplate").render(newData))
											.find("ul")
											.listview();

					$("span.num").text(page);

					setClasses();
				});
			});

		});
}());