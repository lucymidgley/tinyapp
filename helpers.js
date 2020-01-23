function findUserByEmail(emAd, usersObj) {
  for (const user in usersObj) {
    const outputUser = usersObj[user];
    if (outputUser['email'] === emAd) {
      return outputUser;
    }
  }
}

module.exports = findUserByEmail;