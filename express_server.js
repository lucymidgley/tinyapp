const express = require("express");
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override')
const app = express();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { urlsForUserID, findUserByEmail, createUser, generateRandomString, lookupEmail, checkShortURL, timeConverter, userTimes} = require('./helpers');
const users = require('./database/users.js');
const urlDatabase = require('./database/urlDatabase.js');
app.use(cookieParser());
const PORT = 8080;


app.use(cookieSession({
  name: 'session',
  keys: ['thisIsMyVerySecretKey'],
}));



app.set("view engine", "ejs");

app.use(methodOverride('_method'));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.get("/", (req, res) => {
  res.redirect("/urls");
});


//check if user exists, if not render not_logged_in
//otherwise render index for users urls

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    let templateVars = {
      urls: urlDatabase, user };
    res.render("not_logged_in", templateVars);
  } else {
    let totalVisits = {};
    let uniqueVisits = {}; //set up visits object
    let visits = { totalVisits, uniqueVisits }; 
    let usersUrls = urlsForUserID(urlDatabase, user.id);
      for(const shortURL of Object.keys(usersUrls)) { //find visit counters by checking these cookies
        visits.totalVisits[shortURL] = req.session[shortURL] //add number of visits and unique visits to visits object
        visits.uniqueVisits[shortURL] = req.session.hasVisited[shortURL].length 
      }
      let templateVars = {
        urls: urlsForUserID(urlDatabase, user.id), user, visits };
    res.render("urls_index", templateVars);
  }
});

//check if user exists, if not redirect to login
//otherwise render new url page

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id; //check cookies user ID against db to see if user already esists in db and is logged in
  const user = users[userId];
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    const userId = req.session.user_id; //if logged in, asign userID to cookie and retrieve user object from DB
    const user = users[userId];
    let templateVars = {
      urls: urlsForUserID(urlDatabase, user.id), user };
    res.render("urls_new", templateVars);
  }
});


//user makes new shortURL:
app.post("/urls", (req, res) => {
  const userId = req.session.user_id; //find user in db so we can assign new url to user
  const user = users[userId];
  let templateVars = { user }
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    if(req.body['longURL'] === ""){
      res.render("empty_URL", templateVars ) //make sure they can't enter empty url
  }else {
    const newStr = generateRandomString(); //create random string for the shortURL
    urlDatabase[newStr] = {};
    urlDatabase[newStr]['longURL'] = req.body['longURL'];
    urlDatabase[newStr]['userID'] = user.id; //update db with new urls
    req.session[newStr] = 0; //set cookie for the number of visits to 0
    req.session.hasVisited[newStr] = [];  //set number of unique visits to 0
    res.redirect(`/urls/${newStr}`);
  }
}
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]; //check user is logged in
  let templateVars = { user };
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    if (!checkShortURL(urlDatabase, userId, req.params.shortURL)) { //check user owns this short URL
      res.status(403).render("not_owner", templateVars);
    } else {
      let times = userTimes(req.params.shortURL, req.session.times);
      let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] , user, times}; //extract short and long URLs from the database using req params
      res.render("urls_show", templateVars); //render page to show user their new URL
    }
  }
});

app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  console.log("here!", req.session.hasVisited);
  if (urlDatabase[req.params['shortURL']]) { //check shortURL is in db
    const longURL = urlDatabase[req.params['shortURL']]['longURL'];
    const shortURL = req.params.shortURL;
    if(Object.keys(req.session.hasVisited).length === 0){ //check if anyone has visited link before
      req.session.hasVisited[shortURL] = [] 
      req.session.hasVisited[shortURL].push(userId); //only add users to unique visits if they have not visited before
    } else {
      if(!req.session.hasVisited[shortURL].includes(userId)){ //check if this user has visted link before
    req.session.hasVisited[shortURL].push(userId); //if not add user to vistors array
    }
  }

    req.session[shortURL] += 1; //increase number of visits by 1 and add time stamp to session times cookie
    req.session.times.push([shortURL, userId, timeConverter(Math.round((new Date()).getTime() / 1000))]);
    res.redirect(longURL); 
  } else {
    const userId = req.session.user_id;
    const user = users[userId];
    let templateVars = {
      urls: urlDatabase, user };
    res.status(403).render("not_URL", templateVars); //take user to page for invalid URL if short url is not in db
  }
});

