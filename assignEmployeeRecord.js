// Grab all employees that are working today from the "Today's Shifts" view of the Shifts table.
const shiftsTable = base.getTable("Shifts");
const todaysShiftsView = shiftsTable.getView("Today's Shifts");
const todaysShiftsQuery = await todaysShiftsView.selectRecordsAsync({ fields: ["Shift", "Name"] });

// Get a list of employee names (and record IDs!) for everyone working today.
let todaysShiftsRecords = todaysShiftsQuery.records.map(record => {
    const shiftId = record.id || null;

    /*
    WARNING: This is flimsy code!
    If the "Date of Shift" field in the "Shifts by Date" view for the "Schedule Changes" table of the Attendance Beta is modified in any way, this line below will fail and subsequent steps won't work.
    Alternatively, we can uncomment the name2 variable to literally grab employee names from the "Name field".
    */

    const name = record.name.split("-")[0].trim() || "";
    // const name2 = shiftsTodayQuery.getRecord(record.id).getCellValue("Name");
    return { name, shiftId, employeeID: undefined }
});

const employeesTable = base.getTable("Employees");
const allEmployeesView = employeesTable.getView("All employees");
const allEmployeesQuery = await allEmployeesView.selectRecordsAsync({ fields: ["Name"] });
const allEmployeeRecords = allEmployeesQuery.records;

todaysShiftsRecords.map(shiftRecord => {
    const employeeRecord = allEmployeeRecords.find(employeeRecord => employeeRecord.name === shiftRecord.name);

    if (employeeRecord) {
        shiftRecord.employeeID = employeeRecord.id;
    }
});

// Now we'll update 

todaysShiftsRecords.forEach(record => {
    shiftsTable.updateRecordAsync(record.shiftId, {"Employee Record": [{id: record.employeeID}]});
});
