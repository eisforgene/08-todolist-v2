//jshint esversion:6

const express = require("express");
const mongoose = require('mongoose');
const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = {
  name: String
};

// (singular version of collection name, schema we're going to use)
const Item = mongoose.model('Item', itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
})

const item2 = new Item({
  name: "Hit the + button to add a new item."
})

const item3 = new Item({
  name: "<-- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3];

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added to database.");
        }
      });
      res.redirect("/");
    } else {
      console.log(foundItems);
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  });

  item.save();
  res.redirect("/");
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;

  Item.findByIdAndRemove(checkedItemId, (err => { // requires a callback function to execute
    if (!err) { // if no errors
      console.log("Successfully deleted checked item.")
      res.redirect("/");
    }
  }))
})

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(PORT, function () {
  console.log("Server started on port " + PORT);
});
