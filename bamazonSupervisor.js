var mysql = require("mysql");
var inquirer = require('inquirer');
var departments = [];

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "para55shut",
    database: "bamazon_db"

});


connection.connect(function (err) {
    if (err) throw err;
    clearScreen()


    console.log("\033[32m", "Welcome to Bamazon Supervisor", "\x1b[0m\n");
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {
            if (departments.includes(res[i].department_name) === false) {
                departments.push(res[i].department_name)
            }
        }


    });

    stockSupervision();

});

//////////////////////////////////////////////////////////////
var SupervisorMenuItems = {
    "View Product Sales by Department": viewDepartmentSales,
    "Create New Department": addDepartment,
    "Exit": exitProgram
};
////////////////////////////////////////////////////////////
function stockSupervision() {
    inquirer.prompt([{
        "type": "list",
        "name": "menuItem",
        "message": "Select below options to supervise your store:",
        "choices": Object.keys(SupervisorMenuItems)
    }
    ]).then(function (answers) {

        SupervisorMenuItems[answers.menuItem]();
    })

};
///////////////////////////////////////////////////////////
function viewDepartmentSales() {

    clearScreen();

    console.log("--- View Product Sales by Department ---\n");

    var sql_command =
        `SELECT d.department_id, d.department_name, d.overhead_costs,
            COALESCE(SUM(p.product_sales), 0) AS product_sales,
            COALESCE(SUM(p.product_sales), 0) - overhead_costs AS total_profit
     FROM departments AS d
     LEFT JOIN products AS p
     ON d.department_id = p.department_id
     GROUP BY d.department_id
     ORDER BY d.department_name;`;

    connection.query(sql_command, function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {

            console.log(`${res[i].department_id} | ${res[i].department_name} | ${res[i].overhead_costs} | ${res[i].product_sales} | ${res[i].total_profit}`);
            if (departments.includes(res[i].department_name) === false) {
                departments.push(res[i].department_name)
            }

        }
        console.log("-----------------------------------");
        stockSupervision();
    });
};

////////////////////////////////////////////////////////
function addDepartment() {

    var inquirer = require('inquirer');
    inquirer.prompt([
        {
            type: "input",
            name: "departmentName",
            message: "Enter the department name:",
            validate: validateName

        },
        {
            type: "input",
            name: "overheadCosts",
            message: "Enter the overhead costs:",
            validate: validateID
        },

        {
            name: "anotherNewDepartment",
            type: "input",
            message: "Add another department: (y / n)? "
        },

    ]).then(function (addNewDepartment) {
        var anotherDepartment = addNewDepartment.anotherNewDepartment;
        var query = connection.query(
            "INSERT INTO departments SET ?",
            {
                department_name: addNewDepartment.departmentName,
                overhead_costs: addNewDepartment.overheadCosts

            },

            function (err, res) {
                console.log(" " + addNewDepartment.departmentName + "\033[32m", "has been added to departments!", "\x1b[0m\n");
                console.log("\n----------------------------------------------------------------\n");

                if (anotherDepartment === "y") {
                    addDepartment();
                } else {
                    stockSupervision();
                }
            }
        );

    });
};
///////////////////////////////////////////////////////
function exitProgram() {
    clearScreen();
    console.log("Bye Bye!");
    connection.end();
};


///////////////////////////////////////////////
function clearScreen() {
    process.stdout.write("\033c");
};

function validateID(id) {
    var id_num = parseFloat(id);
    return (id !== "" && !isNaN(id) && id_num > 0);
};

function validateName(id) {
    var id_num = id;
    return (id !== "");
};
