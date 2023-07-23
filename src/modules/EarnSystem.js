const mongoose = require('mongoose');
const { Schema } = mongoose;

class Earn {
    constructor() {
        this.name = "Earn system";
        // Load Config
        this.config = require('../Settings.js');

        this.mongoUrl = this.config.mongoUrl;
        this.mongoName = this.config.mongoDBName;

        // Set up the MongoDB connection
        this.connectToMongoDB();

        // Define the User model schema only if it doesn't exist
        if (!mongoose.models.users) {
            const userSchema = new Schema({
                id: String,
                token: String,
                avatar: String,
                permissionLevel: Number,
                username: String,
                discriminator: String,
                tag: String,
                badges: {
                    verify: Boolean,
                    mod: Boolean,
                    admin: Boolean,
                    owner: Boolean,
                    youtuber: Boolean,
                    donator: Boolean,
                    booster: Boolean,
                },
                verifyName: String,
                activity: {
                  joinedFormattedDate: {
                    type: String,
                    required: true,
                    default:  new Date().toLocaleTimeString('en-US', { hour12: false }),
                  },
                  joinedDate: {
                    type: Date,
                    required: true,
                    default: Date.now,
                  },
                  lastOnlineDate: {
                    type: Date,
                    required: true,
                    default: Date.now,
                  },
                },
                ips: [String],
                banInfo: {
                  isBanned: Boolean,
                  reason: String,
                  expireDate: Date,
                },
                coins: Number,
                xp: Number,
                xpGoal: Number,
                xpProgress: Number,
                level: Number,
                items: {
                  colorNames: [String],
                  hats: [String],
                  current_boosters: {
                    mass_boost: {
                      multiplier: Number,
                      expireDate: Date,
                    },
                    xp_boost: {
                      multiplier: Number,
                      expireDate: Date,
                    },
                    coin_boost: {
                      multiplier: Number,
                      expireDate: Date,
                    },
                  },
                },
                isMod: Boolean,
                isAdmin: Boolean,
                isOwner: Boolean,
                isVerified: Boolean,
            });

            this.User = mongoose.model('users', userSchema);
        } else {
            // If the model already exists, use it
            this.User = mongoose.models.users;
        }

        // Bind the method to make it accessible externally
        this.updateCoins = this.updateUserCoins.bind(this);
        this.updateExp = this.updateUserExperience.bind(this);
        // *** Can use both ***
        this.updateCoinsExp = this.updateUserCoinsAndXP.bind(this);
    }

    async connectToMongoDB() {
        try {
            await mongoose.connect(`${this.mongoUrl}/${this.mongoName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB!');
        } catch (error) {
            console.error('Error connecting to MongoDB:', error);
        }
    }

    async updateUserCoins(userId, coinsToAdd) {
        try {
            const user = await this.updateUser({ id: userId }, { $inc: { coins: coinsToAdd } });
            console.log('User coins: ', user.coins);
        } catch (error) {
            console.log('Error updating user coins:', error);
        }
    }

    async updateUserExperience(userId, xpToAdd) {
        try {
            const user = await this.updateUser({ id: userId }, { $inc: { xp: xpToAdd } });
            console.log('User experience: ', user.xp);
        } catch (error) {
            console.log('Error updating user experience:', error);
        }
    }

    async updateUser(filter, update) {
        return this.User.findOneAndUpdate(filter, update, { new: true });
    }

    async updateUserCoinsAndXP(userId, coinsToAdd, xpToAdd) {
        try {
            const user = await this.User.findOneAndUpdate(
                { id: userId },
                {
                    $inc: { coins: coinsToAdd, xp: xpToAdd },
                },
                { new: true } // Set { new: true } to return the updated document instead of the original one
            );

            if (user) {
                console.log(`UserID ${userId}, Coins: ${user.coins}, XP: ${user.xp}`);
            } else {
                console.log(`User not found with the given id: ${userId}`);
            }
        } catch (error) {
            console.log('Error updating user coins and xp:', error);
        }
    }

    logUpdateResult(user, messagePrefix) {
        if (user) {
            console.log(`${messagePrefix} updated:`, user);
        } else {
            console.log(`User not found with the given id.`);
        }
    }
}

module.exports = Earn;