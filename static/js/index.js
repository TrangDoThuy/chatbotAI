'use strict';

var c, ctx, w, h, particles, nextframe;

(function () {
  Math.randomInt = function (min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  };
  Math.randomDec = function (min, max, decimals) {
    return (Math.random() * (max - min) + min).toFixed(decimals || 2);
  };
  Math.randomList = function (list) {
    return list[Math.randomInt(0, list.length)];
  };
})();
function init() {
  c = document.getElementById('c');
  c.width = w = window.innerWidth;
  c.height = h = window.innerHeight;
  ctx = c.getContext('2d');

  particles = [];
  for (var i = 0; i < 300; i++) {
    particles[i] = new Particle();
    particles[i].init();
  }

  loop();
}

function loop() {
  for (var i = 0; i < particles.length; i++) {
    if (particles[i].isOut()) {
      particles[i].init();
    }
    particles[i].clear();
  }
  for (var i = 0; i < particles.length; i++) {
    particles[i].update();
    particles[i].draw();
  }

  nextframe = requestAnimationFrame(loop);
}

function Particle() {
  this.alive = false;

  this.init = function () {
    this.x = w / 2;
    this.y = h / 2;
    this.r = Math.randomInt(4, 8);
    this.a = Math.randomDec(0, 2 * Math.PI);
    this.s = Math.randomDec(0.2, 2);
    this.c = Math.randomList(['tomato', 'gray', 'orange']);
    this.alive = true;
  };
}

Particle.prototype.kill = function () {
  this.alive = false;
};

Particle.prototype.isOut = function () {
  return (
    this.x + this.r < 0 ||
    this.x - this.r > w ||
    this.y + this.r < 0 ||
    this.y - this.r > h
  );
};

Particle.prototype.update = function () {
  this.x += Math.cos(this.a) * this.s;
  this.y += Math.sin(this.a) * this.s;
};

Particle.prototype.clear = function () {
  ctx.clearRect(
    this.x - this.r - 1,
    this.y - this.r - 1,
    2 * this.r + 2,
    2 * this.r + 2
  );
};

Particle.prototype.draw = function () {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
  ctx.fillStyle = this.c;
  ctx.fill();
};

init();

window.addEventListener('resize', function () {
  cancelAnimationFrame(nextframe);
  init();
});
var accessToken = '326a6c78dc86439ba21c9cf3cb8a0cf0';
var baseUrl = 'https://api.api.ai/v1/';
var talking = true;
var nlp = window.nlp_compromise;
$(document).ready(function () {
  $('#chatbox').focus();
  var dt = new Date();
  var hours = dt.getHours();
  if (hours >= 4 && hours <= 12) {
    Speech('Good Morning, Sir');
  } else if (hours >= 12 && hours <= 16) {
    Speech('Good After Noon, Sir');
  } else if (hours >= 16 && hours <= 19) {
    Speech('Good Evening, Sir');
  } else Speech('Good Night, Sir');
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
var recognition;
function startRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.onstart = function (event) {
    updateRec();
  };
  recognition.onresult = function (event) {
    var text = '';
    for (var i = event.resultIndex; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
    }
    setInput(text);
    stopRecognition();
  };
  recognition.onend = function () {
    stopRecognition();
  };
  recognition.lang = 'en-US';
  recognition.start();
}

function stopRecognition() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  updateRec();
}
function switchRecognition() {
  if (recognition) {
    stopRecognition();
  } else {
    startRecognition();
  }
}
function setInput(text) {
  $('#chatbox').val(text);
  send();
}
function updateRec() {
  $('#rec').text(recognition ? 'Stop' : 'Speak');
}
function send() {
  var text = $('#chatbox').val();
  $('#chatbox').val('');
  $.ajax({
    type: 'POST',
    url: baseUrl + 'query?v=20150910',
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
    headers: {
      Authorization: 'Bearer ' + accessToken,
    },
    data: JSON.stringify({
      query: text,
      lang: 'en',
      sessionId: 'somerandomthing',
    }),
    success: function (data) {
      setResponse('hihi');
      // setResponse(data.result.fulfillment.speech);
    },
    error: function () {
      setResponse('Internal Server Error');
    },
  });
}
function setResponse(val) {
  Speech(val);
}
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
