const urlsForUserID = function(urlDB, ID) {
  const newDB = {};
  for (const shortUrl in urlDB) {
    if (urlDB[shortUrl]['userID'] === ID) {
      newDB[shortUrl] = urlDB[shortUrl];
    }
  } return newDB;
};

module.exports = urlsForUserID;