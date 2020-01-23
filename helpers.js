function findUserByEmail(emAd, usersObj) {
  for (const user in usersObj) {
    const outputUser = usersObj[user];
    if (outputUser['email'] === emAd) {
      return outputUser;
    }
  }
}

const urlsForUserID = function(urlDB, ID) {
  const newDB = {};
  for (const shortUrl in urlDB) {
    if (urlDB[shortUrl]['userID'] === ID) {
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
    if (usersObj[user]['email'] === emAd) {
      return emAd;
    }
  }
}



module.exports = { urlsForUserID, findUserByEmail, createUser, generateRandomString, lookupEmail }

