const shiftsTable = base.getTable("Shifts");
const todaysShiftsView = shiftsTable.getView("Today's Shifts");
const todaysShiftsQuery = await todaysShiftsView.selectRecordsAsync({ fields: ["Shift", "Employee Record", "Cellphone"] });

const employeeInfo = todaysShiftsQuery.records.map(record => {
    const cellphone = todaysShiftsQuery.getRecord(record.id).getCellValueAsString("Cellphone");
    const employeeRecord = todaysShiftsQuery.getRecord(record.id).getCellValue("Employee Record");

    return {
        name: employeeRecord[0].name || "",
        id: employeeRecord[0].id || null,
        cellphone
    }
});

// console.log(employeeInfo);

const employeePhoneNumbers = employeeInfo.filter(record => record.cellphone).map(record => record.cellphone).join(",");
const missingPhoneNumbers = employeeInfo.filter(record => !record.cellphone).map(record => {
    return { id: record.id };
});

console.log(employeePhoneNumbers, missingPhoneNumbers)

const phoneNumbersTable = base.getTable("Phone numbers");
await phoneNumbersTable.createRecordAsync({"All Phone Numbers": employeePhoneNumbers, "Missing Phone Numbers": missingPhoneNumbers})
