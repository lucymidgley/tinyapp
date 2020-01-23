const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { urlsForUserID, findUserByEmail, createUser, generateRandomString, lookupEmail, checkShortURL } = require('./helpers');
const users = require('./database/users.js');
const urlDatabase = require('./database/urlDatabase.js');
app.use(cookieParser());
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['thisIsMyVerySecretKey'],
}));



app.set("view engine", "ejs");


const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}`);
});

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
    let templateVars = {
      urls: urlsForUserID(urlDatabase, user.id), user };
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
  if (!user) {
    res.status(403).redirect("/login"); 
  } else {
  const newStr = generateRandomString(); //create random string for the shortURL
  urlDatabase[newStr] = {};
  urlDatabase[newStr]['longURL'] = req.body['longURL'];
  urlDatabase[newStr]['userID'] = user.id; //update db with new urls
  res.redirect(`/urls/${newStr}`); 
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId]; //check user is logged in
  let templateVars = { user }
  if (!user) {
    res.status(403).redirect("/login"); 
  } else {
    if(!checkShortURL(urlDatabase, userId, req.params.shortURL)){ //check user owns this short URL
      res.status(403).render("notOwner", templateVars)
    }else {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] , user}; //extract short and long URLs from the database using req params
    res.render("urls_show", templateVars); //render page to show user their new URL 
  }
}
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params['shortURL']]) { //check shortURL is in db
    const longURL = urlDatabase[req.params['shortURL']]['longURL'];
    res.redirect(`http://${longURL}`); //if so redirect to this page
  } else {
    const userId = req.session.user_id;
    const user = users[userId];
    let templateVars = {
      urls: urlDatabase, user };
    res.status(403).render("notURL", templateVars); //otherwise tell user this shortURL does not exist
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = { user };
  if (!user) {
    res.status(403).redirect("/login"); //check user is logged in
  } else {
    if(!checkShortURL(urlDatabase, userId, req.params.shortURL)){ //check user owns this short URL
      res.status(403).render("notOwner", templateVars)
    }else {
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
    if(!checkShortURL(urlDatabase, userId, req.params.shortURL)){ //check user owns this short URL
      res.status(403).render("notOwner", templateVars)
    }else {
  let templateVars = { shortURL: req.params.shortURL, longURL: req.body['longURL'], user };
  urlDatabase[req.params['shortURL']]['longURL'] = req.body['longURL'];
  urlDatabase[req.params['shortURL']]['userID'] = user.id;
  res.redirect('/urls') //when user creates new short URL update database with new entry
  }
}
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  templateVars = { user }
  if (!user) {
    res.status(403).redirect("/login"); //check user logged in
  } else {
    if(!checkShortURL(urlDatabase, userId, req.params.shortURL)){ //check user owns this short URL
      res.status(403).render("notOwner", templateVars)
    }else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user};
    res.render("urls_show", templateVars); 
  }
}
});

app.post("/login", (req, res) => {
  if (lookupEmail(req.body.email, users) !== req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null }; //check user is in db
    res.status(403).render("badDet", templateVars); //if not allow them to enter details again or register 
  } else {
    const user = findUserByEmail(req.body.email, users);
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      let templateVars = {
        urls: urlDatabase, user: null }; //check hached passwords match, if not allow them to try again, register wrong password page
      res.status(403).render("badPw", templateVars);
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls"); //allow user to access their urls
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
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
  if (req.body.email === "" || req.body.password === "") {
    let templateVars = {
      urls: urlDatabase, user: null }; 
    res.status(400).render("badDet", templateVars); //check user has entered somehting in each field
  } else if (lookupEmail(req.body.email, users) === req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null }; //check if user already has an account by checking email against databse
    res.status(400).render("userExists", templateVars);
  } else {
    const userID = generateRandomString();
    users[userID] = createUser(userID, req.body.email, req.body.password);
    req.session.user_id = userID;
    res.redirect("/urls"); //if not create new entry in users database with new user ID given by our random string generator
  }
});

