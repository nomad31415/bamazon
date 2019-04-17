var mysql = require("mysql");
var inquirer = require('inquirer');

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
    console.log("\033[32m", "Welcome to Bamazon Customer", "\x1b[0m\n");
    showProducts();

});

///////////////////////////////////////////////////////////////
function showProducts() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;

        for (var i = 0; i < res.length; i++) {

            console.log(`${res[i].item_id} | ${res[i].product_name} | ${res[i].department_id}| ${res[i].department_name} | ${res[i].price} | ${res[i].stock_quantity} | ${res[i].product_sales}`);

        }
        console.log("-----------------------------------");
        askProduct();
    });


};

/////////////////////////////////////////////

function askProduct() {
    inquirer.prompt([

        {
            name: "productID",
            type: "input",
            message: "Enter Product ID : ",
            validate: validateID
        },
        {
            name: "productQuantity",
            type: "inpsut",
            message: "How Many You Need? ",
            validate: validateID
        },
        {
            name: "anotherItem",
            type: "input",
            message: "Buy more (y / n)? "
        },
    ]).then(function (productAnswer) {
        var itemID_selected = parseInt(productAnswer.productID);
        var itemQuantity_selected = parseInt(productAnswer.productQuantity);
        var another_item = productAnswer.anotherItem.toLowerCase();

        connection.query("SELECT * FROM products WHERE item_id=?", [itemID_selected], function (err, res) {
            if (err) throw err;
            if (itemQuantity_selected > res[0].stock_quantity) {
                var itemName_selected = res[0].product_name;
                console.log("\n----------------------------------------------------------------\n");
                console.log("\033[31m", "Sorry!!!, Your number of request is not available now!!", "\x1b[0m\n");
                console.log("\033[31m", "we have only", "\x1b[0m" + res[0].stock_quantity + "\033[31m", "nos in our stock now!", "\x1b[0m\n");
                console.log("\n----------------------------------------------------------------\n");
                if (another_item === "y") {
                    showProducts();
                } else {
                    connection.end()
                }
            }
            else {
                var newItemQuantity = (res[0].stock_quantity) - (itemQuantity_selected);
                var itemName_selected = res[0].product_name;
                var subTotal = (itemQuantity_selected * res[0].price).toFixed(2);
                var productSales = res[0].product_sales + subTotal;
                console.log("\n----------------------------\n");
                console.log("\033[32m", "Your Order has Successfully Placed.", "\x1b[0m\n");
                console.log("\033[32m", "You bought ", "\x1b[0m" + itemQuantity_selected + " " + itemName_selected);
                console.log("\033[32m", "Subtotal: ", "\x1b[0m" + subTotal + "$");
                console.log("\033[32m", "Thanks for your Shopping!", "\x1b[0m\n");
                console.log("\n----------------------------\n");
                var query = connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newItemQuantity,
                            product_sales: productSales
                        },
                        {
                            item_id: itemID_selected
                        }
                    ],
                    function (err, res) {
                    }
                );
                if (another_item === "y") {
                    showProducts();
                } else {
                    connection.end()
                }
            }
        });

    })



}

function clearScreen() {
    process.stdout.write("\033c");
}

function validateID(id) {
    var id_num = parseFloat(id);
    return (id !== "" && !isNaN(id) && id_num > 0);
};

function validateName(id) {
    var id_num = id;
    return (id !== "");
};
