const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
const ejs = require("ejs");
// const date = require(__dirname +"/date.js");
const mongoose = require("mongoose");



const app = express();
const items = ["Wake Up", "Exist", "Sleep"];
const workItems = [];
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todoDB", {useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
    name: String
});

const Items = mongoose.model("item", itemsSchema);

const item1 = new Items({
    name: "Eat Food"
});

const item2 = new Items({
    name: "Shower"
});

const item3 = new Items({
    name: "Do leetcode" 
});

// async function deleteManyItems(){
//     const resp = await Items.deleteMany({});
// }

// deleteManyItems();

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]
});

const List = mongoose.model("List",  listSchema);




app.get("/", function(req,res){
    
    // let day = date.getDay();    
    // var curentDay = today.getDay();
    // var day = "";

    // switch (curentDay) {
    //     case 0:
    //         day= "Sunday";
    //         break;
    //     case 1:
    //         day= "Monday";
    //         break;
    //     case 2:
    //         day= "Tueday";
    //         break;
    //     case 3:
    //         day= "Wednesday";
    //         break;
    //     case 4:
    //         day= "Thursday";
    //         break;
    //     case 5:
    //         day= "Friday";
    //         break;
    //     case 6:
    //         day= "Saturday";
    //         break;
    //     default:
    //         console.log("Error: current day is " + curentDay);
    // };

    findAllItems();

    async function insertDefaultItems(){
        const resp = await Items.insertMany(defaultItems);
    }

    async function findAllItems(){
        const resp = await Items.find({});
        // console.log(resp)
        if (resp.length === 0){
            insertDefaultItems();
        } 
        else {
            res.render("list.ejs", {listTitle: "Today", newListItems: resp});
        }
        // console.log(resp);
    }
    
    // res.render("list.ejs", {listTitle: "Today", newListItems: findAllItems()})
});

app.post("/delete", function(req,res){
   
    // const itemId = req.body.checkedItem;
    // const listName = req.body.listName;

    const checkedItemId = req.body.checkedItem;
    const listName = req.body.listName;
    async function findAndRemoveItem(){
            const resp = await Items.findByIdAndDelete({_id: checkedItemId});
            console.log("Successfully deleted");
        }
    findAndRemoveItem();
    res.redirect("/");

//     // const filter = { name: listName };
//     // const update = {items: {_id: checkedItemId}};

//     // const doc = List.findOneAndUpdate(filter, update, {
//     // new: true
//     // });
//     // console.log(doc.name); 
//     // console.log(doc.age);
//     // res.redirect("/"+listName);

// //     if (listName === "Today"){
// //         async function findAndRemoveItem(){
// //             const resp = await Items.findByIdAndDelete({_id: checkedItemId});
// //             console.log("Successfully deleted");
// //         }
// //         findAndRemoveItem();
// //         res.redirect("/");
// //     } else {
// //         async function findList()
        
        
// //         async function findOneAndUpdateInList(){
// //             List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, {new:true});
// //         }
// //         findOneAndUpdateInList();
// //         res.redirect("/"+listName);
// //     }
   
});

app.get("/:customList", function(req, res){
    const customList = req.params.customList;
    async function findList(){
        const foundList = await List.findOne({name: customList}).exec();
        if (!foundList) {
            // create a new list
                const list = new List({
                name: customList,
                items: defaultItems
            });
            list.save(); 
            res.redirect("/"+customList);
        }
        else {
           // show an existing list
            res.render("list.ejs", {listTitle: foundList.name, newListItems: foundList.items});
        
        }
    }

    findList();
    
});


app.get("/about", function(req, res){
    res.render("about")
});

// app.post("/work", function(req, res){
//     const item = req.body.task;
//     workItems.push(item);
//     res.redirect("/work");
// })


app.post("/", function(req, res){
    const itemName = req.body.task;
    const listName = req.body.button; 
    const item = new Items({
        name: itemName
    });
    // console.log(listName);

    if (listName === "Today"){
        item.save();
        res.redirect("/");    
    } else {
        async function findThisList(){
            const foundList = await List.findOne({name: listName}).exec();
            console.log(foundList);
            foundList.items.push(item);
            foundList.save();
            res.redirect("/"+listName);
        }
        findThisList();
    }
    
});

app.listen(4000, function(req,res){
    console.log("Server is running on Port 4000");
});