// @ts-nocheck
const mongoose = require('mongoose');
const userSchema = require('./schema/userSchema');
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
            this.User = mongoose.model('users', userSchema);
        } else {
            // If the model already exists, use it
            this.User = mongoose.models.users;
        }

        this.updateCoinsExp = this.updateUserCoinsAndXP.bind(this);
        this.getUserID = this.getUserByName.bind(this);
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

    async getUserByName(userId) {
        try {
            const user = await this.User.findOne({ id: userId }); // Fetch the user's data
    
            if (user) {
                const userName = user.username; // Get the user's name
                const modBadge = user.badges.mod; // Get the 'mod' badge status
    
                Logger.info(`User ID: ${userId}, Name: ${userName}, modBadge: ${modBadge}`);
                return { userName, modBadge }; // Return the values as an object
            } else {
                Logger.info(`User not found with the given ID: ${userId}`);
                return null; // Return null if user not found
            }
        } catch (error) {
            Logger.error('Error retrieving user data:', error);
            return null; // Return null in case of an error
        }
    }    
}

module.exports = Earn;