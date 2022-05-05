from xml.parsers.expat import model
from flask import Flask, render_template, url_for, request, redirect
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

from transformers import AutoModelForCausalLM, AutoTokenizer
import torch

########################
# pretrained model
# to be used
tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")

input_str= "Established in 1991, The Hong Kong University of Science and Technology (HKUST) is an international research university dedicated to top-notch education and research. Founded on its mission to advance learning and knowledge through teaching and research particularly in science, technology, engineering, management and business studies complemented by humanities and social sciences, as well as assisting in Hong Kong’s socioeconomic development, this young and ambitious University has gone beyond the wildest dreams of many, climbing high in international esteem and reaping numerous honors and accolades. In 2021, HKUST is ranked 27th among 1000 universities and no.2 in the world’s top 50 Universities Under 50 by QS. With respect to individual Schools, HKUST also puts in a strong performance. The School of Engineering is named No. 20 amongst world’s top 500 engineering and technology universities by QS Rankings published in 2019. It is ranked No. 2 in Greater China. Its much sought-after Kellogg-HKUST Executive MBA (EMBA) program, amid high expectations, also topped the Financial Times EMBA global rankings for ten times from 2007 - 2020. Hailed widely as a ‘miracle’, the stunning achievements of HKUST do not come about miraculously. They boil down to the University’s positioning as a focused elite research university; its strong ties to global institutions and wide-ranging connections with Mainland China; the championing of interdisciplinary studies; its dedication to educating well-rounded students who flourish in today’s world, strong in entrepreneurial spirits and innovative in thinking; its mission to be a global premier knowledge hub, crystallized in the Institute of Advanced Study; and, last but not least, a spectacular setting by the sea that makes the University an attractive location for the pursuit of intellectual and academic excellence. Furthering its mission of providing holistic education to its students, the University welcomed the new Shaw Auditorium in Fall 2021. It became the home to its cultural activities and a new landmark for large scale events, providing new flexibilities and possibilities to create a vibrant arts and cultural scene on campus. Keen on curating a diversified and international learning environment, HKUST is now home to over 16,000 students spanning more than 80 countries over five continents. Whereas world’s amazing talents are flocking to the campus for an eclectic educational experience, students enrolled are earnest in expanding their horizons by joining the University’s varied exchange programs, which now include over 300 partners worldwide. An international mix of students aside, HKUST also lives up to its promise as a stronghold of cutting-edge research and magnet for distinguished academics and influential thinkers. HKUST has consistently achieved the highest success rate in the Research Grant’s Council’s annual competitive General Research Fund exercise, which reaches 45% in 2019-2020. The University sees a total of 42 faculty named Fellows of the Institute of Electrical and Electronics Engineers (IEEE), which is among the highest in Hong Kong. In 2011, its faculty reaped five State Science and Technology Awards, which are among the most prestigious awards in science and technology conferred by the State Council of the People's Republic of China, the largest share among local tertiary institutions. In addition to the six Chinese Academy of Sciences academicians at HKUST, nine faculty members also entered the National Science and Technology Programs Expert Database."
# encode the new user input, add the eos_token and return a tensor in Pytorch
new_user_input_ids = tokenizer.encode(input_str + tokenizer.eos_token, return_tensors='pt')

# append the new user input tokens to the chat history
bot_input_ids = new_user_input_ids

# generated a response while limiting the total chat history to 1000 tokens, 
chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

def generate_answer(input,chat_history_ids):

    input_str = input + tokenizer.eos_token
    # encode the new user input, add the eos_token and return a tensor in Pytorch
    new_user_input_ids = tokenizer.encode(input_str, return_tensors='pt')

    # append the new user input tokens to the chat history
    bot_input_ids = torch.cat([chat_history_ids, new_user_input_ids], dim=-1) 
    #bot_input_ids = new_user_input_ids

    # generated a response while limiting the total chat history to 1000 tokens
    chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

    output = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)

    return output, chat_history_ids

#########################
# Build database 

application = Flask(__name__)
application.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(application)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.String(200),nullable=False)
    time_created = db.Column(db.DateTime, default=datetime.utcnow)
    user_name = db.Column(db.String(200),nullable=False)

    def __repr__(self):
        return '<Message %r>' %self.id

########################
# routers
@application.route('/',methods=['GET','POST'])
def start():
    if request.method == 'POST':
        task_content = request.form['chat']
        message_ask = Message(content=task_content,user_name="user")
        global chat_history_ids
        output,chat_history_ids = generate_answer(task_content,chat_history_ids)
        message_answer = Message(content = output, user_name="bot")
        
        try:
            db.session.add(message_ask)
            db.session.add(message_answer)
            db.session.commit()
            messages = Message.query.order_by(Message.time_created).all()
            return render_template('chat_room.html',messages = messages)
        except:
            return 'Cannot send message'

    else:
        messages = Message.query.order_by(Message.time_created).all()
    return render_template('index.html',messages = messages)
@application.route('/chat-room',methods=["POST","GET"])
def chat():
    if request.method == 'POST':
        task_content = request.form['chat']
        message_ask = Message(content=task_content,user_name="user")
        global chat_history_ids
        output,chat_history_ids = generate_answer(task_content,chat_history_ids)
        message_answer = Message(content = output, user_name="bot")
        try:
            db.session.add(message_ask)
            db.session.add(message_answer)
            db.session.commit()
            messages = Message.query.order_by(Message.time_created).all()
            return render_template('chat_room.html',messages = messages)
        except:
            return 'Cannot send message'

    else:
        messages = Message.query.order_by(Message.time_created).all()
        return render_template('chat_room.html',messages = messages)

if __name__ == '__main__':
    application.run(debug=True)