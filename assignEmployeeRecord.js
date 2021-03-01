// Grab all employees that are working today from the "Today's Shifts" view of the Shifts table.
const shiftsTable = base.getTable("Shifts");
const todaysShiftsView = shiftsTable.getView("Today's Shifts");
const todaysShiftsQuery = await todaysShiftsView.selectRecordsAsync({ fields: ["Shift", "Name", "Employee Record"] });

// Get a list of employee names (and record IDs!) for everyone working today.
let todaysShiftsRecords = todaysShiftsQuery.records.map(record => {
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

// console.log(todaysShiftsRecords);

// Now we use the employee record ID as the value for the "Employee Record" field in the "Today's Shifts" view.
todaysShiftsRecords.forEach(record => {
    const hasEmployeeRecord = todaysShiftsQuery.getRecord(record.shiftID).getCellValueAsString("Employee Record") !== "";

    if (hasEmployeeRecord) {
        // console.log(`Skipping ${record.name}`)
        return; // If the shift already has an employee record assigned, skip it!
    } else {
        // console.log(`Updating record: ${record.name}`)
        try {
            shiftsTable.updateRecordAsync(record.shiftID, { "Employee Record": [{ id: record.employeeID }] });
        } catch (error) {
            console.error(error); // We console log this for now, but eventually we will log this error by adding a record to a new table.
        }
    }
});
