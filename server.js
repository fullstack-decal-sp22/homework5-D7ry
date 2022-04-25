const express = require('express')
const app = express()

const port = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded())

const mongoose = require('mongoose')

const db = mongoose.connection
const url = "mongodb://127.0.0.1:27017/apod"

mongoose.connect(url, { useUnifiedTopology: true, useNewUrlParser: true })

const Schema = mongoose.Schema
const apodSchema = Schema({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true
  }
}, {collection: 'images'}) // Note that within our DB, we are storing these images in a collection called images. 

const APOD = mongoose.model('APOD', apodSchema)

app.get("/", function (req, res) {
    APOD.find().exec((error, images) => {
        if (error) {
            console.log(error)
            res.send(500)
        } else {
            res.json(images)
        }
    })
});

app.get("/favorite", function (req, res) {
  // GET "/favorite" should return our favorite image by highest rating
  APOD.find().sort({'rating': 'desc'}).exec((error, images) => {
    if (error) {
      console.log(error)
      res.send(500)
    } else {
      if (images.length === 0) {
          res.send("No images stored yet!")
      } else {
        res.json({favorite: images[0]})
      }
      
    }
  })
})

app.post("/add", function (req, res) {
  // POST "/add" adds an APOD image to our database
  const a_image = new APOD( {
      title: req.body.title,
      url: req.body.url,
      rating: req.body.rating
  })
  a_image.save((error, doc) => {
      if (error) {
          res.json({status: "failed", error: error})
      } else {
          res.json( {
              status: "Successfully posted the following image:",
              content: req.body
          })
      }
  })
  
});

app.delete("/delete", function (req, res) {
    APOD.findOneAndDelete({title: req.body.title}, (err) => {
        if (err) {
            res.json({status: "failed", error: error})
        } else {
            res.json({status: "success!", deletedImage: req.body.title})
        }
    })
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})