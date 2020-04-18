//jshint esversion:6

// mongod --dbpath /Users/samim/data/db

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

// const items = ["Buy Food", "Eat Food", "Cook Food"];
// const workItems = [];



app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Creating a new database in MongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true });

//Create a new Schema
const itemsSchema = {
    name : String
};

// Creating Mongoose Model/Table
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
    name : "Welcome to your todList!"
});

const item2 = new Item ({
    name : "Hit the + button to add a new item."
});

const item3 = new Item ({
    name : "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

    // let day = "";
    // const day = date.getDate(); //Calling getDate function from date.js

    Item.find({}, function(err, items){
        if (items.length ===0) {
            Item.insertMany(defaultItems, function(err) {
                if (err){
                    console.log(err);
                } else {
                    console.log("Succesfully added to the database");
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {listTitle: "Today", newListItem: items});
        }
    });
});

app.get("/:customListName", function(req, res) {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                // Create a new list
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + customListName);
            } else {
                // Show an existing list
                res.render("list", {listTitle: foundList.name, newListItem: foundList.items});
            }
        }
    });
});

app.post("/", function(req, res) {

    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name : itemName
    });

    if (listName === "Today") {

        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + listName);
        });
    }

    // let item = req.body.newItem;

    // if(req.body.list === "Work") {
    //     workItems.push(item);
    //     res.redirect("/work");
    // } else {
    //     items.push(item);

    //     res.redirect("/");
    // }


});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(err) {
            if (!err) {
                console.log("Succesfully deleted the item");
                res.redirect("/");
            } 
        });
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
            if (!err) {
                res.redirect("/" + listName);
            } 
        });
    }
});

app.get("/work", function(req, res) {
    res.render("list", {listTitle: "Work List", newListItem: workItems});
});

app.post("/work", function(req, res) {
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});


app.listen(3000, function() {
    console.log("Server started on port 3000");
});

app.get("/about", function(req, res) {
    res.render("about");
});