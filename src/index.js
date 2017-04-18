/*
	Author: Benjamin Snoha
	Title: Finish My Sentence
*/

'use strict';
var Alexa = require("alexa-sdk");
var request = require('request');
var APP_ID = 'amzn1.ask.skill.8ada4fe6-f9c7-478d-933a-a3cd61dde1e3';

var languageStrings = {
    "en": {
        "translation": {
            "SKILL_NAME" : "Finish My Sentence",
            "HELP_MESSAGE" : "If you say any sentence, I will try and finish it for you, or, you can say exit... What can I help you with?",
            "HELP_REPROMPT" : "What can I help you with?",
            "STOP_MESSAGE" : "Goodbye!"
        }
    }
};


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
	alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit(':ask', "Welcome to Finish My Sentence. Just say a sentence and I will finish it. I work best when you end your sentence with an adjective.", 'Try saying a sentence ending in an adjective.');
    },
    'GetNewWordIntent': function () {
		 var wordInput = this.event.request.intent.slots.customWord.value;
		 
		 if(wordInput == null || wordInput === "undefined" || wordInput == ''){
			this.emit('Unhandled');
		 }
		 else{
			// Create speech output
			getNextWord(wordInput, (speechOutput) => {
				if(speechOutput == ''){
					this.emit('Unhandled');
				}
				else{
					//this.emit(':tellWithCard', speechOutput, this.t("SKILL_NAME"), speechOutput);
					this.emit(':ask', speechOutput + '. <break time="1s"/> I hope that made sense. Say stop to quit, or another sentence to keep going!');
				}
			});
		}
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = this.t("HELP_MESSAGE");
        var reprompt = this.t("HELP_REPROMPT");
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', this.t("STOP_MESSAGE"));
    },
    'Unhandled': function() {
        console.log("UNHANDLED");
		
		//If the users sentence really made no sense at all, then just choose a random word to finish with. 
		
		getNextWord("yellow", (speechOutput) => {
			if(speechOutput == ''){
				this.emit('Unhandled');
			}
			else{
				this.emit(':ask', speechOutput + '. <break time="1s"/> Hopefully that made sense. Try ending with an adjective. Say stop to quit, or another sentence to keep going!');
			}
		});	
    }
};

//Gets the rhyme for a single word
function getNextWord(contextWord, _callback){	
	var options = {
		url: 'https://api.datamuse.com/words?rel_jja=' + contextWord + '&lc=' + contextWord
	};
	
	request(options, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			//Get the info
			var info = JSON.parse(body);
			var potentialWord = [];
			
			//Search it to make sure the syllable count is the same
			if(info){
				for(var i = 0; i < info.length; i++){
					//We found a rhyme, add to potential's array
					potentialWord.push(info[i].word);
				}
				
				//Return random one from list of potential rhymes
				if(_callback){
					var randIndex = Math.floor(Math.random() * (potentialWord.length - 1));
					if(potentialWord[randIndex]){
						return _callback(potentialWord[randIndex]);
					}
				}
			}
		}
		else{
			console.log("Error making request: " + error);
		}
		
		if(_callback){
			return _callback('');
		}
	});
}