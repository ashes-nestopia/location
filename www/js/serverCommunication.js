
app.submitToServer = function() {
	var userPasscode = document.getElementById('userPasscode').value;
	var numOfUsers = document.getElementById('numOfUsers').value;
	numOfUsers = (numOfUsers == "") ? 1 : numOfUsers;

	if(app.position!=undefined && app.position!=null){
		if (((new Date().getTime() / 1000) - app.timeLastSubmit) > 59
				|| app.forcedSubmit) {
			app.timeLastSubmit = new Date().getTime() / 1000;
			app.checkConnection();

			$.ajax(app.SERVER_URL, {
				contentType : "application/json",
				type : "GET",
				data : {
					"passcode" : userPasscode,
					"deviceId" : app.deviceId,
					"marker" : JSON.stringify({
						"numOfUsers" : numOfUsers,
						"lat" : app.position.coords.latitude,
						"lng" : app.position.coords.longitude,
						"accuracy" : app.position.coords.accuracy,
						"heading" : app.position.coords.heading
					})
				},
				timeout : 10000,
				success : function(response) {
					app.serverSuccess(response);
				},
				error : function(request, errorType, errorMessage) {
					app.serverError(request, errorType, errorMessage);
				}
			});
		} 
		else {
			console.log('too soon');
			// Too Soon: commented out because not useful for user and confusing.
			// var serverError = document.getElementById('serverResponse');
			// serverError.innerHTML = "Too soon: "+app.getReadableTime( new Date())
			// ;
		}		
	}
	else{
	navigator.notification
					.alert(
							"No position available to submit.", null,
							"Location Tracker");
	}
};

app.serverSuccess = function(response) {
	var responseObj = jQuery.parseJSON(response);
	var serverResponse = document.getElementById('serverResponse');
	serverResponse.innerHTML = "auto-submit: " + responseObj.message + ": "
			+ app.getReadableTime(new Date());

	if (responseObj.message == "not authorized") {
		if (app.forcedSubmit) {
			app.forcedSubmit = false;
			navigator.notification
					.alert(
							"This passcode is not authorized. Try again or contact Britta. Your device id is: "
									+ app.deviceId, null,
							"Tracking App");
		}
		$(serverResponse).removeClass("success");
		$(serverResponse).addClass("fail");
	} else {
		if (app.forcedSubmit) {
			navigator.notification.alert("Success. Thank you!", null,
					"Tracking App");
			app.forcedSubmit = false;
		}
		$(serverResponse).removeClass("fail");
		$(serverResponse).addClass("success");

		// Show or hide num of users option
		if (responseObj.advanced > 0) {
			document.getElementById("numUsersContainer").style.display = "block";
		} else {
			document.getElementById("numUsersContainer").style.display = "none";
		}
	}

};

app.serverError = function(request, errorType, errorMessage) {
	var serverError = document.getElementById('serverResponse');
	$(serverError).removeClass("success");
	$(serverError).addClass("fail");
	serverError.innerHTML = "Error: " + errorMessage + " "
			+ app.getReadableTime(new Date());
	if (app.forcedSubmit) {
		navigator.notification.alert(
				"Error, please check your internet connection", null,
				"Tracking App");
		app.forcedSubmit = false;
	}
};
