const mongoose = require('mongoose');
const { Schema } = mongoose;

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

module.exports = userSchema;
