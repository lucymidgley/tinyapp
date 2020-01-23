function findUserByEmail(emAd, usersObj) {
  for (const user in usersObj) {
    if (usersObj[user]['email'] === emAd) {
      return usersObj[user];
    }
  }
}

module.exports = findUserByEmail;