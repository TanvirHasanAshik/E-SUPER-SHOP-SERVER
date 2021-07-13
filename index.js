const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const ObjectID = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hooq3.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    const productCollection = client.db(process.env.DB_NAME).collection("products");
    const addToCart = client.db(process.env.DB_NAME).collection("cart");
    const orders = client.db(process.env.DB_NAME).collection("orders");

    app.post('/addProduct', (req, res) => {
        productCollection.insertOne(req.body)
        .then(result => {
            res.redirect("/addProduct")
        })
    })

    app.post('/ProcessOrder', (req, res) => {
        addToCart.insertOne(req.body)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.get('/cart', (req, res) => {
        addToCart.find({email: req.query.email})
        .toArray((err, docs) => {
           res.send(docs)
        })
    })

    //read all products
    app.get('/products', (req, res) => {
        productCollection.find({})
        .toArray((err, doc)=>{
            res.send(doc)
        })
    })

    //Confirm order post
    app.post('/confirmOrder', (req, res)=>{
        orders.insertOne(req.body)
        .then(result => {
            console.log(result)
        })
        
    })

    app.get('/orders', (req, res)=>{
        orders.find({})
        .toArray((err, docs) => {
            res.send(docs);
        })
    })

    //delete product
    app.delete('/delete/:id', (req, res)=>{
        productCollection.deleteOne({_id: ObjectID(req.params.id)})
        
    })

    //read single data from database.
    app.get('/edit/:id', (req, res)=>{
        productCollection.find({_id: ObjectID(req.params.id)})
        .toArray((err, docs)=>{
            res.send(docs[0])
        })
    })

    //Update Product
    app.patch('/updateProduct/:id', (req, res) => {
        productCollection.updateOne({_id: ObjectID(req.params.id)},
        {
            $set: {productName: req.body.productName, weight: req.body.weight, price: req.body.price}
        })
    })
    
});

app.listen(process.env.PORT || 5500);
