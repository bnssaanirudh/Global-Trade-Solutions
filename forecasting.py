import pandas as pd
import json
import sys
import numpy as np
from statsmodels.tsa.statespace.sarimax import SARIMAX
import warnings

# Ignore warnings from SARIMAX for cleaner output
warnings.filterwarnings("ignore")

def generate_forecast():
    """
    Generates a 6-month sales forecast using a SARIMA model.
    """
    try:
        # --- 1. Load and Prepare Data ---
        df = pd.read_csv('shipment.csv')
        
        # Convert 'date' column to datetime objects
        df['date'] = pd.to_datetime(df['date'])
        
        # Set the 'date' as the index of the dataframe
        df.set_index('date', inplace=True)
        
        # Resample the data to get the total shipment value for each month
        monthly_sales = df['value'].resample('M').sum()

        # --- 2. Train the SARIMA Model ---
        # The (p,d,q) and (P,D,Q,m) orders are hyperparameters for the model.
        # These are common starting points for monthly seasonal data (m=12).
        model = SARIMAX(monthly_sales,
                        order=(1, 1, 1),
                        seasonal_order=(1, 1, 1, 12),
                        enforce_stationarity=False,
                        enforce_invertibility=False)
        
        results = model.fit(disp=False)

        # --- 3. Generate Forecast ---
        # Forecast the next 6 steps (months)
        forecast = results.get_forecast(steps=6)
        
        # Get the predicted values
        forecast_values = forecast.predicted_mean
        
        # Get the confidence intervals (the upper and lower bounds of the forecast)
        confidence_intervals = forecast.conf_int()

        # --- 4. Format Output for Chart.js ---
        # Create user-friendly labels for the forecast period (e.g., 'Oct 2025')
        forecast_labels = forecast_values.index.strftime('%b %Y').tolist()

        final_output = {
            "labels": forecast_labels,
            "forecast_data": forecast_values.tolist(),
            "confidence_lower": confidence_intervals.iloc[:, 0].tolist(),
            "confidence_upper": confidence_intervals.iloc[:, 1].tolist()
        }
        
        print(json.dumps(final_output))

    except FileNotFoundError:
        print(json.dumps({"error": "shipment.csv not found."}), file=sys.stderr)
    except Exception as e:
        # Provide a more detailed error for easier debugging
        print(json.dumps({"error": f"An error occurred during forecasting: {str(e)}"}), file=sys.stderr)

if __name__ == "__main__":
    generate_forecast()
