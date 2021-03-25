const errorsTable = base.getTable("Errors"); // Grab errors table for error logging.

// Grab all employees that are working today from the "Today's Shifts" view of the Shifts table.
const shiftsTable = base.getTable("Shifts");
const todaysShiftsView = shiftsTable.getView("Today's Shifts");
const todaysShiftsQuery = await todaysShiftsView.selectRecordsAsync({ fields: ["Shift", "Name", "Employee Record"] });

function getEmployeeRecords() {
    // Get a list of employee names (and record IDs!) for everyone working today.
    return todaysShiftsQuery.records.map(record => {
        const shiftID = record.id || null;

        // generatedName grabs an employee's name from the "Shift" field in the in the "Today's Shifts" view.
        const generatedName = record.name.split("-")[0].trim() || "";
        const nameRegex = new RegExp(/^[a-zA-Z\s]*$/);
        const validName = generatedName && generatedName.split(" ").length === 2 && nameRegex.test(generatedName);

        if (validName) {
            return { name: generatedName, shiftID, employeeID: undefined };
        } else {
            // If the generatedName isn't valid, we'll just grab the employee's name from their record instead.
            const employeeName = todaysShiftsQuery.getRecord(record.id).getCellValueAsString("Name");
            return { name: employeeName, shiftID, employeeID: undefined };
        }
    });
}

let todaysShiftsRecords = getEmployeeRecords();

const employeesTable = base.getTable("Employees");
const allEmployeesView = employeesTable.getView("All employees");
const allEmployeesQuery = await allEmployeesView.selectRecordsAsync({ fields: ["Name"] });
const allEmployeeRecords = allEmployeesQuery.records;

// For each employee working today, find their employee record ID.
todaysShiftsRecords.map(shiftRecord => {
    const employeeRecord = allEmployeeRecords.find(employeeRecord => employeeRecord.name === shiftRecord.name);

    if (employeeRecord) {
        shiftRecord.employeeID = employeeRecord.id;
    }
});

console.log("Employee Records", todaysShiftsRecords);
console.log(`Total employee records: ${todaysShiftsRecords.length}`);

if (todaysShiftsRecords.length) {

    // Now we use the employee record ID as the value for the "Employee Record" field in the "Today's Shifts" view.
    todaysShiftsRecords.forEach(record => {
        let hasEmployeeRecord = true;

        try {
            hasEmployeeRecord = todaysShiftsQuery.getRecord(record.shiftID).getCellValueAsString("Employee Record") !== "";
        } catch (error) {
            errorsTable.createRecordAsync({ "Script Name": "assignEmployeeRecords", Message: error.message, Type: error.name, Stack: error.stack });
        };

        if (hasEmployeeRecord) {
            return; // If the shift already has an employee record assigned, skip it!
        } else {
            // console.log(`Updating record: ${record.name}`)
            if (typeof record.employeeID === 'string') {
                try {
                    shiftsTable.updateRecordAsync(record.shiftID, { "Employee Record": [{ id: record.employeeID }] });
                } catch (error) {
                    errorsTable.createRecordAsync({ "Script Name": "assignEmployeeRecords", Message: error.message, Type: error.name, Stack: error.stack });
                }
            } else {
                errorsTable.createRecordAsync({ "Script Name": "assignEmployeeRecords", Message: `${record.name} does not exist in the Employee Database`, Type: "New or missing employee" });
            }
        }
    });
} else {
    errorsTable.createRecordAsync({ "Script Name": "assignEmployeeRecords", Message: "No employees found." });
}
