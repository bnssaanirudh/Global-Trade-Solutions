import pandas as pd
import json
import sys
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Helper class to convert NumPy types to native Python types for JSON serialization
class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NpEncoder, self).default(obj)

def analyze_customer_data():
    """
    Performs customer segmentation and analyzes trade routes.
    """
    try:
        # --- 1. Customer Segmentation ---
        customer_df = pd.read_csv('customer.csv')
        features = customer_df[['order_value_usd', 'satisfaction_score', 'lead_time_days']].copy()
        features.dropna(inplace=True)
        
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
        features['cluster'] = kmeans.fit_predict(features_scaled)
        
        segmentation_data = [{
            'x': row['order_value_usd'],
            'y': row['satisfaction_score'],
            'cluster': int(row['cluster'])
        } for _, row in features.iterrows()]
            
        # --- 2. Trade Route Analysis ---
        shipment_df = pd.read_csv('shipment.csv')
        
        # --- MODIFICATION ---
        # Clean the data by stripping whitespace from relevant columns to ensure accurate matching.
        shipment_df['type'] = shipment_df['type'].str.strip()
        shipment_df['origin'] = shipment_df['origin'].str.strip()
        shipment_df['O_Country'] = shipment_df['O_Country'].str.strip()

        # Correctly filter by both origin city and country
        primary_origin_city = 'Mumbai'
        primary_origin_country = 'India'
        
        export_routes = shipment_df[
            (shipment_df['type'] == 'Export') & 
            (shipment_df['origin'] == primary_origin_city) & 
            (shipment_df['O_Country'] == primary_origin_country)
        ]
        
        popular_destinations = export_routes['destination'].value_counts().nlargest(5)
        
        trade_route_data = {
            'labels': popular_destinations.index.tolist(),
            'data': popular_destinations.values.tolist()
        }

        # --- 3. Combine and Output JSON ---
        final_output = {
            "customer_segmentation": segmentation_data,
            "trade_route_analysis": trade_route_data
        }
        
        # Use the custom NpEncoder to handle NumPy data types
        print(json.dumps(final_output, cls=NpEncoder))

    except FileNotFoundError as e:
        print(json.dumps({"error": f"Data file not found: {e.filename}"}), file=sys.stderr)
    except Exception as e:
        print(json.dumps({"error": f"An error occurred in customer analysis: {str(e)}"}), file=sys.stderr)

if __name__ == "__main__":
    analyze_customer_data()

