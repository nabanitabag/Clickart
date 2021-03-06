const { User } = require("../models");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

/**
 * Get User by id
 * - Fetch user object from Mongo using the "_id" field and return user object
 * @param {String} id
 * @returns {Promise<User>}
 */
const getUserById = async(id) => {
  let user = await User.findById(id);
     if(user)
      return user;
    return null;
};


// Implement getUserByEmail(email)
/**
 * Get user by email
 * - Fetch user object from Mongo using the "email" field and return user object
 * @param {string} email
 * @returns {Promise<User>}
 */
async function getUserByEmail(email){
  let user = await User.findOne({"email": email});
    if(user)     
      return user;
    return null;
};

// Implement createUser(user)
/**
 * Create a user
 *  - check if the user with the email already exists using `User.isEmailTaken()` method
 *  - If so throw an error using the `ApiError` class. Pass two arguments to the constructor,
 *    1. “200 OK status code using `http-status` library
 *    2. An error message, “Email already taken”
 *  - Otherwise, create and return a new User object
 *
 * @param {Object} userBody
 * @returns {Promise<User>}
 * @throws {ApiError}
 *
 * userBody example:
 * {
 *  "name": "users",
 *  "email": "user@gmail.com",
 *  "password": "usersPasswordHashed"
 * }
 *
 * 200 status code on duplicate email - https://stackoverflow.com/a/53144807
 */
 const createUser = async(user) => {  
   if(await User.isEmailTaken(user.email)){
    throw new ApiError(httpStatus.OK, "Email already taken");
   }
   
   const newUser = await User.create(user);
   return newUser;
};

// Implement getUserAddressById()
/**
 * Get subset of user's data by id
 * - Should fetch from Mongo only the email and address fields for the user apart from the id
 *
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserAddressById = async (id) => {
  let user = await User.findOne({"_id": id},  {"address": 1, "email": 1});
  if(user)     
    return user;
  return null;
};

/**
 * Set user's shipping address
 * @param {String} email
 * @returns {String}
 */
async function setAddress (user, newAddress) {
  user.address = newAddress;
  await user.save();
  return user.address;
};

module.exports = {getUserByEmail, getUserById, createUser, getUserAddressById, setAddress};

