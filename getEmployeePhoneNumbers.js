/*
======================================================================
NAME:			getEmployeePhoneNumbers.js
PURPOSE:		After employee records are assigned to shifts, we need to grab all of their phone numbers
                and create a new record so that whoever is doing lunch ordering has easy access to
                employee phone numbers for everyone working today.

NOTE:			This script logs errors to the Errors table.
======================================================================
*/

const errorsTable = base.getTable("Errors"); // Grab errors table for error logging.

const shiftsTable = base.getTable("Shifts");
const todaysShiftsView = shiftsTable.getView("Today's Shifts");
const todaysShiftsQuery = await todaysShiftsView.selectRecordsAsync({ fields: ["Shift", "Employee Record", "Cellphone"] });
let missingEmployees = [];

const employeeInfo = todaysShiftsQuery.records.map(record => {
    const cellphone = todaysShiftsQuery.getRecord(record.id).getCellValueAsString("Cellphone");
    const employeeRecord = todaysShiftsQuery.getRecord(record.id).getCellValue("Employee Record");

    if (!employeeRecord || !cellphone) {
        // If we're here, this means that an employee is missing from the employee database.

        // generatedName grabs an employee's name from the "Shift" field in the in the "Today's Shifts" view.
        const generatedName = record.name.split("-")[0].trim() || "";
        const nameRegex = new RegExp(/^[a-zA-Z\s]*$/);
        const validName = generatedName && generatedName.split(" ").length === 2 && nameRegex.test(generatedName);
        const missingEmployeeName = validName ? generatedName : record.name;

        missingEmployees.push(missingEmployeeName);

        return {
            name: missingEmployeeName,
            id: null,
            cellphone: null
        }
    } else {
        return {
            name: employeeRecord[0].name,
            id: employeeRecord[0].id,
            cellphone
        }
    }
});

const employeePhoneNumbers = employeeInfo.filter(record => record.cellphone).map(record => record.cellphone).join(",");
const missingPhoneNumbers = employeeInfo.filter(record => record.id && !record.cellphone).map(record => {
    if (record.id) {
        return { id: record.id };
    }
});

console.log("Phone numbers", employeePhoneNumbers)
console.log("Missing phone numbers", missingPhoneNumbers)
console.log("Employees missing from the employee database:", missingEmployees.join(", "));

if (employeePhoneNumbers.length) {
    const phoneNumbersTable = base.getTable("Phone numbers");
    await phoneNumbersTable.createRecordAsync({ "All Phone Numbers": employeePhoneNumbers, "Missing Phone Numbers": missingPhoneNumbers, "Missing Employee Info": missingEmployees.join(" ,") })
} else {
    errorsTable.createRecordAsync({ "Script Name": "getEmployeePhoneNumbers", Message: "No employee phone numbers found." });
}
