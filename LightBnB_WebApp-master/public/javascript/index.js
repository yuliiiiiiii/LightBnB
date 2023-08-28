// starts up the application by rendering the listings

$(() => {
  getAllListings().then(function( json ) {
    propertyListings.addProperties(json.properties);
    views_manager.show('listings');
  });
});