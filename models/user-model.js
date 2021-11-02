var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: {
        type: String,
        required: [true,'Username is required'],
        validate: {
            validator: async function(username)
            {
              const user = await this.constructor.findOne({ username });
              if(user) {
                if(this.id === user.id) {
                  return true;
                }
                return false;
              }
              return true;
            },
            message: props => 'The specified username is already in use.'
          },
    },
    email: {
        type: String,
        required: [true,'Email is required'],
        validate: {
            validator: async function(email)
            {
                //console.log(await this.constructor.findOne({email:email}));
                const user = await this.constructor.findOne({email:email});
                if(user) {
                    console.log('found',user.email,user.id,this.id);
                    if(this.id === user.id) {
                      return true;
                    }
                    return false;
                  }
                  return true;
            },
            message: props => 'The specified email is already in use.'
        }
    },
    password: {
        type: String,
        required: [true,'Password is required']
    },
    image:String,
    bio:String,
    followings: [mongoose.Schema.Types.ObjectId]
},{
    timestamps: true
});

var userModel = mongoose.model('userModel',userSchema);
module.exports = userModel;