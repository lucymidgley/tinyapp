const express = require("express");
const cookieParser = require('cookie-parser');
const lookupEmail = require("./emailChecker");
const findUserByEmail = require('./helpers');
const generateRandomString = require("./genStr");
const app = express();
const urlsForUserID = require("./filterUrls");
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const createUser = require('./createUser');
app.use(cookieParser());
const PORT = 8080;

app.use(cookieSession({
  name: 'session',
  keys: ['thisIsMyVerySecretKey'],
}));



app.set("view engine", "ejs");

//set up database for urls 
//the first key is the shortURL

const urlDatabase = {
  "b2xVn2": {longURL: "www.lighthouselabs.ca", userID: "something1243"},
  "9sm5xK": {longURL: "www.google.com", userID: "anotherthing1234"}
};

//set up users database
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


app.listen(PORT, () => {
  console.log(`Tiny app listening on port ${PORT}`);
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
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    const userId = req.session.user_id;
    const user = users[userId];
    let templateVars = {
      urls: urlsForUserID(urlDatabase, user.id), user };
    res.render("urls_new", templateVars);
  }
});



app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const newStr = generateRandomString();
  urlDatabase[newStr] = {};
  urlDatabase[newStr]['longURL'] = req.body['longURL'];
  urlDatabase[newStr]['userID'] = user.id;
  res.redirect(`/urls/${newStr}`);
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    let templateVars = {shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'] , user};
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params['shortURL']]) {
    const longURL = urlDatabase[req.params['shortURL']]['longURL'];
    res.redirect(`http://${longURL}`);
  } else {
    const userId = req.session.user_id;
    const user = users[userId];
    let templateVars = {
      urls: urlDatabase, user };
    res.status(403).render("notURL", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    delete urlDatabase[req.params['shortURL']];
    res.redirect(`/urls`);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = { shortURL: req.params.shortURL, longURL: req.body['longURL'], user };
  urlDatabase[req.params['shortURL']]['longURL'] = req.body['longURL'];
  urlDatabase[req.params['shortURL']]['userID'] = user.id;
  res.render("urls_show", templateVars);
});

app.get("/urls/:shortURL/edit", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (!user) {
    res.status(403).redirect("/login");
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]['longURL'], user};
    res.render("urls_show", templateVars);
  }
});

app.post("/login", (req, res) => {
  if (lookupEmail(req.body.email, users) !== req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null };
    res.status(403).render("badDet", templateVars);
  } else {
    const user = findUserByEmail(req.body.email, users);
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      let templateVars = {
        urls: urlDatabase, user: null };
      res.status(403).render("badPw", templateVars);
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase, user };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  let templateVars = {
    urls: urlDatabase, user };
  res.render("login", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    let templateVars = {
      urls: urlDatabase, user: null };
    res.status(400).render("badDet", templateVars);
  } else if (lookupEmail(req.body.email, users) === req.body.email) {
    let templateVars = {
      urls: urlDatabase, user: null };
    res.status(400).render("userExists", templateVars);
  } else {
    const userID = generateRandomString();
    users[userID] = createUser(userID, req.body.email, req.body.password);
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

