const { object } = require('joi');
var mongoose = require('mongoose');

var feedSchema = mongoose.Schema({
    title: {type:String,required: [true,'Feed title is required']},
    description: {type:String,required: [true,'Feed description is required']},
    content: {type:String,required: [true,'Feed content is required']},
    tags: [String],
    userId: {type:mongoose.Schema.Types.ObjectId,ref:'usermodels',required: [true,'Created by user is required']},
    likes: [mongoose.Schema.Types.ObjectId],
    comments: [
        {
            userId: {type:mongoose.Schema.Types.ObjectId,ref:'usermodels',required:[true,'Commented by is required']},
            comment:{type:String,required:[true,'Comment is required']},
            createdAt: {type:Date,default: Date.now}
        }
    ]
},
{
    timestamps:true
});

var feedModel = mongoose.model('feedModel',feedSchema);
module.exports = feedModel;




