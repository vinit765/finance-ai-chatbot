from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import google.generativeai as genai
import yfinance as yf
import re

# Configure Flask & SocketIO
app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configure Gemini API
genai.configure(api_key="your_actual_gemini_api_key_here")
MODEL_NAME = "gemini-2.0-flash"

# Function to get Gemini AI response
def gemini_finance_chatbot(prompt):
    model = genai.GenerativeModel(MODEL_NAME)
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error: {e}"

# Function to fetch stock prices
def get_stock_price(ticker):
    try:
        stock = yf.Ticker(ticker)
        data = stock.history(period="1d")
        if not data.empty:
            return f"The current stock price of {ticker.upper()} is **${data['Close'].iloc[-1]:.2f}**."
        else:
            return "No stock data found. Please check the ticker symbol."
    except Exception as e:
        return f"Error fetching stock price: {e}"

# Extract ticker symbol from user input
def extract_ticker(user_input):
    possible_tickers = re.findall(r"\b[A-Z]{2,5}\b", user_input)  # Extract capitalized words (potential tickers)
    for ticker in possible_tickers:
        stock = yf.Ticker(ticker)
        if stock.history(period="1d").empty is False:  # Validate ticker
            return ticker
    return None

# WebSocket event handler for real-time chat
@socketio.on("user_message")
def handle_message(data):
    user_input = data["message"]  # Don't convert to lowercase to preserve tickers

    # Check if the user is asking for a stock price
    if "stock price" in user_input.lower() or "actual price of" in user_input.lower():
        ticker = extract_ticker(user_input)  # Extract ticker properly

        if ticker:
            response = get_stock_price(ticker)
        else:
            response = "I couldn't detect a valid stock ticker. Please provide a symbol like **AAPL** or **NVDA**."
    
    else:
        response = gemini_finance_chatbot(user_input)  # Default to Gemini AI

    emit("bot_response", {"message": response})  # Send response back to frontend

# Route to serve the frontend
@app.route("/")
def index():
    return render_template("index.html")

# Run the Flask app
if __name__ == "__main__":
    socketio.run(app, debug=True)
