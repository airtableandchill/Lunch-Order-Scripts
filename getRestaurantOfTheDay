// Grab the restaurant of the day from the "Restaurant of the Day view" in the Restaurant of the Day table.

const rotdTable = base.getTable("Restaurant Of The Day");
const rotdView = rotdTable.getView("Restaurant of the Day");
const rotdQuery = await rotdView.selectRecordsAsync({ fields: ["Manager", "Restaurant Pick"] });
const rotdRecord = rotdQuery.getRecord(rotdQuery.recordIds[0]); // Pick the first record from this view.

// Create an object to hold the manager's name, restaurant name, and id of the restaurant.

let restaurantOfTheDay = {
    manager: rotdRecord.getCellValueAsString("Manager") || "",
    name: rotdRecord.getCellValueAsString("Restaurant Pick") || "",
    id: rotdRecord.getCellValue("Restaurant Pick")[0].id || null
};

// Now we'll use the restaurant's id to look up its information.

const restaurantsTable = base.getTable("Restaurants");
const restaurantsQuery = await restaurantsTable.selectRecordsAsync({ fields: ["Name", "Phone", "Website Link"] });
const restaurantRecord = restaurantsQuery.getRecord(restaurantOfTheDay.id);

// After we've found the record, add the phone number & website link to our restaurantOfTheDay object!

restaurantOfTheDay.phone = restaurantRecord.getCellValueAsString("Phone") || null;
restaurantOfTheDay.website = restaurantRecord.getCellValueAsString("Website Link") || "";

// Create output variables to use later when we text/e-mail employees with the restaurant of the day.

output.set("manager", restaurantOfTheDay.manager);
output.set("restaurantName", restaurantOfTheDay.name);
output.set("phone", restaurantOfTheDay.phone);
output.set("website", restaurantOfTheDay.website);
