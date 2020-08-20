const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Favorites = require('../models/favorite');
var authenticate = require('../authenticate');
var cors = require('./cors');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
.options(cors.corsWithOptions,(req,res)=>{ res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    console.log(req.user._id);
    Favorites.findOne({user:req.user._id})
    .populate('user')
    .populate('dish')
    .exec((err,favorites)=>{
        if(err) return next(err);
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(favorites);
        }
    })
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    console.log(req.body);
    console.log(req.user._id);
    Favorites.findOne({user:req.user._id}, (err,favorite)=>{
        if(err) return next(err);
        if(!favorite){
            Favorites.create({user:req.user._id})
            .then((favorite)=>{
                for(i=0;i<req.body.length;i++){
                    favorite.dishes.push(req.body[i])
                }
                favorite.save()
                .then((favorite)=>{
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dish')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                });
            })
            .catch((err) => {
                return next(err);
            });
        }
        else{
            for (i = 0; i < req.body.length; i++ )
                if (favorite.dishes.indexOf(req.body[i]._id) < 0)                                  
                    favorite.dishes.push(req.body[i]);
            favorite.save()
            .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dish')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err) => {
                return next(err);
            });
        }
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /favorites');
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.deleteOne({user:req.user._id},(err,resp)=>{
        if(err) return next(err);
        if(resp){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
        }
    })
})

favoriteRouter.route('/:dishId')
.options(cors.corsWithOptions,(req,res)=>{ res.sendStatus(200); })
.get(cors.corsWithOptions,authenticate.verifyUser,(req,res,next) => {
    Favorites.findOne({user: req.user._id})
    .then((favorites) => {
        if (!favorites) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists": false, "favorites": favorites});
        }
        else {
            if (favorites.dishes.indexOf(req.params.dishId) < 0) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": false, "favorites": favorites});
            }
            else {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists": true, "favorites": favorites});
            }
        }

    }, (err) => next(err))
    .catch((err) => next(err))
})
.post(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    
    Favorites.findOne({user:req.user._id},(err,favorite)=>{
        if(err) return next(err);
        if(!favorite){
            Favorites.create({user:req.user._id})
            .then((favorite)=>{
                favorite.dishes.push({"_id":req.params.id});
                favorite.save()
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dish')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
                .catch((err)=>next(err));
            })
            .catch((err)=>{
                return next(err);
            });
        }
        else{
            if (favorite.dishes.indexOf(req.params.dishId) < 0) {                
                favorite.dishes.push({"_id":req.params.dishId});
                favorite.save()
                .then((favorite) => {
                    Favorites.findById(favorite._id)
                    .populate('user')
                    .populate('dish')
                    .then((favorite) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorite);
                    })
                })
                .catch((err) => {
                    return next(err);
                })
            }
            else{
                res.statusCode = 403;
                res.end('Error occured'); 
            }
        }
    })
})
.put(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    res.statusCode = 403;
    res.end('Assignment PUT operation not supported on /favorites/');
    // Promotions.findByIdAndUpdate(req.params.promoId,
    // { $set:req.body },{ new:true })
    // .then((promotion)=>{
    //     res.statusCode = 200;
    //     res.setHeader('Content-Type', 'application/json');
    //     res.json(promotion);
    // }, (err) => next(err))
    // .catch((err) => next(err));
})
.delete(cors.corsWithOptions,authenticate.verifyUser,(req, res, next) => {
    Favorites.findOne({user:req.user._id},(err,favorite)=>{
        if(err) return next(err);
        console.log(favorite);
        var index = favorite.dishes.indexOf(req.params.dishId);
        if(index>=0){
            favorite.dishes.splice(index,1);
            favorite.save()
            .then((favorite)=>{
                //favorite.dishes.push({"_id":req.params.id});
                //favorite.save()
                Favorites.findById(favorite._id)
                .populate('user')
                .populate('dish')
                .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorite);
                })
            })
            .catch((err)=>{
                return next(err);
            });
        }
        else{
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.json("Dish not present");
        }
    });
})


module.exports = favoriteRouter;