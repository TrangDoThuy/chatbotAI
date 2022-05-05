from transformers import AutoModelForCausalLM, AutoTokenizer
import torch


tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")


# encode the new user input, add the eos_token and return a tensor in Pytorch
new_user_input_ids = tokenizer.encode("hi there" + tokenizer.eos_token, return_tensors='pt')

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

    # generated a response while limiting the total chat history to 1000 tokens
    chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)

    output = tokenizer.decode(chat_history_ids[:, bot_input_ids.shape[-1]:][0], skip_special_tokens=True)

    return output, chat_history_ids

output,chat_history_ids = generate_answer("how are you",chat_history_ids)
print(output)
output,chat_history_ids = generate_answer("I am coding, what are you doing",chat_history_ids)
print(output)