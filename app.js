const mongoose = require('mongoose');
const express = require("express");
const PORT = process.env.PORT || 3000;
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const itemsSchema = {
  name: String
};
// (singular name of collection, schema name)
const Item = new mongoose.model('Item', itemsSchema);

app.get("/", function(req, res) {

  res.render("list", {listTitle: "Today", newListItems: items});

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(PORT, function() {
  console.log("Server started on port " + {PORT});
});
