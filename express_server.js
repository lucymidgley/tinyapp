const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  const arr = [1,2,3,4,5,6,7,8,9,0,"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let ans = ""
  for(let i=0; i<6; i++){
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans
  }

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "www.lighthouselabs.ca",
  "9sm5xK": "www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});



app.post("/urls", (req, res) => {
  console.log(req.body); 
  newStr = generateRandomString()
  urlDatabase[newStr] = req.body['longURL'];
  res.redirect(`/urls/${newStr}`);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  if(urlDatabase[req.params['shortURL']]){
  const longURL = urlDatabase[req.params['shortURL']];
  console.log(urlDatabase[req.params['shortURL']]);
  res.redirect(`http://${longURL}`);
  } else res.send("Please enter a valid short URL") 
});