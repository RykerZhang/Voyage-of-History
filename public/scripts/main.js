
var rhit = rhit || {};

rhit.theAuthManager = null;
rhit.username = null;
rhit.theDiscussionManager = null;

rhit.COLLECTION_DISCUSSION = "Discussion";
rhit.KEY_TITLE = "Title";
rhit.KEY_CONTENT = "Content";
rhit.KEY_SECTION = "Section";
rhit.KEY_LAST_TOUCHED = "lastTouched";
rhit.KEY_AUTHOR = "author";



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

function htmlToElement(html){
	var temp = document.createElement('template');
	html = html.trim();
	temp.innerHTML = html;
	return temp.content.firstChild;
}

//initialize of each page
rhit.intialize = function(){
	const urlParams = new URLSearchParams(window.location.search);
	//initialize the homepage
	if(document.querySelector("#HomePage")){
		const uid = urlParams.get("uid");
		//make new pagecontroller for home page
		rhit.theDiscussionManager = new rhit.DiscussionManager(uid)
		new this.HomePageController();
	}
	//initialize the warsectionpage
	if(document.querySelector("#WarsSectionPage")){
		const uid = urlParams.get("uid");
		//make new discussionmanager and pagecontroller so that the data will be sent to the backend
		rhit.theDiscussionManager = new rhit.DiscussionManager(uid)
		new this.WarsSectionPageController();
	}
	//initialize the loginpage
	if(document.querySelector("#LoginPage")){
		new this.LoginPageController();
		rhit.startFirebaseUI();

	}
}

//check for the redirects of login
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
	constructor(id, title, content, section){
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
		//add parameters to the backend
		this._ref.add({
			[rhit.KEY_AUTHOR]:rhit.username,
			[rhit.KEY_CONTENT]:content,
			[rhit.KEY_SECTION]:section,
			[rhit.KEY_TITLE]: title,
			[rhit.FB_KEY_LAST_TOUCHED]:firebase.firestore.Timestamp.now()
		})
		.then(function (docRef){
			console.log("Document written with ID: ", docRef.id);
		})
		.catch(function(error){
			console.log("Error adding document: ", error);
		});
	  }
	
	beginListening(changeListener){
		// sort the posts in descending time, limit to 2 posts
		let query = this._ref.orderBy(rhit.KEY_LAST_TOUCHED,"desc").limit(20)
		if(this._uid){
			query = query.where(rhit.KEY_AUTHOR,"==",this._uid);
		}
		this._unsubscribe = query.onSnapshot((querySnapshot) => {
			console.log("Post Update");
			this._documentSnapshots = querySnapshot.docs;
			changeListener();
    	});
	}
	stopListening() {
		this._unsubscribe();
	}
	//get discussion at certain index in the firestore
	getDiscussionAt(index) { 
		const docSnapshot = this._documentSnapshots[index];
		const theDiscussion = new rhit.Discussion(docSnapshot.id,docSnapshot.get(rhit.KEY_TITLE), docSnapshot.get(rhit.KEY_CONTENT),docSnapshot.get(rhit.KEY_SECTION))
			return theDiscussion
	   }


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
		document.querySelector("#welcomeWords").innerHTML = `Welcome ${rhit.username}`;

		rhit.theDiscussionManager.beginListening(this.updateHomePage.bind(this))
	}
	updateHomePage(){
		//Create new Container
		const newList = htmlToElement('<div id = "HomepagePostContainer"></div>');
		//Fill the HomepagePostContainer with quote cards using a loop
		for(let i =0;i<2;i++){
			const thePost = rhit.theDiscussionManager.getDiscussionAt(i);
			const newCard = this.creatCard(thePost);

			newCard.onclick = (event) => {
				console.log("YEAH");
			}
			newList.appendChild(newCard);
		}
		const oldList = document.querySelector("#HomepagePostContainer");
		oldList.removeAttribute("id");
		oldList.hidden = true;
		oldList.parentElement.appendChild(newList);
	}

	creatCard(discussion){
		return htmlToElement(`<div class="card" style="width: 18rem;">
		<div class="card-body">
		  <h5 class="card-title">${discussion.title}</h5>
		  <p class="card-text">${discussion.content}</p>
		</div>
	  </div>`);
	}
}
//Controller for the Wars Section Page
rhit.WarsSectionPageController = class{
	constructor(){
		document.querySelector("#postNewDiscussion").onclick = (event) => {
			const title = document.querySelector("#inputTitle").value;
			const content = document.querySelector("#inputContent").value;
			const section = document.querySelector('input[name="sectionOption"]:checked').value;
			//add the new poast to the manager
			rhit.theDiscussionManager.add(title, content, section);		
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
			 

			}else{
				console.log("There is no user signed in.");
				//User is signed out
			}
			this._user = user;
			rhit.username = this._user.email;
			
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
