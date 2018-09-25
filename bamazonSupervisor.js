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
                    "View Product Sales by Department",
                    "Create New Department",
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

// View Product Sales by Department
function viewSales() {
    connection.query("SELECT departments.department_id, department_name, over_head_costs, SUM(product_sales) AS productsales, (SUM(product_sales) - over_head_costs) AS total_profit FROM departments INNER JOIN products ON departments.department_id = products.department_id GROUP BY departments.department_id", function (err, results) {
        if (err) throw err;
        var columnData = '';
        var columnArray = [];
        for (var i = 0; i < results.length; i++) {
            columnData = {
                id: results[i].department_id,
                department: results[i].department_name,
                costs: results[i].over_head_costs,
                sales: results[i].productsales,
                profit: results[i].total_profit
            }
            columnArray.push(columnData);
        }
        console.log(columnify(columnArray));
        start();
    });
}

// Create New Department
function createDepartment() {
    // prompt for info about the item being put up for auction
    inquirer
        .prompt([
            {
                name: "department",
                type: "input",
                message: "What is the New Department?"
            },
            {
                name: "overHeadCosts",
                type: "input",
                message: "What are the Over Head Costs?"
            }
        ])
        .then(function (answer) {
            // when finished prompting, insert a new item into the db with that info
            connection.query(
                "INSERT INTO departments SET ?",
                {
                    department_name: answer.department,
                    over_head_costs: answer.overHeadCosts
                },
                function (err, result) {
                    if (err) throw err;
                    console.log("Your Department was added successfully!");
                    // re-prompt the user for if they want to bid or post
                    addItemToDepartment(result.insertId);
                    // start();
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
        case "View Product Sales by Department":
            viewSales();
            break;
        case "Create New Department":
            createDepartment();
            break;
        case "Add item to Department":
            chooseDepartment();
            break;
        case "Exit":
            connection.end();
            break;
    }
}
