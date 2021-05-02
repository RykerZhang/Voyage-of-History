
var rhit = rhit || {};

rhit.theAuthManager = null;

rhit.COLLECTION_DISCUSSION = "Discussion";
rhit.KEY_TITLE = "Title";
rhit.KEY_CONTENT = "Content";
rhit.KEY_SECTION = "Section";
rhit.FB_KEY_LAST_TOUCHED = "lastTouched";


const inputEmail = document.querySelector("#emailAddress");
const inputPassword = document.querySelector("#password");


// this method is for the multiple login UI, used in the mainmethod, Login Page
rhit.startFirebaseUI = function(){
	var uiConfig = {
        signInSuccessUrl: '/',
        signInOptions: [
          firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        
      };
	  const ui = new firebaseui.auth.AuthUI(firebase.auth());
      ui.start('#firebaseui-auth-container', uiConfig);
}

//initialize of each page
rhit.intialize = function(){
	const urlParams = new URLSearchParams(window.location.search);
	if(document.querySelector("#HomePage")){
		const uid = urlParams.get("uid");
		new this.HomePageController();

	}
	if(document.querySelector("#WarsSectionPage")){
		new this.WarsSectionPageController();

	}
	if(document.querySelector("#LoginPage")){
		new this.LoginPageController();
		rhit.startFirebaseUI();

	}
}

rhit.checkForRedirects = function(){
	console.log(rhit.theAuthManager.isSignedIn);
	if(document.querySelector("#LoginPage")&&rhit.theAuthManager.isSignedIn){
		window.location.href = "/homePage.html";
	}
	if(!document.querySelector("#LoginPage")&&!rhit.theAuthManager.isSignedIn){
		window.location.href = "/";
	}
}

//the class for the discussion Card
rhit.Discussion = class{
	constructor(id, content, section, title){
		this.id = id;
		this.content = content;
		this.section = section;
		this.title = title;
	}
}

//the manager for discussion card
rhit.DiscussionManager = class{
	constructor(uid){
		this._uid = uid;
		this._documentSnapshots = [];
		this._ref = firebase.firestore().collection(rhit.COLLECTION_DISCUSSION);
		this._unsubscribe = null;
	}

	add(title, content, section){

	}
	beginListening(changeListener){}
	stopListening() {}
	getDiscussionAt(index) {    }


}
//Controller for the HomePage
rhit.HomePageController = class{
	constructor(){
		document.querySelector("#HomeSignOut").onclick = (event) => {
			console.log("You sign out");
			rhit.theAuthManager.signOut();
		}
		document.querySelector("#WarsSectionButton").onclick = (event) => {
			window.location.href = "/WarsSection.html"
		}
		
	}
}
//Controller for the Wars Section Page
rhit.WarsSectionPageController = class{
	constructor(){
		document.querySelector("#postNewDiscussion").onclick = (event) => {
			const title = document.querySelector("#inputTitle").value;
			const content = document.querySelector("#inputContent").value;
			console.log(`title is${title}, content is ${content}.`);
		}
	}
}

//Controller for the login page
rhit.LoginPageController = class {
	constructor() {
		
		document.querySelector("#CreateAccountButton").onclick = (event) => {
			rhit.theAuthManager.signUp();
		}

		document.querySelector("#logInWithExistingAccountButton").onclick = (event) => {
			rhit.theAuthManager.signIn();
		}
	}
}

//Authentication Manager
rhit.AuthManager = class{
	constructor(){
		this._user = null;	
	}
	//BEGIN Listening:
	beginListening(changeListener){
		firebase.auth().onAuthStateChanged((user) => {
			if (user) {
			  // User is signed in, see docs for a list of available properties
			  // https://firebase.google.com/docs/reference/js/firebase.User
			 var displayName = user.displayName;
			 var email = user.email;
			 var photoURL = user.photoURL;
			 var uid = user.uid;
	
			 console.log("User is signed in.", uid);
			 console.log("Display name: " ,displayName);
			 console.log("email:" ,email);
			 console.log("photoURL: ", photoURL);
			 document.querySelector("#welcomeWords").innerHTML = `Welcome ${email}`;

			}else{
				console.log("There is no user signed in.");
				//User is signed out
			}
			this._user = user;
			changeListener();

		});
	}
	//Sign out: To be used later
	signOut(){
			firebase.auth().signOut().then(() => {
				// Sign-out successful.
				console.log("You signed out");
			  }).catch((error) => {
				// An error happened.
				console.log("Sign out error");
			  });
		
	}
	//Sign up Method with Email
	signUp(){
			console.log(`Create account: ${inputEmail.value} password: ${inputPassword.value}`);	

			firebase.auth().createUserWithEmailAndPassword(inputEmail.value, inputPassword.value).then((userCredential) => {
			// Signed in 
			var user = userCredential.user;
			console.log("You signed in");
			})
			.catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log("Create account error: ", errorCode, errorMessage);

			});
		}
	//Login Method
	signIn(){
			firebase.auth().signInWithEmailAndPassword(inputEmail.value, inputPassword.value).then((userCredential) => {
				// Signed in
				var user = userCredential.user;
				console.log(`You signed in with ${inputEmail.value}`);
				// ...
			  })
			  .catch((error) => {
				var errorCode = error.code;
				var errorMessage = error.message;
				console.log(`ErrorCode:${errorCode}, ErrorMessage:${errorMessage}`);
			  });
		}
	get isSignedIn() {
		return !!this._user;
	}
}


/* Main */
/** function and class syntax examples */
rhit.main = function () {

	rhit.theAuthManager = new rhit.AuthManager();
	rhit.theAuthManager.beginListening(() => {
		rhit.checkForRedirects();
		rhit.intialize();
	})

};

rhit.main();
