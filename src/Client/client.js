function runClient(){
  var express = require('express');
  var app = express();
  var api = express()
var chalk = require('chalk');
var clear = require('clear');
var figlet = require('figlet');
var path = require('path');
var sub = require('express-subdomain');
var ejs = require('ejs')
var fs = require('fs')
var crypto = require('crypto')
var favicon = require('serve-favicon')
var request = require('request')
var path = require('path')
var session = require('express-session')
var today = require('../modules/date')
var got = require('got')
    var i = JSON.parse(fs.readFileSync('../src/Client/config/config.json'))

var PORT = 3333;

app.engine('.html', ejs.__express);
app.set('views','../src/Client/views');
app.set('view engine', 'ejs');
app.use(express.static(path.join('../src/Client/public')));
app.use(favicon(path.join(__dirname, './public/img/icon.png')))
app.use(session({secret: crypto.randomBytes(20).toString("hex"), resave: false, saveUninitialized: true, cookie: {expires: 2.16e+7}}));
////
const REDIRECT_URI = i.DEVELOPMENT ? `http://49.12.231.126:3333/authorize`: "WEBSITE_URL_HERE";

const DISCORD_API = {
    AUTH: "https://discordapp.com/api/oauth2/authorize",
    TOKEN: "https://discordapp.com/api/oauth2/token"
};

const DAPI = "https://discordapp.com/api/v6";
app.get("/login", (req, res) => {
    res.redirect(formURL("AUTH"));
});

app.get("/logout", async (req, res, next) => {
    res.clearCookie('connect.sid');
    req.session.destroy();
    res.redirect('/')
});

app.get("/authorize", async (req, res, next) => {

    const code = req.query && req.query.code;

    if (!code) return next(new Error("NO QUERY CODE FOUND"));

    const data = await authorizeUserGrant(code);

    const userData = await getAsyncURL("/users/@me", data);

    if (!userData.avatar || !userData.username) return res.redirect(formURL("AUTH"));

    userData.tag = `${userData.username}#${userData.discriminator}`;
    userData.avatar = `https://images.discordapp.net/avatars/${userData.id}/${userData.avatar}`;
    req.session.user = {data: userData};
    req.session.data = data;


    console.log(`\x1b[32m${userData.username}#${userData.discriminator}\x1b[0m logged in`)

    fs.readFile('../src/database/data.json', (err, data) => {
      if (err) throw err;
      let list = JSON.parse(data).data;
      var filtr = Object.values(JSON.parse(data).data).filter(account => account.id === userData.id)
      if(filtr.find(i => i.id === userData.id)===undefined){}else{return}
      var accList = {
          data: []
      }
      accList.data.push(...list, {id: userData.id, coins: 0,info: [{joinedFormattedDate: today(), joinedDate: Date.now()}]})
      var json = JSON.stringify(accList, null, 2);
  fs.writeFile('../src/database/data.json', json, 'utf8', (error) => {
      if (error) {
        console.log(error);
      } else {
          console.log(`Succesfully added account: \x1b[35m\x1b[1m${userData.username}\x1b[0m`);
      }
  })
});

    if (req.session && req.session.user.data && data) {
        res.redirect(`/`)
    } else {
        res.redirect(formURL("AUTH"));
    }
});


const getAsyncURL = (url, data) => new Promise(resolve => {
    request.get({
        url: `${DAPI}${url}`,
        headers: {
            'Authorization': `${data.token_type} ${data.access_token}`
        }
    }, (err, res, body) => {
        if (err || !body) return resolve(false);
        try {
            return resolve(JSON.parse(body));
        } catch (err) {
            console.error(err);
            return resolve(false);
        }
    });
});

const authorizeUserGrant = code => new Promise(resolve => {
    request.post({
        url: DISCORD_API.TOKEN,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        formData: {
            'client_id': i.CLIENT_ID,
            'client_secret': i.CLIENT_SECRET,
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': REDIRECT_URI
        }
    }, (err, res, body) => {
        if (err || !body) return resolve(false);
        try {
            const result = JSON.parse(body);
            if (result.error === "invalid_request") {
                return resolve(false)
            } else {
                return resolve(result);
            }

        } catch (err) {
            return resolve(false);
        }
    });
});

const formURL = type => `${DISCORD_API[type]}?client_id=${i.CLIENT_ID}&response_type=code&scope=identify%20`;

////
app.get("/", (req, res) => {
  res.render('index.ejs', {user: req && req.session && req.session.user || false})
});
app.get("/shop", (req, res) => {
    res.render('shop.ejs', {user: req && req.session && req.session.user || false})
  });
app.get('/lbcolors',function(req,res){
  res.json(JSON.parse(fs.readFileSync('../src/Client/public/path/js/lbcolors.json')))
})
api.get('/ez', function(req, res) {
  res.send('Welcome to our API!');
});
app.get('/*', function(req,res){
  res.redirect('/')
})
app.use(sub('api', api));
app.listen(PORT, function(){
    require('../modules/Logger').info('Client listening on port: \x1b[34m'+PORT+`\x1b[0m`
);
});
clear();
//console.log(`To exit press CTRL+C`);
//process.exit();
/////////////////

 
//api specific routes
}
module.exports=runClient
