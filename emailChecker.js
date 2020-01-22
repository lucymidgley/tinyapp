function lookupEmail(emAd, usersObj) {
  for(const user in usersObj){
    if(usersObj[user]['email'] === emAd){
      return false
    }
  } return true
}

module.exports = lookupEmail;