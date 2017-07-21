// var oUrl;
// var jURL = []; 
//var photoURL;

var userName;       //Stores the facebook user name to send together with the pictures in JSON
var jObject = {};   //we send this JSON to SAP Leonardo (face recognition)
var line;           //Controls HTML to display pictures in a line

window.fbAsyncInit = function() {
//This function is required to initiate the Facebook SDK
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
        
        FB.api("/me",
            function (retUserName) {
                if (retUserName && !retUserName.error) {
                /* handle the result */
                    userName = retUserName.name;
                }
            }
    );
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

function displayProfilePicture(result){
// Function to display user's profile picture in HTML
	line = "<tr>";
	line += "<td><img src=" + JSON.stringify(result.data.url) + "></td>";
	line += "</tr>";
	$('#resultTable').append(line);
}

function getUserProfilePicture(){
// Function to get Facebook's user's profile picture 
    FB.login(function(){
        // Note: The call will only work if you accept the permission request
        FB.api("/me/picture?type=large",
            function (response) {
                if (response && !response.error) {
                displayProfilePicture(response);
                }
            }
        );
    }, 
    {scope: 'publish_actions'});
}

function sendToSAPLeo(injObject){
//This function is supposed to call the API which 
//will recognize whose face is in picture
    console.log(JSON.stringify(injObject));
}

function getPhotoURL(photoID){
// This function gets the Picture URL (imgResult.source) 
// given the Picture ID (photoID)
    FB.api(
        photoID,
        function (imgResult) {
            if (imgResult && !imgResult.error) {
                
                //Format the HTML to display retrieved pictures in index.html
                line = "<td><img src=" + JSON.stringify(imgResult.source)  + "height=140 width=140></td>";
                $('#resultTable').append(line);
                
                //Builds JSON object
                    //Get the source element which is the URL
                        //photoURL = JSON.stringify(imgResult.source).replace(/['"]+/g, '');
                    //Clean URL to avoid special char at the begining and at the end of the string
                        //photoURL = photoURL.replace(/['"]+/g, '');
                jObject.URL.push(JSON.stringify(imgResult.source).replace(/['"]+/g, ''));
                jObject.Name = userName;
            }
        }
    );
}

function displayUploadedPictures(result){
// Function to display pictures user has uploaded or is tagged in HTML
	var json;
	jObject.URL = [];
	
	for(var i = 0; i < result.data.length ; i++){
		
		json = result.data[i];
		line = "<tr>";
		
 		var photoID = '/' + JSON.stringify(json.id)+ '?fields=source';
 		photoID = photoID.replace(/['"]+/g, '');
 		getPhotoURL(photoID);
	}
}

function getUserUploadedPictures(){
// Function to get pictures user has uploaded or is tagged in HTML
    FB.login(function(){
        // Note: The call will only work if you accept the permission request
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

//Only runs once DOM is ready
$(document).ready(function(){
    
    //When button "get facebook user profile pic" is pressed
	$("#btnGetFbProfPic").click(function(){
	    getUserProfilePicture();
	});
	
    //When button "get facebook user uploaded pics" is pressed
	$("#btnGetFbUploadedPic").click(function(){
	    getUserUploadedPictures();
	});
	
	//When button "send pics to SAP Leonardo" is pressed
	$("#btnSendToSAPLeo").click(function(){
	    sendToSAPLeo(jObject);
	});
});
