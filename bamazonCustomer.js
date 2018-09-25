var mysql = require("mysql");
var inquirer = require("inquirer");

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

// Start the application
function start() {
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
                                (results[i].price).toFixed(2));
                        }
                        return choiceArray;
                    },
                    message: "What item# would you like to buy?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to buy?"
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

                if (chosenItem.stock_quantity >= parseInt(answer.quantity)) {
                    connection.query(
                        "UPDATE products SET ?, ? WHERE ?",
                        [
                            {
                                stock_quantity: chosenItem.stock_quantity - answer.quantity
                            },
                            {
                                product_sales: parseFloat(chosenItem.product_sales) + (parseFloat(answer.quantity) * parseFloat(chosenItem.price))
                            },
                            {
                                item_id: chosenItem.item_id
                            }
                        ],
                        function (error) {
                            if (error) throw err;
                            // Successful prchase
                            console.log("\nItem purchased successfully!  " +
                                "Total Due: $" +
                                (chosenItem.price * answer.quantity).toFixed(2) + "\n");
                            start();
                        }
                    );
                }
                else {
                    // Not enough in stock
                    console.log("Insufficient quantity! Try again...");
                    start();
                }
            });
    });
}
