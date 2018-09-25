var mysql = require("mysql");
var inquirer = require("inquirer");
var columnify = require('columnify');

// Connection to the DB
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    start();
});

// Initial menu items
function start() {
    inquirer
        .prompt([
            {
                type: "list",
                message: "Which information do you want?",
                choices: [
                    "View Products for Sale",
                    "View Low Inventory",
                    "Add to Inventory",
                    "Add New Product",
                    "Add item to Department",
                    "Exit"
                ],
                name: "option"
            }
        ])
        .then(function (inquirerResponse) {
            if (inquirerResponse.option) {
                caseWhich(inquirerResponse.option);
            }
        });
}

// View products for sale
function viewProducts() {
    connection.query("SELECT * FROM products LEFT JOIN departments ON products.department_id = departments.department_id ORDER BY item_id", function (err, results) {
        if (err) throw err;
        var columnData = '';
        var columnArray = [];
        for (var i = 0; i < results.length; i++) {
            columnData = {
                item: results[i].item_id,
                product: results[i].product_name,
                price: "$" + (results[i].price).toFixed(2),
                quantity: (results[i].stock_quantity),
                department: (results[i].department_name)
            }
            columnArray.push(columnData);
        }
        console.log(columnify(columnArray));
        start();
    });
}

// view low inventory
function viewLowInv() {
    connection.query("SELECT * FROM products WHERE stock_quantity < 7", function (err, results) {
        if (err) throw err;
        var columnData = '';
        var columnArray = [];
        for (var i = 0; i < results.length; i++) {
            columnData = {
                item: results[i].item_id,
                product: results[i].product_name,
                price: "$" + (results[i].price).toFixed(2),
                quantity: (results[i].stock_quantity)
            }
            columnArray.push(columnData);
        }
        console.log(columnify(columnArray));
        start();
    });
}

// add to inventory
function addInv() {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // Select item to purchase
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(
                                "Item: " +
                                results[i].item_id +
                                " || Prouct: " +
                                results[i].product_name +
                                " || Price: $" +
                                (results[i].price).toFixed(2) +
                                " || Quantity: " +
                                (results[i].stock_quantity)
                            );
                        }
                        return choiceArray;
                    },
                    message: "What item# would you like to Add to?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to Add?"
                }
            ])
            .then(function (answer) {
                var chosenItem;
                for (var i = 0; i < results.length; i++) {
                    var answerChoice = answer.choice.split(" ");
                    if (parseInt(results[i].item_id) === parseInt(answerChoice[1])) {
                        chosenItem = results[i];
                    }
                }

                connection.query(
                    "UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: parseInt(chosenItem.stock_quantity) + parseInt(answer.quantity)
                        },
                        {
                            item_id: chosenItem.item_id
                        }
                    ],
                    function (error) {
                        if (error) throw err;
                        // Successful prchase
                        console.log("\nQuantity added successfully!");
                        start();
                    }
                );
            });
    });
}


// add new product
function addNewProd() {
    // prompt for info about the item being put up for auction
    inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "What product you would like to add?"
            },
            {
                name: "price",
                type: "input",
                message: "What is the price?"
            },
            {
                name: "quantity",
                type: "input",
                message: "How many are there?",
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.product,
                    price: answer.price,
                    stock_quantity: answer.quantity
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your product was added successfully!\n");
                    // re-prompt the user for if they want to bid or post
                    chooseDepartment();
                }
            );
        });
}

function addItemToDepartment(department) {
    connection.query("SELECT * FROM products", function (err, results) {
        if (err) throw err;
        // Select item to purchase
        inquirer
            .prompt([
                {
                    name: "product",
                    type: "checkbox",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(
                                "Item: " +
                                results[i].item_id +
                                " || Prouct: " +
                                results[i].product_name
                            );
                        }
                        return choiceArray;
                    },
                    message: "Choose items to put in this department."
                }
            ])
            .then(function (answer) {
                for (var i = 0; i < answer.product.length; i++) {
                    product = answer.product[i].split(" ");
                    connection.query(
                        "UPDATE products SET ? WHERE ?",
                        [
                            {
                                department_id: department
                            },
                            {
                                item_id: product[1]
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                        });
                }
                console.log("\nProducts updated successfully!\n");
                start();
            });
    });
}

function chooseDepartment() {
    connection.query("SELECT * FROM departments", function (err, results) {
        if (err) throw err;
        // Select item to purchase
        inquirer
            .prompt([
                {
                    name: "choice",
                    type: "list",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(
                                "ID: " +
                                results[i].department_id +
                                " || Department: " +
                                results[i].department_name
                            );
                        }
                        return choiceArray;
                    },
                    message: "Which Department do you want to Add to?"
                },
            ])
            .then(function (answer) {
                department = answer.choice.split(" ");
                console.log(department[1]);
                addItemToDepartment(department[1]);
            });
    });
}

// case choice function
function caseWhich(option) {
    switch (option) {
        case "View Products for Sale":
            viewProducts();
            break;
        case "View Low Inventory":
            viewLowInv();
            break;
        case "Add to Inventory":
            addInv();
            break;
        case "Add New Product":
            addNewProd();
            break;
        case "Add item to Department":
            chooseDepartment();
            break;
        case "Exit":
            connection.end();
            break;
    }
}
