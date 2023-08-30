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
  // When getAllProperties is called, the options object can potentially contain the following properties:
  // {
//   city,
//   owner_id,
//   minimum_price_per_night,
//   maximum_price_per_night,
//   minimum_rating;
// }

  //1. Setup an array to hold any parameters that may be available for the query.
  let queryParams = [];
  
  // 2. Start the query with all information that comes before the WHERE clause.
  let queryString = `
  SELECT properties.*, avg(rating) AS average_rating 
    FROM properties 
    JOIN property_reviews ON properties.id = property_id
    WHERE 1 = 1
  `;

  // 3. Check if a city has been passed in as an option
  if (options.city) {
    // 4. Add the city to the params array and create a WHERE clause for the city.
    queryParams.push(`%${options.city}%`)

    //5. We can use the length of the array to dynamically get the $n placeholder number. Since this is the first parameter, it will be $1.
    // The % syntax for the LIKE clause must be part of the parameter, not the query.
    queryString += `AND city LIKE $${queryParams.length} `;
  }

 if (options.owner_id) {
  queryParams.push(options.owner_id);
  queryString += `AND owner_id = $${queryParams.length}`;
 }

 if (options.minimum_price_per_night && options.maximum_price_per_night) {
  const minimum_price = options.minimum_price_per_night * 100;
  const maximum_price = options.maximum_price_per_night * 100;

  queryParams.push(minimum_price, maximum_price);
  queryString += `AND cost_per_night BETWEEN $${queryParams.length -1} AND $${queryParams.length}`;
 }

  queryString += `GROUP BY properties.id\n`;

 if (options.minimum_rating) {
  queryParams.push(Number(options.minimum_rating));
  queryString += `HAVING avg(rating) >= $${queryParams.length}`
 }

  //6. Add any query that comes after the WHERE clause.
  queryParams.push(limit);
  queryString += `
  ORDER BY cost_per_night
  LIMIT $${queryParams.length};
  `;
  
  //7. Console log everything just to make sure we've done it right.
  console.log(queryString, queryParams);

  //8. Run the query.
  return pool
  .query(queryString, queryParams)
  .then(res => {
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
