var express = require("express");
var cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xtqtqqh.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const techMartCollection = client.db("techMartDB").collection("products");
    const cartCollection = client.db("techMartDB").collection("carts");

    //get brand products by brand name
    app.get("/products/:title", async (req, res) => {
      const title = req.params.title;
      const query = { bName: title };
      const cursor = techMartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    //get carts products by user's email
    app.get("/carts/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = cartCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // get single product by id
    app.get("/products/id/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await techMartCollection.findOne(query);
      res.send(result);
    });

    // products post
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await techMartCollection.insertOne(newProduct);
      res.send(result);
    });

    //AddToCart products using post method
    app.post("/carts", async (req, res) => {
      const newCart = req.body;
      const result = await cartCollection.insertOne(newCart);
      res.send(result);
    });

    // Update single product by id
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const newUpdateProduct = req.body;
      const options = { upsert: true };
      const updateProduct = {
        $set: {
          name: newUpdateProduct.name,
          bName: newUpdateProduct.bName,
          type: newUpdateProduct.type,
          price: newUpdateProduct.price,
          rating: newUpdateProduct.rating,
          details: newUpdateProduct.details,
          photo: newUpdateProduct.photo,
        },
      };
      const result = await techMartCollection.updateOne(
        filter,
        updateProduct,
        options
      );
      res.send(result);
    });

    // delete MyCart product by using delete method
    app.delete("/carts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: id };
      const result = await cartCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
