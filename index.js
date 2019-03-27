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

  var sentenceData = db.getCollection("learningSeq");
  if (sentenceData === null) {
    console.log("adding a new learningSeq database");
    sentenceData = db.addCollection("learningSeq");
  }

  // kick off any program logic or start listening to external events
  runProgramLogic();
}

// While we could have done this in our databaseInitialize function, 
//   lets split out the logic to run 'after' initialization into this 'runProgramLogic' function
function runProgramLogic() {
  var userData = db.getCollection("userData");
  var sentenceData = db.getCollection("learningSeq");
  var entryCount2 = sentenceData.count();
  var entryCount = userData.count();
  var now = new Date();

  console.log("old number of entries in userData : " + entryCount);


  console.log("old number of entries in learningSeq : " + entryCount2);
}

//----- create async ------- //
/*



setTimeout(() => {
  context.sendText(`This is what the timer look like`);
}, 1000)



*/

// ------------------------ //


const bot = new LineBot({
    channelSecret: config.channelSecret,
    accessToken: config.accessToken,
});


let re = /[ก-๙]/;

//

bot.onEvent(async context => {
    if (context.event.isText) {
        const { text } = context.event.message;
        const text_lower = text.toLowerCase();
        var split_command = text.split(" "); //split command to webprogrammer
        var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
        var date_format = new Date().toLocaleString();
        var new_format = date_format.split(" ");
        console.log('[' + new_format[0].replace(',', '') + ']' + '[' + new_format[1] + ']' + ': ' + context.session.user.displayName + ' > ' + text);
        if (text_lower === 'hello' || text_lower === 'hi') {
            await context.sendText('Running....');
        }
        else if (split_command[0] === "#addans") {
          var sentenceData = db.getCollection("learningSeq");
          if(split_command.length != 3){
            await context.sendText(`Please use < #addans [$id] [ans - to space bar] >`);
          }else{
            var result = sentenceData.findOne({ '$loki': Number(split_command[1]) });
            if(result){
              var complete_converted_to_plain_text_without_dash = split_command[2].replace(/-/g, " ");
              result.answer.push(complete_converted_to_plain_text_without_dash);
              sentenceData.update(result);
              await context.sendText('KEY id:' + split_command[1] + ' successfully added');
            }else{
              await context.sendText('KEY id:' + split_command[1] + ' is not found in database');
            }
          }
        }
        else if(split_command[0] === "#unkans"){
          var sentenceData = db.getCollection("learningSeq");
          //var fetched_data = sentenceData.find({ answer: { '$contains': [] }}); // find the empty answer
          var fetched_data = sentenceData.where(function (obj) {
            return obj.answer.length === 0;
          });
          //console.log("length == " + fetched_data.length);
          if(fetched_data.length > 0){
            var final_string = '';
            for (let x = 0; x < fetched_data.length; x++) {
              final_string = final_string + 'KEY: ' + fetched_data[x].$loki + ' > ' + fetched_data[x].sentence.join(' ') + '\n'
            }
            await context.sendText(final_string);           
          }else{
            await context.sendText('All sentence are already set up');
          }
        }
        else if (text_lower === "#show clever") {
          var sentenceData = db.getCollection("learningSeq");
          var fetched_data = sentenceData.find(); // find all
          if (fetched_data.length > 0) {
            var final_string = '';
            for (let x = 0; x < fetched_data.length; x++) {
              final_string = final_string + '[' + fetched_data[x].$loki + ']SENTENCE: ' + fetched_data[x].sentence.join(' ') + '\n'
            }
            await context.sendText(final_string);
          } else {
            await context.sendText('No sentence in record');
          }
        }
        else if (split_command[0] === "#clever"){
            if(split_command.length !== 2){
              await context.sendText(`Please use < #clever [HOW-ARE-YOU] >`);
            }else{
              var split_to_store = split_command[1].split("-");
              var sentenceData = db.getCollection("learningSeq");
              sentenceData.insert({ sentence: split_to_store , answer: [] });
              var entryCount = sentenceData.count();
              var result = sentenceData.findOne({ 'sentence': { '$contains': split_to_store } });
              await context.sendText('Created id: ' + result.$loki +' total data in learningSeq is ' + entryCount);
            }
        }
        else if (split_command[0] === "#notclever") {
          var sentenceData = db.getCollection("learningSeq");
          sentenceData.chain().remove();
          var entryCount = sentenceData.count();
          await context.sendText('total data in learningSeq is ' + entryCount);
        }
        else{
          /*var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '/');
          var date_format = new Date().toLocaleString();
          var new_format = date_format.split(" ");
          console.log('[' + new_format[0] + ']' + '[' + new_format + ']' + ': ' + context.session.user.displayName + ' > ' + text);*/
          
          var sentenceData = db.getCollection("learningSeq");
          var search_string_to_array = text_lower.split(" ");

          if(re.test(text_lower)){
            //เป็นภาษาไทย
            var fetched_data = sentenceData.where(function (obj) {
              //return obj.sentence
              var renew = new RegExp(text, "g");
              var count = (temp.match(trys) || []).length;
              if(count > 0){
                
              }
              return (obj.sentence.match(/text_lower/g) || []).length > 0;
            });



            await context.sendText("คนไทยนิหว่าา ^_^");
          }else{
            var result = sentenceData.findOne({ 'sentence': { '$contains': search_string_to_array } });
            if(result){
              await context.sendText(result.answer[0]);
            }else{
              await context.sendText('Sorry , i dont know what are you talking about');
            }
          }
        }
        /*else if (text_lower.includes("fuck")) {
            await context.sendText('ahhhhh bad word');
        }
        else if (text_lower.includes("remember me")) {
            await context.sendText('Yes , i actually do ^_^');
        }
        else if (text_lower.includes("how are you")) {
            await context.sendText('I am very fine , and you?');
        }
        else if (text_lower === "clear knowledge") {
          var sentenceData = db.getCollection("learningSeq");
          sentenceData.chain().remove();
          var entryCount = sentenceData.count();
          await context.sendText('total data in learningSeq is ' + entryCount);
        }
        else if (text_lower === "learn") {
            var sentenceData = db.getCollection("learningSeq");
            sentenceData.insert({ sentence: ['how','feel','great']});
            var entryCount = sentenceData.count();
          await context.sendText('total data in learningSeq is ' + entryCount );
        }
        else if (text_lower === "flearn") {
          var sentenceData = db.getCollection("learningSeq");
          var result = sentenceData.findOne({ 'sentence': { '$contains': ['how', 'great'] } });
          if(result){
            await context.sendText('found 1 id == ' + result.$loki);
          }else{
            await context.sendText('that is not exist');
          }
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
            if (fetched_data.length > 0) {
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
            if (fetched_data.length > 0){
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
        }*/
    }
});

const server = createServer(bot);

server.listen(5000, () => {
  console.log('server is running on 5000 port...');
});