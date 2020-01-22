function lookupEmail(emAd, usersObj) {
  for(const user in usersObj){
    if(usersObj[user]['email'] === emAd){
      return emAd
    }
  }
}

module.exports = lookupEmail;