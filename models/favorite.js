const mongoose = require('mongoose');
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;
const Schema = mongoose.Schema;
const Dishes = require('./dishes');

var favoriteSchema = new Schema({
    user:  {
        type: mongoose.Schema.Types.ObjectId ,
        ref: 'User'
    },
    dishes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Dishes'
    }]
}, {
    timestamps: true
});


var Favorites = mongoose.model('Favorite',favoriteSchema);
module.exports = Favorites;

