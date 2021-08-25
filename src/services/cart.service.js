const httpStatus = require("http-status");
const { Cart, Product } = require("../models");
const ApiError = require("../utils/ApiError");
const config = require("../config/config");

// Implementing the Cart service methods
/**
 * Fetches cart for a user from Mongo
 * If cart doesn't exist, throw ApiError
 * --- status code  - 404 NOT FOUND
 * --- message - "User does not have a cart"
 *
 * @param {User} user
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const getCartByUser = async (user) => {
  let cart = await Cart.findOne({"email":user.email});
  if(cart)
   return cart;
  else
   throw new ApiError(httpStatus.NOT_FOUND, "User does not have a cart");
};

/**
 * Adds a new product to cart
 * - Get user's cart object using "Cart" model's findOne() method
 * --- If it doesn't exist, create one
 * --- If cart creation fails, throw ApiError with "500 Internal Server Error" status code
 * - If product to add already in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product already in cart. Use the cart sidebar to update or remove product from cart"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - Otherwise, add product to user's cart
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>}
 * @throws {ApiError}
 */
const addProductToCart = async (user, productId, quantity) => {
  const cart = await Cart.findOne({"email":user.email});
  const product = await Product.findOne({"_id": productId});
  if(!product){
   throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }
  if(!cart){
    var newCart = await Cart.create({
      "email" : user.email,
      "cartItems" : 
        [
        {"product": product},
        {"quantity": quantity}
       ]
      ,
    });
    if(!newCart){
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Cart could not be created.");
    }
    return newCart;
   }

  var productExists = cart["cartItems"].find(function(item, index) {
    if(item.product._id.toString() === productId);
      return true;
    });
  
  if(productExists){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product already in cart. Use the cart sidebar to update or remove product from cart");
  }
  else{
  cart.cartItems.push({
    "product": product,
    "quantity": quantity
  });
  await cart.save();
  return cart;
  }
};

/**
 * Updates the quantity of an already existing product in cart
 * - Get user's cart object using "Cart" model's findOne() method
 * - If cart doesn't exist, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart. Use POST to create cart and add a product"
 *
 * - If product to add not in "products" collection in MongoDB, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product doesn't exist in database"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * - Otherwise, update the product's quantity in user's cart to the new quantity provided
 *
 * @param {User} user
 * @param {string} productId
 * @param {number} quantity
 * @returns {Promise<Cart>
 * @throws {ApiError}
 */
const updateProductInCart = async (user, productId, quantity) => {
  const cart = await getCartByUser(user);
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart. Use POST to create cart and add a product");
  }
  else{
   const product = await Product.findById(productId);
   if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }

  var productToUpdate = cart["cartItems"].find(function(item, index) {
    if(item.product._id === productId);
      return true;
    });

  if(!productToUpdate){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  productToUpdate.quantity = quantity; 
  await cart.save();
  return cart;
}
};

/**
 * Deletes an already existing product in cart
 * - If cart doesn't exist for user, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "User does not have a cart"
 *
 * - If product to update not in user's cart, throw ApiError with
 * --- status code  - 400 BAD REQUEST
 * --- message - "Product not in cart"
 *
 * Otherwise, remove the product from user's cart
 *
 * @param {User} user
 * @param {string} productId
 * @throws {ApiError}
 */
const deleteProductFromCart = async (user, productId) => {
  const cart = await getCartByUser(user);
  if(!cart){
    throw new ApiError(httpStatus.BAD_REQUEST, "User does not have a cart");
  }

  else{
  const product = Product.findOne({"_id": productId});
   if(!product){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product doesn't exist in database");
  }
  let productToUpdate = cart["cartItems"].find(function(item, index) {
    if(item.product._id === productId);
      return true;
    });

  if(!productToUpdate){
    throw new ApiError(httpStatus.BAD_REQUEST, "Product not in cart");
  }

  productToUpdate.remove();
  await cart.save();
 }
};


module.exports = {
  getCartByUser,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
};
