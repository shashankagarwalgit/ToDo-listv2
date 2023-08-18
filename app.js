const express = require("express");
const bodyParser = require("body-parser");
const date = require("./date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://shashankdev:Test123456@cluster0.gwlbr3g.mongodb.net/todolistDB?retryWrites=true", {useNewUrlParser: true});

const itemsSchema = {
  name : String
};

const itemModel = mongoose.model("Item", itemsSchema);

const item1 = new itemModel({
  name: "Welcome to app"
});

const item2 = new itemModel({
  name: "Create Item"
});

const item3 = new itemModel({
  name: "Delete item"
});

const defaultarray = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("list" , listSchema);

app.get("/", function(req, res) {

  itemModel.find({}).then((founditems)=>{
    if(founditems.length===0){
      itemModel.insertMany(defaultarray).then(()=>{
      console.log("Successfully added");
      })
      .catch((err)=>{
      console.log(err);
    });
    res.redirect("/");
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
    }
    
});
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const item = new itemModel({
    name: itemName
  });
  item.save();
  res.redirect("/");
});

app.post("/delete", function(req,res){
  const checkedBox = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    itemModel.findByIdAndRemove(checkedBox).then((err)=>{
      console.log(err);
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName} , {$pull: {items: {_id: checkedBox}}}).then((err,foundList)=>{
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
 
});

app.get("/:customListName" , function(req,res){
  const customListName = req.params.customListName;
  List.findOne({customListName}).then((err,foundlist)=>{
    if(!err){
      if(!foundlist){
         const list = new List({
           name: customListName,
           items: defaultarray
          });
          list.save();
          res.redirect("/" + customListName);
        }
        else{
          res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items} );
        }
    };
  });
 
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
