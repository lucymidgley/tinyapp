const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080;

function generateRandomString() {
  const arr = [1,2,3,4,5,6,7,8,9,0,"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let ans = ""
  for(let i=0; i<6; i++){
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans
  }

  function lookupEmail(emAd, usersObj) {
    for(const user in usersObj){
      if(usersObj[user]['email'] === emAd){
        return false
      }
    } return true
  }


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com"
};

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
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
})

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"],
    urls: urlDatabase };
  res.render("urls_new", templateVars);
});


app.post("/urls", (req, res) => {
  newStr = generateRandomString()
  urlDatabase[newStr] = req.body['longURL'];
  res.redirect(`/urls/${newStr}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params['shortURL']]){
  const longURL = urlDatabase[req.params['shortURL']];
  res.redirect(`http://${longURL}`);
  } else res.send("Please enter a valid short URL") 
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params['shortURL']] 
  res.redirect(`/urls`);
});

app.post("/urls/:shortURL", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: req.body['longURL'] };
  urlDatabase[req.params['shortURL']] = req.body['longURL'];
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username).redirect("/urls")
});

app.post("/logout", (req, res) => {
  res.clearCookie("username", req.body.username).redirect("/urls")
});

app.get("/register", (req, res) => {
  let templateVars = { username: req.cookies["username"],
    urls: urlDatabase };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  if(req.body.email === "" || req.body.password === ""){
    res.status(400).send("Please go back and enter a valid username and password")
  }else if (!lookupEmail(req.body.email, users)){
    res.status(400).send("This user already exists, please go back and enter your details again")
  }
  else {
    userID = generateRandomString();
    users.id = userID;
    users.email = req.body.email;
    users.password = req.body.password;
    console.log(users);
  res.cookie("user_id", userID).redirect("/urls");
  }
});