app.delete("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = { user };
  if (!user) {
    res.status(403).redirect("/login"); //check user is logged in
  } else {
    if (!checkShortURL(urlDatabase, userId, req.params.shortURL)) { //check user owns this short URL
      res.status(403).render("not_owner", templateVars);
    } else {
      delete urlDatabase[req.params['shortURL']]; //delete entire entry of this url from database
      res.redirect(`/urls`);
    }
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = { user };
  if (!user) {
    res.status(403).redirect("/login"); //check user logged in
  } else {
    if (!checkShortURL(urlDatabase, userId, req.params.shortURL)) { //check user owns this short URL
      res.status(403).render("not_owner", templateVars);
    } else {
      if(req.body['longURL'] === ""){
      res.render("empty_URL", templateVars) //make sure they can't enter empty url
    }else {
      urlDatabase[req.params['shortURL']]['longURL'] = req.body['longURL'];
      urlDatabase[req.params['shortURL']]['userID'] = user.id;
      res.redirect('/urls'); //when user creates new short URL update database with new entry
    }
  }
}
});

app.put("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = { user };
  if (!user) {
    res.status(403).redirect("/login"); //check user logged in
  } else {
    if (!checkShortURL(urlDatabase, userId, req.params.shortURL)) { //check user owns this short URL
      res.status(403).render("not_owner", templateVars);
    } else {
      let times = userTimes(req.params.shortURL, req.session.times); //create time stamp for visits to page
      let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user, times};
      res.render("urls_show", templateVars); //allow user to edit URL 
    }
  }
});

app.post("/login", (req, res) => {
  if (lookupEmail(req.body.email, users) !== req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null }; //check user is in db
    res.status(403).render("bad_det", templateVars); //if not allow them to enter details again or register
  } else {
    const user = findUserByEmail(req.body.email, users);
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      let templateVars = {
        urls: urlDatabase, user: null }; //check hached passwords match, if not allow them to try again, register wrong password page
      res.status(403).render("bad_pw", templateVars);
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls"); //allow user to access their urls
    }
  }
});

app.delete("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
}); //clear seesion cookies to logout, redirect to login

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls"); //check user is logged in
  } else {
    res.render("register", templateVars); //send information to header to load register page
  }
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase, user };
  if (user) {
    res.redirect("/urls"); //check user is logged in
  } else {
    res.render("login", templateVars); //send information to header to load login page
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    let templateVars = {
      urls: urlDatabase, user: null };
    res.status(400).render("bad_det", templateVars); //check user has entered somehting in each field
  } else if (lookupEmail(req.body.email, users) === req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null }; //check if user already has an account by checking email against databse
    res.status(400).render("user_exists", templateVars);
  } else {
    if(!req.session.hasVisited || Object.keys(req.session.hasVisited).length === 0){
    req.session.hasVisited = {}; //create empty object for visits to url cookie, if it doesn't exist
    req.session.hasVisited["b2xVn2"] = []; //create session for test URLS in db
    req.session.hasVisited["9sm5xK"] = [];
    };
    if(!req.session.times || req.session.times.length === 0){ //create array for session times cookie if it doesn't exist
      req.session.times = [];
    }
    const userID = generateRandomString();
    users[userID] = createUser(userID, req.body.email, req.body.password);
    req.session.user_id = userID;
    req.session.hasVisited["b2xVn2"] = []; //create session for test URLS in db
    req.session.hasVisited["9sm5xK"] = [];
    res.redirect("/urls"); //create new entry in users database with new user ID given by our random string generator if user is new
  }
});

app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}`);
});
