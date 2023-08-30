// write all queries to the database here

const properties = require("./json/properties.json");
const users = require("./json/users.json");
const bcrypt = require("bcrypt");
const { Pool } = require('pg');

const pool = new Pool ({
  user: 'ouyuritsu',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});
/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
  .query(`SELECT * FROM users WHERE email = $1`, [email])
  .then(res => {
    return res.rows[0];
    // res.rows returns an array!, need to return the object inside of the array
  })
  .catch(error =>{
    console.log(error.message)
  })
};

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
  .query(`SELECT * FROM users WHERE users.id = ${id};`)
  .then(res => {
    return res.rows[0];
  })
  .catch(error =>{
    console.log(error.message)
  })
};

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  // const userId = Object.keys(users).length + 1;
  // user.id = userId;
  // users[userId] = user;
  // return Promise.resolve(user);

  //Accepts a user object that will have a name, email, and password property
  return pool
  .query(`INSERT INTO users(name, email, password)
  VALUES('${user.name}', '${user.email}', '${user.password}') RETURNING *;`)
  .then (res => {
    return res.rows;
  })
  .catch (error => {
    console.log(error.message);
  });
};

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
  .query(`
  SELECT title, number_of_bedrooms, number_of_bathrooms, parking_spaces, thumbnail_photo_url, start_date, end_date, avg(rating) as average_rating, cost_per_night
  FROM reservations
  JOIN properties ON properties.id = reservations.property_id
  JOIN property_reviews ON properties.id = property_reviews.property_id
  WHERE reservations.guest_id = ${guest_id}
  GROUP BY properties.id, reservations.id
  ORDER BY start_date
  LIMIT $1;
  `, [limit])
  .then (res => {
    return res.rows;
    //returns an array of all the reservations from the same user
  })
  .catch (error => {
    console.log(error.message);
  });
};

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  console.log(limit);
  // const limitedProperties = {};
  // for (let i = 1; i <= limit; i++) {
  //   limitedProperties[i] = properties[i];
  // }
  // return Promise.resolve(limitedProperties);
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then(res => {
      // console.log(res.rows);
       return res.rows;
    })
    .catch(err => {
       console.log(err.message);
    });
};

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};

module.exports = {
  getUserWithEmail,
  getUserWithId,
  addUser,
  getAllReservations,
  getAllProperties,
  addProperty,
};
