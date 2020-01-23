const { assert } = require('chai');

const  findUserByEmail  = require('../helpers.js');

const testUsers = {
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
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedOutput = testUsers['userRandomID'];
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if the email is not in the database', function() {
    const user = findUserByEmail("notDatabaseEmail@example.com", testUsers)
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});