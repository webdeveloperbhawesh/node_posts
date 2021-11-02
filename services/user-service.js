var userModel = require('../models/user-model');
var feedModel = require('../models/feed-model');
var {getErrors} = require('../utils/common-helper');
var mongoose = require('mongoose');

async function saveFeed(req,userId)
{
    try{
        const {title,description,content,tags} = req;
        const newFeed = new feedModel({
            title:title,
            description:description,
            content:content,
            tags:tags.split(','),
            userId: userId
        });
        var result = await newFeed.save().then(resp=>{
            console.log('ressss',resp);
            return {'feed':resp};
        }).catch(e=>{
            console.log(e.message);
            return {'error':[e.message]};
        });
        return result;
    }catch(ex)
    {
        console.log(ex);
        return {error:  [ex.message],status:500}
    }
}

async function updateFeed(req,userId)
{
    try{
        const {title,description,content,tags} = req;
        let updateArr = {
            title:title,
            description:description,
            content:content,
            tags:tags.split(','),
            userId: userId
        };
        var result = await feedModel.findOneAndUpdate({_id:req.feed_id,userId:userId},updateArr).then(resp=>{
            console.log('ressss',resp);
            return {'feed':resp};
        }).catch(e=>{
            console.log(e.message);
            return {'error':[e.message]};
        });
        return result;
    }catch(ex)
    {
        console.log(ex);
        return {error:  [ex.message],status:500}
    }
}

async function updateSetting(req,userId)
{
    try{
        let updateArr = {
            image: req.image,
            email: req.email,
            username: req.username,
            bio:req.bio
        }
        if(req.password)
        {
            updateArr.password = req.password;
        }
        var result = await userModel.findOneAndUpdate({_id:userId},updateArr,{new:true}).then(res=>{
            res.password = undefined;
            return {'userData':res};
        }).catch(err=>{
            console.log(err.message);
            return {error:  getErrors(err)};
        });
        return result;
    }catch(ex)
    {
        return {error:  [ex.message],status:500}
    }
    
}

