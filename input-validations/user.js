const joi = require('joi');

async function feedValidation(req,res,next)
{
    const querySchema = joi.object({
        title: joi.string().required()
                .messages(
                        {'string.empty':'Please enter feed title'}),
        description: joi.string().required()
                    .messages({'string.empty':'Please enter feed description'}),
        content: joi.string().required()
                    .messages({'string.empty':'Please enter feed content'}),
        tags: joi.string().optional().allow(''),
        feed_id: joi.string().optional().allow(''),
      });
      var result = await querySchema.validate(req.body);
      
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          if(req.session.user)
          {
              errorObj.user = req.session.user;
          }
          if(req.body.feed_id)
          {
            res.render('edit-feed/',{result:errorObj});
          }
          else{
            res.render('add-feed',{result:errorObj});
          }
          
      }
      else{
        next();
      }   
}

function settingValidation(req,res,next)
{
    const schema = joi.object({
      image: joi.string().optional().allow(''),
      username: joi.string().required()
                  .messages({'string.empty':'Please enter username'}),
      email: joi.string().required().email()
                  .messages({'string.empty':'Please enter email','string.email':'Please enter valid email'}),
      bio: joi.string().optional(),
      password: joi.string().optional().allow('')
    });
    var result = schema.validate(req.body);
      
    if(result.error)
    {
        var errorObj = {error:[result.error.details[0].message]};
        if(req.session.user)
        {
            errorObj.user = req.session.user;
        }
        res.render('settings',{result:errorObj});
    }
    else{
      next();
    }
}

async function likeValidation(req,res,next)
{
    const querySchema = joi.object({
        id: joi.string().required()
                .messages(
                        {'string.empty':'Feed id is required'})
      });
      var result = await querySchema.validate(req.body);
      
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          res.json(errorObj);
      }
      else{
        next();
      }   
}
async function commentValidation(req,res,next)
{
    const querySchema = joi.object({
      comment: joi.string().trim().required()
                .messages(
                        {'string.empty':'Comment is required'}),
      feed_id: joi.string().trim().required()
                .messages(
                        {'string.empty':'Feed id is required'})
      });
      var result = await querySchema.validate(req.body);
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          res.json(errorObj);
      }
      else{
        next();
      }   
}

async function deleteCommentValidation(req,res,next)
{
    const querySchema = joi.object({
      comment_id: joi.string().trim().required()
                .messages(
                        {'string.empty':'Comment id is required'}),
      feed_id: joi.string().trim().required()
                .messages(
                        {'string.empty':'Feed id is required'})
      });
      var result = await querySchema.validate(req.body);
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          res.json(errorObj);
      }
      else{
        next();
      }   
}
async function followUserValidation(req,res,next)
{
    const querySchema = joi.object({
      username: joi.string().trim().required()
                .messages(
                        {'string.empty':'Username is required'})
      });
      var result = await querySchema.validate(req.body);
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          res.json(errorObj);
      }
      else{
        next();
      }   
}
async function deleteFeedValidation(req,res,next)
{
    const querySchema = joi.object({
      feed_id: joi.string().trim().required()
                .messages(
                        {'string.empty':'Feed id is required'})
      });
      var result = await querySchema.validate(req.body);
      if(result.error)
      {
          var errorObj = {error:[result.error.details[0].message]};
          res.json(errorObj);
      }
      else{
        next();
      }   
}

module.exports = {
    feedValidation:feedValidation,
    settingValidation:settingValidation,
    likeValidation:likeValidation,
    commentValidation:commentValidation,
    deleteCommentValidation:deleteCommentValidation,
    followUserValidation:followUserValidation,
    deleteFeedValidation:deleteFeedValidation
}