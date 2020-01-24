function findUserByEmail(emAd, usersObj) {
  for (const user in usersObj) {
    const outputUser = usersObj[user];
    if (outputUser['email'] === emAd) { //loop through users and see if any user's email coreresponds to given email
      return outputUser;
    }
  }
}

const urlsForUserID = function(urlDB, ID) {
  const newDB = {};
  for (const shortUrl in urlDB) {
    if (urlDB[shortUrl]['userID'] === ID) { //loop through db and add url obejcts to new db if the user id matches
      newDB[shortUrl] = urlDB[shortUrl];
    }
  } return newDB;
};

const bcrypt = require('bcrypt');

const createUser = function(userID, email, password) {
  const newUser = {};
  newUser['id'] = userID;
  newUser['email'] = email;
  newUser['password'] = bcrypt.hashSync(password, 10);
  return newUser;
};

function generateRandomString() {
  const arr = [1,2,3,4,5,6,7,8,9,0,"a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
  let ans = "";
  for (let i = 0; i < 6; i++) {
    ans += arr[Math.floor(Math.random() * arr.length)];
  }
  return ans;
}

function lookupEmail(emAd, usersObj) {
  for (const user in usersObj) {
    if (usersObj[user]['email'] === emAd) { //see if any user in user db has email corresponding to given email
      return emAd;
    }
  }
}

const checkShortURL = function(urlDB, userID, shortURL) {
  let usersURLs = urlsForUserID(urlDB, userID); //check filtered urls against given url and id to check ownership
  return Object.keys(usersURLs).includes(shortURL);
};

const timeConverter = function(unixTimestamp) {
  const fmDate = new Date(unixTimestamp * 1000);
  const year = fmDate.getFullYear();
  const month = fmDate.getMonth();
  const day = fmDate.getDate();
  const hour = fmDate.getHours();
  const min = fmDate.getMinutes();
  const sec = fmDate.getSeconds();
  const time = new Date(Date.UTC(year, month, day, hour, min, sec));
  return time.toUTCString();
};

const userTimes = function(url, timesArr) {
  const newArr = [];
  for(const item of timesArr){
    if(item[0] === url) {
      newArr.push(item);
    }
  } return newArr;
}

module.exports = { urlsForUserID, findUserByEmail, createUser, generateRandomString, lookupEmail, checkShortURL, timeConverter, userTimes};

