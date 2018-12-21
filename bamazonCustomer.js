var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon"
  });
  

connection.connect(function(err) {
    if (err) throw err;
    afterConnection();
});

function afterConnection() {
    var items = {};
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        res.forEach(item => {
            console.log("ID: " + item.item_id + "\nName: " + item.product_name + "\nPrice: " + item.price + "\n");
            items[item.item_id] = {
                product_name: item.product_name,
                department: item.department_name,
                price: item.price,
                stock: item.stock_quantity
            }
        })
        //console.log(items);
        inquirer.prompt([
            {
                type: "input",
                message: "What is the ID of the product you wish to buy?",
                name: "id"
            },
            {
                type: "input",
                message: "How many do you wish to buy?",
                name: "amount"
            }
        ]).then(response => {
            var itemID = response.id;
            var amount = response.amount;
            if(items[itemID].stock >= amount) {
                var sql = "UPDATE products SET stock_quantity = stock_quantity - " + amount + " WHERE item_id = " + itemID;
                connection.query(sql, function(err, res) {
                    if (err) {
                        return console.log(err);
                    };
                    console.log("Purchase has been made!\nYou spend a total of: $" + items[itemID].price * amount);
                    inquirer.prompt([
                        {
                            type: "list",
                            message: "Would you like to make another purchase?",
                            name: "choice",
                            choices: ["Yes", "No"]
                        }
                    ]).then(res => {
                        if(res.choice === "Yes") {
                            afterConnection();
                        }
                        else {
                            connection.end();
                        }
                    })
                });
            }
            else {
                console.log("Insufficient quantity to make your purchase!");
            }
        })
    });
}
  