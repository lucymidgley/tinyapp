const { assert } = require('chai');

const  { urlsForUserID, findUserByEmail, lookupEmail }  = require('../helpers.js');

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

const urlDatabase = {
  "b2xVn2": {longURL: "www.lighthouselabs.ca", userID: "something1243"},
  "123ddd": {longURL: "www.facebook.com", userID: "something1243"},
  "9sm5xK": {longURL: "www.google.com", userID: "anotherthing1234"}
};

//test for findUserByEmail
describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers['userRandomID'];
    assert.deepEqual(user, expectedOutput);
  });
  it('should return undefined if the email is not in the database', function() {
    const user = findUserByEmail("notDatabaseEmail@example.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  });
});

//test for urls for user ID
describe('urlsForUserID', function() {
  it('should return only the urls assigned to a given user ID', function() {
    const db = urlsForUserID(urlDatabase,"something1243");
    const expectedOutput =
    {"b2xVn2": {longURL: "www.lighthouselabs.ca", userID: "something1243"},
      "123ddd": {longURL: "www.facebook.com", userID: "something1243"}};
    assert.deepEqual(db, expectedOutput);
  });
  it('should return an empty database if the user ID does not have any shortURLS', function() {
    const db = urlsForUserID(urlDatabase, "notAUser123");
    const expectedOutput = {};
    assert.deepEqual(db, expectedOutput);
  });
});

//test for lookupEmail
describe('lookupEmail', function() {
  it('should return the email if the user exists in the database', function() {
    const emailOut = lookupEmail("user@example.com", testUsers);
    const expectedOutput = "user@example.com";
    assert.equal(emailOut, expectedOutput);
  });
  it('should return undefined if the user is not in the database', function() {
    const emailOut = lookupEmail("notAUser@email.com", testUsers);
    const expectedOutput = undefined;
    assert.equal(emailOut, expectedOutput);
  });
});

