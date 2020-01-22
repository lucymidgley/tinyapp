function lookupEmail(emAd, usersObj) {
  for(const user in usersObj){
    if(usersObj[user]['email'] === emAd){
      return false
    }
  } return true
}

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
console.log(lookupEmail('user@something.com', users));