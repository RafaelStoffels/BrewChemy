from flask import Blueprint, request, jsonify
from AuthTokenVerifier import token_required
import openai
import os

class ChatGPT:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def get_response(self, message: str) -> str:
        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You will objectively critique the recipe in three lines."},
                    {"role": "user", "content": message}
                ]
            )
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"Error communicating with ChatGPT: {str(e)}"

# Criação da rota POST que recebe dados da API do front-end
def openai_route():
    openai_bp = Blueprint("recipe", __name__)

    # Cria a rota POST para o ChatGPT
    @openai_bp.route('/openAI', methods=['POST'])
    @token_required
    def openai(current_user_id):
        recipe = request.json.get("message")
        
        if not recipe:
            return jsonify({"error": "No recipe provided"}), 400

        try:
            api_key = os.getenv('OPENAI_API_KEY')
            print(api_key)
            # Instancia a classe ChatGPT e chama o método get_response
            chatgpt = ChatGPT(api_key=api_key)
            chat_response = chatgpt.get_response(recipe)

            # Retorna a resposta gerada pela API do ChatGPT para o front-end
            return jsonify({"response": chat_response})

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    return openai_bp