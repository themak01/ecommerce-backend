const Post = require('../models/post')
const User = require('../models/user')
const Profile = require('../models/profile')
const formidable = require('formidable')
const _ = require('lodash')
const fs = require('fs')



exports.getPostById = (req,res,next,id) => {
    Post.findById(id).exec((err,post) => {
        if (err || !post) {
            return res.status(400).json({
                error:"NO Post found"
            })
        }
        req.post = post
        next()
    })
}

exports.createPost = (req, res) => {

  let form = new formidable.IncomingForm()
  form.keepExtensions = true

  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error:"Failed to upload image"
      })
    }

    //destructure the fields
    const {postedBy, description, likes, comments, date} = fields

    if (!description){
      return res.status(400).json({
        error:"Please fill Description"
      })
    }
    
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.posts = undefined;
    req.profile.role = undefined;

    let post = new Post({
      postedBy: req.profile,
      description,
      fields
    })

    //handle file here
    if (file.photo){
      if (file.photo.size>10000000000000){
        return res.status(400).json({
          error:"File is too big"
        })
      }
      post.photo.data = fs.readFileSync(file.photo.path)
      post.photo.contentType = file.photo.type
    }

    //save to DB
    post.save((err, post) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to Post"
        })
      }
      res.json(post)
    })
  })
}

exports.getPost = (req, res) => {
  req.post.photo = undefined
  return res.json(req.post)
}
//middleware
exports.photo = (req, res, next) => {

  if(req.post.photo,data) {
    res.set("Content-Type", req.post.photo.contentType)
    return res.send(req.post.photo.data)
  }
  next()

}
exports.myPost = (req, res) => {
  Post.find({postedBy: req.profile})
  .populate("postedBy","_id username")
  .exec((err, myPost) => {
    if (err || !myPost){
      return res.status(400).json({
        error:"No post found"
      })
    }
    res.json(myPost)
  })
}

exports.getAllPosts = (req, res) => {
  Post.find()
  .populate("postedBy","_id username")
  .exec((err, posts) => {
    if(err || !posts){
      return res.status(400).json({
        error:"No Post found"
      })
    }
    res.json(posts)
  })
}

exports.deletePost = (req, res) => {
  let post = req.post
  post.remove((err, post)=>{
    if(err || !post){
      return res.status(400).json({
        error:"Failed to delete post"
      })
    }
    res.json({
      message:"Post deleted",
      post
    })
  })
}

exports.updatePost = (req, res) => {

  const post = req.post;
  post.description = req.body.description;

  post.save((err, updatedPost) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to update post"
      });
    }
    res.json(updatedPost);
  });
}

exports.getLikePost = (req, res) => {

  
}