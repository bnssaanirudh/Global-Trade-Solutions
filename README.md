
---

# 🌍 GlobalTrade Solutions | Intelligent Business Analytics

**GlobalTrade Solutions** is a comprehensive Business Intelligence (BI) prototype designed to bridge the gap between structured operational metrics and unstructured market sentiment. By integrating **Machine Learning**, **Natural Language Processing (NLP)**, and **Time Series Forecasting**, this platform empowers stakeholders to move from reactive reporting to proactive decision-making.

---

## 🎯 Project Overview

In the modern logistics landscape, financial reports alone do not explain the "why" behind performance trends. This project solves that problem by fusing:

1. **Quantitative Data:** Sales, logistics, and operational KPIs.
2. **Qualitative Data:** News sentiment, market trends, and customer feedback.

**Core Objective:** To transform raw, complex supply chain data into clear, actionable intelligence via an interactive dashboard.

---

## ⚡ Key Features

### 🧠 1. Hybrid Sentiment Analysis Engine

* **Technology:** Python (VADER + TextBlob) + Custom Heuristics.
* **Function:** Analyzes news headlines and articles to quantify market sentiment.
* **Innovation:** Goes beyond simple "Positive/Negative" labels by assigning an **Intensity Score (0-10)** to gauge potential business impact.

### 👥 2. ML-Powered Customer Segmentation

* **Technology:** Scikit-learn (K-Means Clustering).
* **Function:** Automatically groups customers based on *Acquisition Cost* vs. *Order Value*.
* **Outcome:** Identifies "High-Value," "Standard," and "At-Risk" segments for targeted strategy.

### 📈 3. Predictive Analytics & Forecasting

* **Technology:** Time Series Modeling.
* **Function:** Analyzes historical shipment data to predict future logistics volumes.
* **Outcome:** Provides 6-month forward-looking trends with confidence intervals to aid inventory planning.

### 🖥️ 4. Interactive BI Dashboard

* **Technology:** Chart.js, HTML5, CSS3.
* **Function:** A unified "Command Center" view.
* **Views:**
* **Financial KPIs:** Revenue, Margins, Net Profit.
* **Operational KPIs:** On-Time Delivery (OTD), Cycle Time.
* **Strategic KPIs:** Customer Satisfaction (CSAT), Market Share.
* **News Analysis:** Real-time feed of industry-relevant news with sentiment tags.



---

## 🏗️ System Architecture

The system follows a modular pipeline approach:

1. **Data Ingestion (ETL):** Aggregates data from CSVs (Shipments, Customers) and External APIs (News API).
2. **Preprocessing:** Tokenization, cleaning, and normalization of text and time-series data.
3. **Analytics Core (Python):**
* *Sentiment Module:* Lexicon & Rule-based processing.
* *Clustering Module:* K-Means Algorithm.
* *Forecasting Module:* Regression/Time-series logic.


4. **Backend (Node.js):** Orchestrates data flow and serves API endpoints.
5. **Visualization (Frontend):** Renders dynamic charts and enables user interaction.

---

## 📸 Dashboard Preview

| **Executive Overview** |
| --- |
|  |
| *Real-time snapshot of Company Profile, Key Metrics, and Predictive Summaries.* |
<img width="1848" height="919" alt="image" src="https://github.com/user-attachments/assets/8f3d7eb8-b8ad-4e13-a6c5-6ff094a8056a" />
<img width="1845" height="924" alt="image" src="https://github.com/user-attachments/assets/a5424072-22dd-4ca0-9771-c31c08d41659" />
<img width="1859" height="921" alt="image" src="https://github.com/user-attachments/assets/927f5fcb-9cfe-4521-a7c9-fc2624c88289" />

---

## 🛠️ Tech Stack

### **Frontend**

* **HTML5 / CSS3:** Responsive, dark-mode "Cyberpunk/Corporate" UI.
* **JavaScript (ES6+):** Dynamic DOM manipulation.
* **Chart.js:** Rendering interactive Line, Bar, Doughnut, and Radar charts.

### **Backend**

* **Node.js & Express.js:** Server-side logic and API routing.
* **File System (fs):** Handling CSV and JSON data storage.

### **Data Science & ML (Python)**

* **Pandas & NumPy:** Data manipulation and numerical analysis.
* **Scikit-learn:** K-Means Clustering implementation.
* **TextBlob & VADER:** NLP and Sentiment Analysis.
* **News API:** External data source for real-time market context.

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v14 or higher)
* **Python** (v3.8 or higher)
* **Pip** (Python Package Installer)

### Installation

1. **Clone the Repository**
```bash
git clone https://github.com/your-username/global-trade-solutions.git
cd global-trade-solutions

```


2. **Install Node.js Dependencies**
```bash
npm install

```


3. **Install Python Dependencies**
```bash
pip install pandas numpy scikit-learn textblob vadersentiment requests

```


4. **Configure API Keys**
* Create a `.env` file or `config.js` (depending on your setup) and add your NewsAPI key:
* `NEWS_API_KEY=your_api_key_here`


5. **Run the Application**
* Start the backend server:
```bash
node server.js

```


* Open your browser and navigate to:
`http://localhost:3000`



---

## 📂 Project Structure

```bash
GlobalTrade-Solutions/
├── public/                 # Static assets (CSS, Client-side JS, Images)
├── data/                   # Raw Datasets (CSV) & Processed JSON
│   ├── shipment.csv
│   ├── customer.csv
│   └── logistics_performance.csv
├── scripts/                # Python Analytics Scripts
│   ├── sentiment_analysis.py
│   ├── clustering.py
│   └── forecasting.py
├── views/                  # HTML Templates
├── server.js               # Main Entry Point (Express App)
├── package.json            # Node Dependencies
└── requirements.txt        # Python Dependencies

```

---

## 👥 Contributors

* **Agasthya Anirudh** (23MID0054) - *Lead Developer & Architect*


### 🌟 Acknowledgments

Special thanks to the open-source community for providing the tools (Chart.js, Scikit-learn) that made this prototype possible.
