const { LineBot } = require('bottender');
const { createServer } = require('bottender/express');
const config = require('./bottender.config.js').line;


// load database
var loki = require('lokijs');
//var lokiIndexedAdapter = require('./node_modules/lokijs/src/loki-indexed-adapter');

//Creating the db
// We will use autoload (one time load at instantiation), and autosave  with 4 sec interval.
var db = new loki('artificial.db', {
  autoload: true,
  autoloadCallback: databaseInitialize,
  autosave: true,
  autosaveInterval: 4000 // save every four seconds for our example
});

// implement the autoloadback referenced in loki constructor
function databaseInitialize() {
  // on the first load of (non-existent database), we will have no collections so we can 
  //   detect the absence of our collections and add (and configure) them now.
  var userData = db.getCollection("userData");
  if (userData === null) {
    console.log("adding a new userData database");
    userData = db.addCollection("userData");
  }

  // kick off any program logic or start listening to external events
  runProgramLogic();
}

// While we could have done this in our databaseInitialize function, 
//   lets split out the logic to run 'after' initialization into this 'runProgramLogic' function
function runProgramLogic() {
  var userData = db.getCollection("userData");
  var entryCount = userData.count();
  var now = new Date();

  console.log("old number of entries in database : " + entryCount);

  /*entries.insert({ x: now.getTime(), y: 100 - entryCount });
  entryCount = entries.count();

  console.log("new number of entries in database : " + entryCount);*/
  /*console.log("");
  console.log("Wait 4 seconds for the autosave timer to save our new addition and then press [Ctrl-c] to quit")
  console.log("If you waited 4 seconds, the next time you run this script the numbers should increase by 1");*/
}


const bot = new LineBot({
    channelSecret: config.channelSecret,
    accessToken: config.accessToken,
});


bot.onEvent(async context => {
    if (context.event.isText) {
        const { text } = context.event.message;
        const text_lower = text.toLowerCase();
        console.log(text);
        if (text_lower === 'hello' || text_lower === 'hi') {
            await context.sendText('Running....');
        }
        else if (text_lower.includes("fuck")) {
            await context.sendText('ahhhhh bad word');
        }
        else if (text_lower.includes("remember me")) {
            await context.sendText('Yes , i actually do ^_^');
        }
        else if (text_lower.includes("how are you")) {
            await context.sendText('I am very fine , and you?');
        }
        else if (text_lower.includes("adduser")){
          
          var target_name = text.split(" ");

          if(target_name.length !== 3){
            await context.sendText(`Please use < adduser [target_name] [phone number]>`);
          }else{
            var userData = db.getCollection("userData");
            userData.insert({ name: target_name[1], phone: target_name[2]});
            var entryCount = userData.count();
            await context.sendText('Successful added ' + target_name[1] + ' now Total users = ' + entryCount);
          }
        }
        else if (text_lower.includes("remove")) {

          var target_name = text.split(" ");

          if (target_name.length !== 2) {
            await context.sendText(`Please use < remove [target_name]>`);
          } else {
            var userData = db.getCollection("userData");
            var fetched_data = userData.findOne({ name: target_name[1] });
            if (fetched_data) {
              userData.findAndRemove({ name: target_name[1]});
              var entryCount = userData.count();
              await context.sendText('Successful remove ' + target_name[1] + ' now Total users = ' + entryCount);
            }else{
              context.sendText(target_name[1] + ' is not in the database');
            }
          }
        }
        else if (text_lower.includes("find")) {

          var target_name = text.split(" ");

          if (target_name.length !== 2) {
            await context.sendText(`Please use < find [target_name] >`);
          } else {
            var userData = db.getCollection("userData");
            var fetched_data = userData.findOne({ name: target_name[1]});
            if(fetched_data){
              await context.sendText('Mobile phone of ' + target_name[1] + ' is ' + fetched_data.phone);
            }else{
              context.sendText(target_name[1] + ' is not in the database');
            }
          }
        }
        else if (text_lower.includes("how many phone number")) {
            var userData = db.getCollection("userData");
            var fetched_data = userData.find();
            //var result = userData.find({ name: target_name[1] });
            await context.sendText('Total records are ' + fetched_data.length);
        }
        else if (text_lower.includes("see all phone")) {
          var userData = db.getCollection("userData");
          var fetched_data = userData.find();
          var final_string = '';
          for(let x = 0; x< fetched_data.length;x++){
            final_string = final_string + 'Name: ' + fetched_data[x].name + ' > ' + fetched_data[x].phone + '\n'
          }
          await context.sendText(final_string);
        }
        else {
            await context.sendText(`ahhhhh i don't understand you `);
        }
    }
});

const server = createServer(bot);

server.listen(5000, () => {
  console.log('server is running on 5000 port...');
});