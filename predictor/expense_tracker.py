# filepath: /C:/Users/Admin/Desktop/expense tracker app/ExpenseTracker/predictor/expense_Tracker.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from prophet import Prophet
import pandas as pd
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Function to preprocess and predict expenses
def predict_expenses(data):
    # Extract 'createdAt' and 'amount' from incoming data
    df = pd.DataFrame(data)
    df = df[['createdAt', 'amount']].rename(columns={'createdAt': 'ds', 'amount': 'y'})
    
    # Convert 'ds' column to datetime
    df['ds'] = pd.to_datetime(df['ds'])
    
    # Initialize Prophet model
    model = Prophet()

    # Fit the model
    model.fit(df)

    # Create future dates for prediction (predicting for the current day)
    future = model.make_future_dataframe(periods=1)
    
    # Make prediction
    forecast = model.predict(future)

    # Extract the predicted expense for the current date
    predicted_expense = forecast.loc[forecast['ds'] == future['ds'].iloc[-1], 'yhat'].values[0]
    
    return predicted_expense

@app.route('/predict-expense', methods=['POST'])
def predict_expense_endpoint():
    print("Request received")
    try:
        # Get data from the frontend
        incoming_data = request.json  
        print("incoming_data: ", incoming_data)
        
        # Predict the expense
        predicted_expense = predict_expenses(incoming_data)
        
        # Respond with the prediction
        print("Prediction successful")
        print("predicted_expense: ", predicted_expense)
        return jsonify({"predicted_expense": predicted_expense}), 200
    
    except Exception as e:
        # Handle errors and respond
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)