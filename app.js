const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

var items = [];
let workItems = [];
const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set("view engine" , "ejs");

mongoose.connect("mongodb+srv://BishalAgarwal:B!shal711@atlascluster.2x9rxca.mongodb.net/todolistDB" , {useNewUrlParser : true});
const itemsSchema = {
  name : String
};

const Item = mongoose.model("Item" , itemsSchema);

const item1 = new Item({
  name : "Welcome to your Todolist"
});

const item2 = new Item({
  name : "Hit + to add items to your todolist"
});

const item3 = new Item({
  name : "<-- hit this to delete items from todolist"
});

const item4 = new Item({
  name : "Use /itemname in the url to create new list"
});

const defaultItems = [item1 , item2 , item3 , item4];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/" , function(req,res){
  Item.find({} , function(err,foundItems){
    if(foundItems.length === 0)
    {
      Item.insertMany(defaultItems , function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("successfully added to the db");
        }
      });
      res.redirect("/");
    }
    else{
      res.render("list" ,{
        listTitle : "Today",
        newListItems : foundItems
      });
    }
  });
});

app.get("/:customListName" , function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name : customListName} , function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name : customListName,
          items : defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        res.render("list" , {listTitle : customListName , newListItems : foundList.items});
      }
    }
  });
});

app.post("/" , function(req,res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name : itemName
  });
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name : listName} , function(err , foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

});

app.post("/delete" , function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId , function(err){
      if(!err){
        console.log("successfully deleted checked item");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name : listName} , {$pull : {items : {_id : checkedItemId}}} , function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port,function(){
  console.log("server running on port 3000");
});
