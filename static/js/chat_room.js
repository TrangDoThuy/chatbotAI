$(document).ready(function () {
  var dt = new Date();
  chat.init();

  //   var hours = dt.getHours();
  //   if (hours >= 4 && hours <= 12) {
  //     Speech('Good Morning, Sir');
  //   } else if (hours >= 12 && hours <= 16) {
  //     Speech('Good After Noon, Sir');
  //   } else if (hours >= 16 && hours <= 19) {
  //     Speech('Good Evening, Sir');
  //   } else Speech('Good Night, Sir');
  // $('#chatbox').keypress(function (event) {
  //   if (event.which == 13) {
  //     event.preventDefault();
  //     send();
  //   }
  // });
  // $('#rec').click(function (event) {
  //   switchRecognition();
  // });
});
var talking = true;
function Speech(say) {
  if ('speechSynthesis' in window && talking) {
    var utterance = new SpeechSynthesisUtterance(say);
    //msg.voice = voices[10]; // Note: some voices don't support altering params
    //msg.voiceURI = 'native';
    //utterance.volume = 1; // 0 to 1
    //utterance.rate = 0.1; // 0.1 to 10
    utterance.pitch = 0; //0 to 2
    //utterance.text = 'Hello World';
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  }
}
var chat = {
  messageToSend: '',
  messageResponses: [
    'Why did the web developer leave the restaurant? Because of the table layout.',
    'How do you comfort a JavaScript bug? You console it.',
    'An SQL query enters a bar, approaches two tables and asks: "May I join you?"',
    'What is the most used language in programming? Profanity.',
    'What is the object-oriented way to become wealthy? Inheritance.',
    'An SEO expert walks into a bar, bars, pub, tavern, public house, Irish pub, drinks, beer, alcohol',
  ],
  init: function () {
    this.cacheDOM();
    this.bindEvents();
    this.render();
  },
  cacheDOM: function () {
    this.$chatHistory = $('.chat-history');
    this.$button = $('button');
    this.$textarea = $('#message-to-send');
    this.$chatHistoryList = this.$chatHistory.find('ul');
  },
  bindEvents: function () {
    this.$button.on('click', this.addMessage.bind(this));
    this.$textarea.on('keyup', this.addMessageEnter.bind(this));
  },
  render: function () {
    this.scrollToBottom();
    if (this.messageToSend.trim() !== '') {
      var template = Handlebars.compile($('#message-template').html());
      var context = {
        messageOutput: this.messageToSend,
        time: this.getCurrentTime(),
      };

      this.$chatHistoryList.append(template(context));
      this.scrollToBottom();
      this.$textarea.val('');

      // responses
      var templateResponse = Handlebars.compile(
        $('#message-response-template').html()
      );
      var contextResponse = {
        response: this.getRandomItem(this.messageResponses),
        time: this.getCurrentTime(),
      };

      setTimeout(
        function () {
          this.$chatHistoryList.append(templateResponse(contextResponse));
          this.scrollToBottom();
        }.bind(this),
        1500
      );
    }
  },

  addMessage: function () {
    this.messageToSend = this.$textarea.val();
    this.render();
  },
  addMessageEnter: function (event) {
    // enter was pressed
    if (event.keyCode === 13) {
      this.addMessage();
    }
  },
  scrollToBottom: function () {
    this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
  },
  getCurrentTime: function () {
    return new Date()
      .toLocaleTimeString()
      .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');
  },
  getRandomItem: function (arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  },
};
