// @ts-nocheck
const mongoose = require('mongoose');
const { Schema } = mongoose;
const Logger = require('../modules/Logger')

class Earn {
    constructor() {
        this.name = "Earn system";
        // Load Config
        this.config = require('../Settings.js');

        this.mongoUrl = this.config.mongoUrl;
        this.mongoName = this.config.mongoDBName;

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

        this.updateCoinsExp = this.updateUserCoinsAndXP.bind(this);
    }

    async startMongoDB() {
        try {
            await mongoose.connect(`${this.mongoUrl}/${this.mongoName}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            Logger.info('Connected to MongoDB!');
        } catch (error) {
            Logger.error('Error connecting to MongoDB:', error);
        }
    }

    async updateUserCoinsAndXP(userId, coinsToAdd, xpToAdd) {
        try {
            const user = await this.User.findOne({ id: userId }); // Fetch the user's data

            if (user) {
                const userName = user.username; // Get the user's name
                const updatedUser = await this.User.findOneAndUpdate(
                    { id: userId },
                    {
                        $inc: { coins: coinsToAdd, xp: xpToAdd },
                    },
                    { new: true }
                );
                
                if (updatedUser) {
                    Logger.info(`User: ${userName}, ID: ${userId}, Coins: ${updatedUser.coins}, XP: ${updatedUser.xp}`);
                } else {
                    Logger.info(`User not found with the given id: ${userId}`);
                }
            } else {
                Logger.info(`User not found with the given id: ${userId}`);
            }
        } catch (error) {
            Logger.error('Error updating user coins and xp:', error);
        }
    }
}

module.exports = Earn;