async function myFeeds(limit,offset,username)
{
    try {
        let userId = await getUserByUsername(username);
        userId = userId._id;
        var myFeeds = await feedModel.aggregate([
            {
                $facet: {
                    feedCount: [
                        {
                            $match: {userId: mongoose.Types.ObjectId(userId)}
                        },
                        {
                            $count:'count'
                        }],
                    data:[
                        {
                            $match: {userId: mongoose.Types.ObjectId(userId)}
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
        return myFeeds;
    } catch (error) {
        return {error:  [error.message],status:500};
    }
}
async function getUserByUsername(username)
{
    try{
        let user = await userModel.findOne({username:username}).then(u=>
            {
                return u;
            }).catch(e=>{
                return {'error':e.message};
            });
        return user;
    }
    catch(error) {
        return {'error':error.message};
    }
}

async function favouritedFeeds(limit,offset,username)
{
    try {
        let userId = await getUserByUsername(username);
        userId = userId._id;
        var favFeeds = await feedModel.aggregate([
            {
                $facet: {
                    feedCount: [
                        {
                            $match: {likes: mongoose.Types.ObjectId(userId)}
                        },
                        {
                            $count:'count'
                        }
                    ],
                    data:[
                        {
                            $match: {likes: mongoose.Types.ObjectId(userId)}
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
        return favFeeds;
    } catch (error) {
        return {error:  [error.message],status:500};
    }
}

async function likeFeed(feedId,userId)
{
    try{
        let pushed = await feedModel.findById(feedId).then(async (res)=>{
            console.log('like feed found',res);
            if(res.likes.includes(userId))
            {
                let updated = await feedModel.findByIdAndUpdate(feedId,{
                    $pull: {'likes':userId}
                },{new:true}).then(updatedRes=>{
                    return {'count':updatedRes.likes.length};
                }).catch(ex=>{
                    return {error:ex.message};
                });
                return updated;
            }
            else{
                let updated = await feedModel.findByIdAndUpdate(feedId,{
                    $push: {'likes':userId}
                },{new:true}).then(updatedRes=>{
                    return {'count':updatedRes.likes.length};
                }).catch(ex=>{
                    return {error:ex.message};
                });
                return updated;
            }
            
        }).catch(e=>{
            console.log('error',e.message);
            return {error: e.message};
           
        });
        console.log('pushed ',pushed);
        return pushed;
    }
    catch(e){
        console.log(e);
        return {error:[e.message]};
    };
}

async function getUser(username)
{
    try{
        let user = await userModel.findOne({'username':username}).then(user=>{
            user.password = undefined;
            return user;
        }).catch(e=>{
            console.log('error',error);
            return {error:  [ex.message]}
        });
        return user;
    }catch(ex)
    {
        return {error:  [ex.message],status:500}
    }
}

async function postComment(comment,feedId,userId)
{
    try{
            let updated = await feedModel.findByIdAndUpdate(feedId,{
                $push: {'comments':{userId:userId,comment:comment}}
            },{new:true}).then(updatedRes=>{
                return updatedRes;
            }).catch(ex=>{
                return {error:ex.message};
            });
            return updated;
    }
    catch(error) {
        return {'error':error.message};
    }
}
async function deleteComment(comment_id,feedId,userId)
{
    try{
            let updated = await feedModel.findByIdAndUpdate(feedId,{
                $pull: {'comments':{_id:comment_id}}
            },{new:true}).then(updatedRes=>{
                return updatedRes;
            }).catch(ex=>{
                return {error:ex.message};
            });
            return updated;
    }
    catch(error) {
        return {'error':error.message};
    }
}
async function followUser(username,userId)
{
    try{
        let followUserId = await getUserByUsername(username);
        followUserId = followUserId._id;
        let updated = await userModel.findById(userId).then(async (res)=>{
            if(res.followings.includes(followUserId))
            {
                let updated = await userModel.findByIdAndUpdate(userId,{
                    $pull: {'followings':followUserId}
                },{new:true}).then(updatedRes=>{
                    updatedRes.password = undefined;
                    return {'following':'+ Follow '+username,'updatedRes':updatedRes};
                }).catch(ex=>{
                    return {error:ex.message};
                });
                return updated;
            }
            else{
                let updated = await userModel.findByIdAndUpdate(userId,{
                    $push: {'followings':followUserId}
                },{new:true}).then(updatedRes=>{
                    updatedRes.password = undefined;
                    return {'following':'Following '+username,'updatedRes':updatedRes}
                }).catch(ex=>{
                    return {error:ex.message};
                });
                return updated;
            }
        }).catch(ex=>{
            return {error:ex.message};
        });
        return updated;
    }
    catch(error) {
        return {'error':error.message};
    }
}
async function deleteFeed(feedId,userId)
{
    try{
            let updated = await feedModel.findByIdAndDelete(feedId).then(updatedRes=>{
                return updatedRes;
            }).catch(ex=>{
                return {error:ex.message};
            });
            return updated;
    }
    catch(error) {
        return {'error':error.message};
    }
}

async function getFeed(feedId,userId)
{
    try{
            let feed = await feedModel.findOne({_id:feedId,userId:userId}).then(res=>{
                return res;
            }).catch(ex=>{
                return {error:ex.message};
            });
            return feed;
    }
    catch(error) {
        return {'error':error.message};
    }
}

module.exports = {
    createFeed: saveFeed,
    updateSetting:updateSetting,
    myFeeds:myFeeds,
    likeFeed:likeFeed,
    favouritedFeeds:favouritedFeeds,
    getUser:getUser,
    postComment:postComment,
    deleteComment:deleteComment,
    followUser:followUser,
    deleteFeed:deleteFeed,
    getFeed:getFeed,
    updateFeed:updateFeed
}