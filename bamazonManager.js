var inquirer = require('inquirer');
var mysql = require("mysql");
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

    console.log("\033[32m", "Welcome to Bamazon Manager.", "\x1b[0m\n");
  
    var sql_command = "SELECT * FROM products";

    connection.query(sql_command, function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {

            if (departments.includes(res[i].department_name) === false) {
                departments.push(res[i].department_name)
            }
        }
    });

    stockManagement();

});

//////////////////////////////////////////////////////////////
function stockManagement() {
    inquirer.prompt([{
        type: 'list',
        name: 'optionSelect',
        message: 'Which Option You Need?',
        choices: ['View Products for Sale',
            'View Low Inventory',
            'Add to Inventory',
            'Add New Product',
            'Exit']
    }
    ]).then(function (answers) {

        if (answers.optionSelect === "View Products for Sale") {
            showProducts();

        }

        if (answers.optionSelect === "View Low Inventory") {
            lowInventory();
        }
        if (answers.optionSelect === "Add to Inventory") {
            updateInventory();
        }
        if (answers.optionSelect === "Add New Product") {
            addNewProd();
        }

        if (answers.optionSelect === "Exit") {
            console.log("Bye Bye")
            connection.end();

        }
    })

}


///////////////////////////////////////////////////////////////
function showProducts() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {

            console.log(`${res[i].item_id} | ${res[i].product_name} | ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity}`);
            if (departments.includes(res[i].department_name) === false) {
                departments.push(res[i].department_name)
            }

        }

        console.log("-----------------------------------");
        stockManagement();
    });


};

/////////////////////////////////////////////
function lowInventory() {

    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        var low_Inv = [];
        for (var i = 0; i < res.length; i++) {
            if (res[i].stock_quantity < 6) {
                low_Inv.push(res[i].stock_quantity)
                console.log(`${res[i].item_id} | ${res[i].product_name} | ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity}`);
            }

        }
        if (!low_Inv.length) {

            console.log("\033[35m", "No Item Below Inventory Criteria, [Criteria = ITEM QUANTIRY < 5]", "\x1b[0m\n")
        }

        console.log("-----------------------------------");
        stockManagement();
    });

};

/////////////////////////////////////////////
function updateInventory() {
    var inquirer = require('inquirer');
    inquirer.prompt([

        {
            name: "productIdUpdate",
            type: "input",
            message: "Enter Product ID : ",
            validate: validateID
        },
        {
            name: "productQuantityUpdate",
            type: "input",
            message: "How Many to Add? ",
            validate: validateID
        },
        {
            name: "anotherItemUpdate",
            type: "input",
            message: "Add more (y / n)? "
        }
    ]).then(function (productUpdate) {
        var itemID_update = parseInt(productUpdate.productIdUpdate);
        var itemQuantity_update = parseInt(productUpdate.productQuantityUpdate);
        var another_update = productUpdate.anotherItemUpdate.toLowerCase();


        connection.query("SELECT * FROM products WHERE item_id=?", [itemID_update], function (err, res) {
            if (err) throw err;

            var newItemQuantity = (res[0].stock_quantity) + (itemQuantity_update);
            var itemName_updated = res[0].product_name;
            var query = connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: newItemQuantity
                    },
                    {
                        item_id: itemID_update
                    }
                ],
                function (err, res) {
                }
            );

            console.log("\n----------------------------------------------------------------\n");
            console.log(itemName_updated + "\033[32m", " quantity updated to ", "\x1b[0m" + newItemQuantity + "\033[32m", "nos in our stock now!", "\x1b[0m\n");
            console.log("\n----------------------------------------------------------------\n");

            if (another_update === "y") {
                updateInventory();
            } else {
                showProducts();
            }

        });

    })
}
////////////////////////////////////////////////////////
function addNewProd() {

    var inquirer = require('inquirer');
    inquirer.prompt([
        {
            type: "list",
            name: "departmentName",
            message: "Select the department name:",
            choices: departments

        },
        {
            name: "newProdName",
            type: "input",
            message: "Enter New Item Name : ",
            validate: validateName
        },

        {
            name: "newProdPrice",
            type: "input",
            message: "Enter New Product Price : ",
            validate: validateID
        },
        {
            name: "newProdQuant",
            type: "input",
            message: "Enter New Product Quantity : ",
            validate: validateID

        },
        {
            name: "anotherNewItem",
            type: "input",
            message: "Add more (y / n)? "
        },

    ]).then(function (addNewProduction) {
        //add item
        var another_new = addNewProduction.anotherNewItem.toLowerCase();
        var departmentNameSelected = addNewProduction.departmentName;

        var query = connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: addNewProduction.newProdName,
                department_name: departmentNameSelected,
                price: addNewProduction.newProdPrice,
                stock_quantity: addNewProduction.newProdQuant

            },
            function (err, res) {
                console.log("\n----------------------------------------------------------------\n");

                if (another_new === "y") {
                    addNewProd();
                } else {
                    showProducts();
                }
            }
        );
    });
}

////////////////////////////////////////////////////

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

