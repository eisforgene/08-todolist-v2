//jshint esversion:6

const express = require("express");
const req = require("express/lib/request");
const mongoose = require('mongoose');
const _ = require("lodash");


const PORT = process.env.PORT || 3000;

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-eugene:zz87578757@cluster0.ypjdt.mongodb.net/todoListDB", {
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

const listSchema = {
  name: String,
  items: [itemsSchema] // going to have an array of item documents associated with listSchema
}

const List = mongoose.model('List', listSchema);

app.get("/", function (req, res) {

  Item.find({}, function (err, foundItems) { // find {} returns an array
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
      // console.log(foundItems);
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  })
});

app.get('/:customListName', function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, (err, foundList) => { // (err, results) || returns an object
    if (!err) { // if there is no error
      if (!foundList) { // if no list is found
        // Create a new list
        const list = new List({

          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect('/' + customListName);

      } else {
        // Show an existing list
        res.render("list", { listTitle: customListName, newListItems: foundList.items })
      }
    }
  })

  const list = new List({

    name: customListName,
    items: defaultItems
  });

  list.save();
})

app.post(("/"), function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, (err, foundList) => {
      foundList.items.push(item)
      foundList.save(); // save to update it with new data
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName; // check value of the input=name (listName) from list.ejs

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err => { // requires a callback function to execute
      if (!err) { // if no errors
        console.log("Successfully deleted checked item.")
        res.redirect("/");
      }
    }))
  } else { // {condition}, {what updates - must be array}, callback
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function (err, foundList) { // {$pull: {field: {query}}}, field we want to pull from, must be an array then provide value
      console.log(checkedItemId)
      if (!err) {
        res.redirect("/" + listName)
      }
    })
  }  
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
