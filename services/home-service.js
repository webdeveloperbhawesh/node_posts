var userModel = require('../models/user-model');
var feedModel = require('../models/feed-model');
var {getErrors} = require('../utils/common-helper');
var mongoose = require('mongoose');

async function login(req)
{
    try{
        const {email,password} = req;
        
        let result = await userModel.findOne({'email':email,'password':password}).then(user=>{
            if(!user)
            {
                return {'error':['Invalid username or password']};
            }
            return {'user':user};
        }).catch(err=>{
            return {'error':getErrors(err)}
        });
        return result;
    }
    catch(e){
        console.log(e);
        return {error:  getErrors(e),status:500}
    }
}
async function register(req)
{
    try {
        const {username,email,password} = req;
        
        const user = new userModel({
            username: username,
            email: email,
            password: password
        });
        var result = {};
        
        await user.save().then((resp)=>{
            result = {user:resp};
        }).catch((error1)=>{
            result =  {'error':getErrors(error1)};
        });
       
        console.log('service result---',result);
        return result;
    } catch (error) {
        return {error:  getErrors(error),status:500}
    }
    
}

async function globalFeeds(limit,offset,tagVal='')
{
    try {
        let matchCond = {};
        if(tagVal)
        {
            matchCond = {"tags":tagVal};
        }
        console.log(matchCond);
        var globalFeeds = await feedModel.aggregate([
            {
                $facet: {
                    feedCount: [
                        {
                            $match: matchCond
                        },{$count:'count'}],
                    data:[
                        {
                            $match: matchCond
                        },
                        {
                            $sort: {createdAt:-1}
                        },
                        {
                            $skip: offset
                        },
                        {
                            $limit: limit
                        },
                        {
                            $lookup:{
                                from: 'usermodels',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'userData'
                            }
                        }
                    ]
                }
            }
            
        ]).then(res=>{
            return res;
        }).catch(err=>{
            console.log(err);
            return {'error':err.message};
        });
        console.log(globalFeeds);
        return globalFeeds;
    } catch (error) {
        return {error:  [error.message],status:500};
    }
}

async function viewFeed(id)
{
    try {
        // let pipeline = [
        //     {
        //         $match: {'_id':mongoose.Types.ObjectId(id)}
        //     },
        //     {
        //         $lookup: {
        //             from: 'usermodels',
        //             let: {"commentBy":"$comments.userId"},
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                           $eq: ["$_id", "$$commentBy"]
        //                         }
        //                     },
        //                     $lookup: {
        //                         from: 'usermodels',
        //                         localField: 'userId',
        //                         foreignField: '_id',
        //                         as: 'commentByUser'
        //                     }
        //                 }
        //             ],
        //             as: 'userData'
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: 'usermodels',
        //             localField: 'userId',
        //             foreignField: '_id',
        //             as: 'userData'
        //         }
        //     }
        // ];

        let pipeline = [
            {
                $match: {'_id':mongoose.Types.ObjectId(id)}
            },
            {
                $unwind: {
                    path: "$comments",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: 'usermodels',
                    localField: 'comments.userId',
                    foreignField: '_id',
                    as: 'commentByData'
                }
            },
            {
                $addFields: {'comments.userDet': "$commentByData"}
            },
            {
                $group: {
                    _id: '$_id', comments: {$push: '$comments'}, internaldata: {$addToSet: '$$ROOT'}
                }
            },
            {
                $project: {
                    comments: 1, internaldata: {$arrayElemAt: ['$internaldata', 0]}
                  }
            },
            {
                $project: {
                    comments:1,
                    userId:1,
                    tags: "$internaldata.tags",
                    likes: "$internaldata.likes",
                    title: "$internaldata.title",
                    description: "$internaldata.description",
                    content: "$internaldata.content",
                    createdAt: "$internaldata.createdAt",
                    userId: "$internaldata.userId"
                  }
            },
            {
                $lookup: {
                    from: 'usermodels',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'userData'
                }
            },
        ];

        var feed = await feedModel.aggregate(pipeline
            ).then(res=>{
                console.log('lookup feed',res[0]);
            return res[0];
        }).catch(err=>{
            console.log(err);
            return {'error':err.message};
        });

        return feed;
    } catch (error) {
        return {error:  [error.message],status:500};
    }
}
async function popularTags()
{
    try {
        
        
        let result = await feedModel.find({},{tags:1,_id:0}).then((resp)=>{
            
            var allTags = {};
            resp.forEach(tags => {
                // console.log('firsst tags value',tags);
                // console.log('tags.tags value ',typeof tags.tags,tags.tags);
                tags.tags.forEach(tag=>{
                    if(tag) {
                        if(!allTags[tag]) {
                            allTags[tag] = 1;
                        }
                        else {
                            allTags[tag] = parseInt(allTags[tag] + 1);
                        }
                    }  
                });
            });
            var allTagsArr = [];
            for (var tag in allTags) {
                allTagsArr.push([tag, allTags[tag]]);
            }
            allTagsArr = allTagsArr.sort(function(a, b) {
                return b[1] - a[1];
            });
            var popularTags = allTagsArr.slice(0,15);
            popularTags = popularTags.map(x=>x[0]);
            return {popularTags:popularTags};
        }).catch((error1)=>{
            console.log(error1);
            result =  {'error':getErrors(error1)};
        });
       
        return result;
    } catch (error) {
        console.log(error);
        return {error:  getErrors(error),status:500}
    }
    
}

module.exports = {
    login:login,
    register:register,
    globalFeeds:globalFeeds,
    viewFeed: viewFeed,
    popularTags:popularTags
}