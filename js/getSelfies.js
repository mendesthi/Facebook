var userName;       //Stores the facebook user name to send together with the pictures in JSON
var jObject = {};   //we send this JSON to SAP Leonardo (face recognition)
var line;           //Controls HTML to display pictures in a line
var phoroURLs = [];      //stores URLs for all photoIDs
var photoIDs = [];       //stores IDs for all photoIDs
var endpointAWS = "http://mlb1.eu-west-1.elasticbeanstalk.com/trainSystem"; //endpoint to train AWS selfie system

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
    
    //http://mlb1.eu-west-1.elasticbeanstalk.com/trainSystem
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
                jObject.pics.push(JSON.stringify(imgResult.source).replace(/['"]+/g, ''));
                jObject.user = userName;
            }
        }
    );
}

function getPhotoURLBatch(photoID){
// This function returns array of Picture URLs
// given the Picture IDs (array of photoID) in batch mode
    var eachElement;
    var data;

    var oCompleteCall = {};
    oCompleteCall.batch = [];

    for(var i = 0; i < photoID.length ; i++){
        var oMethodAndURL = {};
        oMethodAndURL.method = 'GET';
    
        oMethodAndURL.relative_url = photoID[i];
        oCompleteCall.batch.push(oMethodAndURL);
    }
    //console.dir(oCompleteCall.batch);
    

    FB.api('/', 'POST', {
    batch: JSON.stringify(oCompleteCall.batch),
    include_headers: false
    }, function (response) {
        for(var i = 0; i < response.length ; i++){
            
            /////////////////////////////??
            eachElement = response[i];
            for (var property in eachElement) {
                if (eachElement.hasOwnProperty(property)) {
                    data = eachElement[property];
                }
            }
            
            eachElement = JSON.parse(data);
            
            /////////////////////////////??
        
        
            //console.log(response);
            //Format the HTML to display retrieved pictures in index.html
            line = "<td><img src=" + JSON.stringify(eachElement.source)  + "height=140 width=140></td>";
            $('#resultTable').append(line);
            
            //Builds JSON object
            //Get the source element which is the URL
            //photoURL = JSON.stringify(imgResult.source).replace(/['"]+/g, '');
            //Clean URL to avoid special char at the begining and at the end of the string
            //photoURL = photoURL.replace(/['"]+/g, '');
            jObject.pics.push(JSON.stringify(eachElement.source).replace(/['"]+/g, ''));
            jObject.user = userName;
        }
    });
}

function displayUploadedPictures(result){
// Function to display pictures user has uploaded or is tagged in HTML
	var json;
	jObject.pics = [];
	
	for(var i = 0; i < result.data.length ; i++){
		json = result.data[i];
 		var photoID = '/' + JSON.stringify(json.id)+ '?fields=source';
 		photoID = photoID.replace(/['"]+/g, '');
 		photoIDs.push(photoID);
	}
	
	getPhotoURLBatch(photoIDs);
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

// function batchRequest(){
//     $.ajax({
//             url: 'https://graph.facebook.com',
//             batch: {"method":"GET", "relative_url":"me"},
//                     //{"method":"GET", "relative_url":"me/friends?limit=50"}]',
//             success: function(json) {console.log(JSON.stringify(json))}
//         });
// }


function batchRequest(){
    // var opts = {
    //               message : 'Some message',
    //               name : 'Post Name',
    //               link : 'url',
    //               description : 'The post Description',
    //               picture : 'url to image'
    //           };
    
    FB.api('/', 'POST', {
             batch: [
                  { method: "GET", relative_url: "/me/photos?type=uploaded"}
                  //{ method: "GET",relative_url: "me/friends?limit=50", body : $.param(opts) }
                  //{ method: "GET",relative_url: "me/friends?limit=50"}
             ]
           }, function (response) {
                    console.log(response);
           });
}
       
       
       
function sendPicsToAWS(endpoint, body){
   $.ajax({
      url: endpoint,
      type: 'POST',
      data: JSON.stringify(body),
      dataType : "json",
      contentType: "application/json",
      success: function(data){
          //return callback(data);
          console.log(data);
      }
    //   error: function( xhr, status, errorThrown ) {
    //     alert (errorThrown);
    //     console.log( "Error: " + errorThrown );
    //     console.log( "Status: " + status );
    //     console.dir( xhr );
    //   }
  }); 
}

function profileAlbum(){
    var profilePicsAlbumID;
    
    FB.api(
        "/me/albums",
        function (response) {
          if (response && !response.error) {
            /* handle the result */
            console.dir(response);
            for(var i = 0; i < response.data.length ; i++){
                if (response.data[i].name === 'Profile Pictures'){
                    profilePicsAlbumID = response.data[i].id;
                    FB.api(
                        "/"+ profilePicsAlbumID + "/photos",
                        function (response) {
                          if (response && !response.error) {
                            /* handle the result */
                            console.dir(response);
                            displayUploadedPictures(response);
                            
                            // for(var i = 0; i < response.length ; i++){
                            //     if (response.data[i].name === "Profile Pictures"){
                            //         profilePicsAlbumID = response.data[i].ID;
                            //     }
                            // }
                          }
                        }
                    );
                }
            }
          }
        }
    );
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
	$("#btnSendToAWS").click(function(){
	    //sendToSAPLeo(jObject);
	    sendPicsToAWS(endpointAWS, jObject);
	});
	
	$("#btnProfileAlbum").click(function(){
	    profileAlbum();
	});
	
});
