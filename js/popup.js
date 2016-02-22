/*
Isaiah Torain
January 12, 2016
  Popup.js is the main script that gathers the necessary information
  to display. The script works by setting button action on the various
  html elements then prompting the user for their location. If permission
  is given the script uses the user's geolocation to locate events using the
  jquery http get method. If not the user is prompted for input and then events
  are found based off the user entered location. If no location is entered an
  error message is shown. Dates are formatted using moment.js.
*/

/*                        Global variables                          */
var API_URL = "https://www.eventbriteapi.com/v3/events/search/";
var AUTH_TOKEN = "OT2PLLJYSNXELHW2UY4O";
var latitude;
var longitude;
var useGeoLocation = false;
var inputPopup = $(".input_boxes");
var greetingMSG = $("#greeting");
var inputButtons = $(".input_buttons");
var loadingMSG = $("#loading");
var cityInput = $("#city_input");
var stateInput = $("#state_input");
var range = $("#range_selector");
var nextWeekend = $("#next_weekend_selector");
var errorMSG = $("#error_message");
/**********************************************************************/

/*          functions to add on click actions to html elements        */
$('#logo').on("click",function() {
  chrome.tabs.create({ url: element.target.href })//clicking on eventbrite logo brings up web page
});

$(".yes_button").on("click",function() {
  hideGreeting();
  loadingMSG.show();
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, fail);
  }
});

$(".no_button").on("click",function() {
  inputPopup.show();
  hideGreeting();
});

$("#search_button").on("click",function() {
  eventSearch();
});
/**********************************************************************/

/*        Functions used to determine geolocation access              */
function success(position) {
  latitude = position.coords.latitude;
  longitude = position.coords.longitude;
  useGeoLocation = true;
  eventSearch();
}

function fail() {
  hideGreeting();
  inputPopup.show();
  range.hide();
}

function hideGreeting() {
  greetingMSG.hide();
  inputButtons.hide();
}
/**********************************************************************/

/*          Search for events using http get from jquery              */
function eventSearch() {
  var options;
  if (useGeoLocation && nextWeekend[0].checked) { //search using geolocation and next weekend filter
    var dates = getDates();
    options = {
      token: AUTH_TOKEN,
      popular: true,
      'location.latitude': latitude,
      'location.longitude': longitude,
      'location.within': range.val(),
      'start_date.range_start': dates[0],
      'start_date.range_end': dates[1]
    };
    $.get(API_URL, options, updateView);
  }

  else if (!useGeoLocation && nextWeekend[0].checked) { //search using user input and next weekend
    if (!cityInput.val()) {
      errorMSG.text("Please enter a city and state.");
      return;
    }
    var dates = getDates();
    options = {
      token: AUTH_TOKEN,
      popular: true,
      'venue.city': cityInput.val(),
      'venue.region': stateInput.val().toUpperCase(),
      'start_date.range_start': dates[0],
      'start_date.range_end': dates[1]
    };
    $.get(API_URL, options, updateView);
  }

  else if (useGeoLocation) {// search for events using geolocation only
    options = {
      token: AUTH_TOKEN,
      popular: true,
      'location.latitude': latitude,
      'location.longitude': longitude,
      'location.within': range.val()
    };
    $.get(API_URL, options, updateView);
  }
  else { // or search for events using user input
    if (!cityInput.val()) {
      errorMSG.text("Please enter a city and state.");
      return;
    }
    options = {
      token: AUTH_TOKEN,
      popular: true,
      'venue.city': cityInput.val(),
      'venue.region': stateInput.val().toUpperCase()//state code has to be uppercase
    };
    $.get(API_URL, options, updateView);
  }
}
/**********************************************************************/

function getDates() {
  var startDate = moment().add(1, 'weeks').endOf('isoWeek').subtract(2 ,'day').add(1, 'second').format('YYYY-MM-DDTHH:mm:ss[Z]'); //get next friday using moment
  var endDate = moment().add(1, 'weeks').endOf('isoWeek').format('YYYY-MM-DDTHH:mm:ss[Z]'); // get next sunday using moment

  return [startDate,endDate];
}

/* Update the html view by appending events onto the events div      */
function updateView(data) {
  loadingMSG.hide();
  $(".selectors").hide();
  var eventsList = data.events;

  if (!eventsList.length) {
    errorMSG.text('Sorry, looks like there are not events near you!');
    return;
  }

  for (var i = 0; i < eventsList.length; i++) {
    var name = eventsList[i].name.text;
    var description = eventsList[i].description.text.substring(0,300) + "...";
    var startTime = moment(eventsList[i].start.utc).format("dddd, MMMM Do YYYY, h:mm a"); //Format the date using moment to a user readable format
    var eventUrl = eventsList[i].url;
    $("#events").append('<header class="w3-container w3-orange"><h4><a href="' + eventUrl + '" class="event-link">' + name + '</a></h4></header>'
        + '<div style="padding-left:3px">' + startTime + '</div>' + '<p style="padding:3px">' + description + '</p>');
    $('#events_container').show();
  }
  attachLinkEventHandler();
}
/**********************************************************************/
/*         This function opens event title links in a new tab         */
function attachLinkEventHandler() {
  $('.event-link').click(function(element) {
    chrome.tabs.create({ url: element.target.href })
  });
}
/**********************************************************************/
