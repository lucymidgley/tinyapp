const bcrypt = require('bcrypt');

const createUser = function(userID, email, password) {
  const newUser = {};
  newUser['id'] = userID;
  newUser['email'] = email;
  newUser['password'] = bcrypt.hashSync(password, 10);
  return newUser;
};
module.exports = createUser;