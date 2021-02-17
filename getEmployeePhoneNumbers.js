// Grab all employees that are working today from the "Today's Shifts" view of the Shifts table.
const shiftsTable = base.getTable("Shifts");
const shiftsTodayView = shiftsTable.getView("Today's Shifts");
const shiftsTodayQuery = await shiftsTodayView.selectRecordsAsync({ fields: ["Event", "Employee"] });

// Get a list of employee names for everyone that is working today
const shiftsTodayRecords = shiftsTodayQuery.records.map(record => shiftsTodayQuery.getRecord(record.id).getCellValue("Employee"));

// Grab all employees from the "Employees" table.
const employeesTable = base.getTable("Employees");
const allEmployeesView = employeesTable.getView("All employees");
const allEmployeesQuery = await allEmployeesView.selectRecordsAsync({ fields: ["Name", "Phone"] });

// Get all employee records, then filter the results so we only have employee records for people working today!
const scheduledEmployeeRecords = allEmployeesQuery.records.filter(record => shiftsTodayRecords.includes(record.name));
const missingPhoneNumbers = [];

// console.log("working employees", scheduledEmployeeRecords)

const scheduledEmployeePhoneNumbers = scheduledEmployeeRecords.map(record => {
    const employeeRecord = allEmployeesQuery.getRecord(record.id);
    const phoneNumber = employeeRecord.getCellValue("Phone");

    if (!phoneNumber) missingPhoneNumbers.push(employeeRecord.name);

    return phoneNumber;
});

console.log(scheduledEmployeePhoneNumbers);
console.log(missingPhoneNumbers);

// Filter the list for employees missing phone numbers.
const filteredEmployeePhoneNumbers = scheduledEmployeePhoneNumbers.filter(Boolean);

console.log(filteredEmployeePhoneNumbers);

 
// Now we create our output variables
// We create one with all phone numbers of everyone working today.

output.set("Employee Phone Numbers", filteredEmployeePhoneNumbers);

// And a separate variable to let managers know if any employees are missing phone numbers.
output.set("Missing phone numbers", missingPhoneNumbers);
