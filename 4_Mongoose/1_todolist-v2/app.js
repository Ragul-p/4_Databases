
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//-----
mongoose.connect("mongodb://127.0.0.1:27017/todoListDB");

const itemSchema = mongoose.Schema({
name:String
});

const Item = mongoose.model("Item",itemSchema);

const item1 = new Item({
  name:"Welcome your ToDo List !"
});

const item2 = new Item({
  name:"Hit The + Button to add new Item"
});

const item3 = new Item({
  name:"<-- Hit This to delete item"
});

const defaultItem =[item1,item2,item3];

//-----



app.get("/", function(req, res) {

Item.find({},function(err,foundItem){
if(foundItem.length === 0){
  Item.insertMany(defaultItem,function(err){
    if(err){
    console.log(err);
    }else{
      console.log("Success Default item Saved Our DB !");
    }
    });
}else{
  res.render("list", {listTitle: "ToDay", newListItems: foundItem});
}
});

});



app.post("/", function(req, res){
console.log(req.body);


const item = new Item({
  name:req.body.newItem
});


if(req.body.list === "ToDay"){
  item.save();
  res.redirect("/");
}else{
List.findOne({name:req.body.list },function(err,foundList){
foundList.items.push(item);
foundList.save();
res.redirect("/"+req.body.list)
});
}



});






//Custom List

const listSchema = mongoose.Schema({
  name:String,
  items:[itemSchema]
});

const List = mongoose.model("List",listSchema);




app.get("/:customListName",function(req,res){

  console.log(req.params.customListName);
List.findOne({name:req.params.customListName},function(err,foundList){


if(!err){
  if(!foundList){

    const list = new List({
      name:req.params.customListName,
      items:defaultItem
    });
    list.save();
  
    res.redirect("/"+req.params.customListName);
  }
  else{
    console.log("else");
    res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
    }
}else{

}



});

});


app.post("/delete",function(req,res){
  console.log("...");
 console.log(req.body);
 console.log("...");
  const checkItemId = req.body.checkbox;
  if(req.body.listName === "ToDay"){
    Item.findByIdAndRemove(checkItemId,function(err){
      if(err){
      console.log(err);
      }else{
        console.log("Success delete !");
        res.redirect("/");
      }
      });
  }
  else{
    Item.findOneAndUpdate({name:req.body.listName},{$pull:{items:{_id:checkItemId}}},{ new: true },function(err,foundList){
  if(!err){
  res.redirect("/"+req.body.listName);
  }
    });
  }
  
  });
  


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
