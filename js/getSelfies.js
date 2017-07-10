window.fbAsyncInit = function() {
            FB.init({
                appId            : '247268699101593',
                autoLogAppEvents : true,
                xfbml            : true,
                version          : 'v2.9'
            });
            
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    console.log('Logged in.');
                }
                else {  
                    FB.login();
                }
            });

            FB.AppEvents.logPageView();
        };
        
        (function(d, s, id){
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s); js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }
            (document, 'script', 'facebook-jssdk')
        );

function getUserProfilePicture(){
    FB.login(function(){
        // Note: The call will only work if you accept the permission request
        FB.api("/me/picture?type=large",
            function (response) {
                if (response && !response.error) {
                /* handle the result */
                displayProfilePicture(response);
                }
            }
        );
    }, 
    {scope: 'publish_actions'});
}

function displayProfilePicture(result){
	// Generic function to display any set of record
	var line;
	
	line = "<tr>"
	line += "<td><img src=" + JSON.stringify(result.data.url) + "></td>";
	line += "</tr>"
	$('#resultTable').append(line);
	
}

function getUserUploadedPictures(){
    FB.login(function(){
        // Note: The call will only work if you accept the permission request
        //FB.api("/me/photos?type=uploaded",
        FB.api("/me/photos?type=uploaded",
            function (response) {
                if (response && !response.error) {
                /* handle the result */
                    displayUploadedPictures(response);
                }
            }
        );
    }, 
    {scope: 'user_photos'});
}

function displayUploadedPictures(result){
	// Generic function to display any set of record
	var data;
	var json;
	var line;
    
	for(var i = 0; i < result.data.length ; i++){
		json = result.data[i];
		line = "<tr>"
		
		
		/*for (var property in json) {
			if (json.hasOwnProperty(property)) {
				data = json[property];
				line += "<td>" + JSON.stringify(data) + "</td>";
			}
		}*/
		
 		var photoID = '/' + JSON.stringify(json.id)+'?fields=source';
 		photoID = photoID.replace(/['"]+/g, '');
        
        FB.api(
            photoID,
            function (result) {
              if (result && !result.error) {
                /* handle the result */
                	var line;
	
                	//line = "<tr>"
                	line = "<td><img src=" + JSON.stringify(result.source) + "height=140 width=140></td>";
                	//line += "</tr>"
                	$('#resultTable').append(line);
              }
            }
        );

// 		line += "</tr>"
// 		$('#resultTable').append(line);
	}
}


//Only runs once DOM is ready
$(document).ready(function(){
    
    //When button get facebook user profile pic is pressed
	$("#btnGetFbProfPic").click(function(){
	    getUserProfilePicture();
	});
	
    //When button get facebook user uploaded pics is pressed
	$("#btnGetFbUploadedPic").click(function(){
		//change all text on h1 tag
		//$("h1").text("this is a jQuery text")
	    getUserUploadedPictures();
	    //getUserUploadedPictures();
		//getFbSelfies();
	});
	
});



