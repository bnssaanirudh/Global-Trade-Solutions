// server.js

// --- 1. Import necessary libraries ---
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const csv = require('csv-parser');
const { spawn } = require('child_process');

// --- 2. Setup the Express App ---
const app = express();
const PORT = 3000;
const JSON_DATA_FILE = path.join(__dirname, 'import_export_bi_data.json');
const SHIPMENT_DATA_FILE = path.join(__dirname, 'shipment.csv');
const CUSTOMER_DATA_FILE = path.join(__dirname, 'customer.csv');

// --- 3. Configure Middleware & Routes ---
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

app.use(express.static(__dirname));

// --- 4. Helper Functions ---

function readCsvFile(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
}

function runPythonScript(scriptPath) {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python', [scriptPath]);
        let data = '';
        let error = '';
        pythonProcess.stdout.on('data', (chunk) => data += chunk);
        pythonProcess.stderr.on('data', (chunk) => error += chunk);
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Python script ${scriptPath} exited with code ${code}: ${error}`));
            }
            if (!data && error) {
                 return reject(new Error(`Python script ${scriptPath} ran successfully but produced no data. Stderr: ${error}`));
            }
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                reject(new Error(`Failed to parse JSON from ${scriptPath}: ${e.message}. Raw output: ${data}`));
            }
        });
    });
}


// --- 5. Main API Endpoint ---
app.get('/api/data', async (req, res) => {
    try {
        console.log("Received request for /api/data");
        const [baseData, shipmentData, customerData] = await Promise.all([
            fs.promises.readFile(JSON_DATA_FILE, 'utf8').then(JSON.parse),
            readCsvFile(SHIPMENT_DATA_FILE),
            readCsvFile(CUSTOMER_DATA_FILE)
        ]);

        let data = { ...baseData };

        console.log("Running Python analysis scripts...");
        const [analyzedNews, customerAnalysis] = await Promise.all([
            runPythonScript('newsanalyzer.py'),
            runPythonScript('customer_analyzer.py')
        ]);
        console.log("Python scripts finished.");

        // --- Data Processing for KPIs ---
        const totalRevenue = customerData.reduce((acc, row) => acc + parseFloat(row.order_value_usd || 0), 0);
        const onTimeDeliveries = shipmentData.filter(s => s.delivery_status === 'On-Time').length;
        const onTimeDeliveryRate = (onTimeDeliveries / shipmentData.length) * 100;
        
        // --- MODIFICATION: Changed 'freight_cost_usd' to 'freight_cost' ---
        const totalFreightCost = shipmentData.reduce((acc, s) => acc + parseFloat(s.freight_cost || 0), 0);
        
        const costPerShipment = totalFreightCost / shipmentData.length;
        const averageClearanceTime = shipmentData.reduce((acc, s) => acc + parseFloat(s.customs_clearance_time_days || 0), 0) / shipmentData.length;
        const totalAcquisitionCost = customerData.reduce((acc, c) => acc + parseFloat(c.acquisition_cost_usd || 0), 0);
        const customerROI = totalAcquisitionCost > 0 ? ((totalRevenue - totalAcquisitionCost) / totalAcquisitionCost) * 100 : 0;
        const averageSatisfactionScore = customerData.reduce((acc, c) => acc + parseInt(c.satisfaction_score || 0), 0) / customerData.length;

        const updateKpi = (category, name, value, unit) => {
            if (data.kpis && data.kpis[category] && data.kpis[category][name]) {
                data.kpis[category][name].value = value;
                if (unit) {
                    data.kpis[category][name].unit = unit;
                }
            } else {
                console.warn(`Warning: KPI path not found - ${category} -> ${name}`);
            }
        };

        updateKpi('Financial KPIs', 'Revenue Growth', parseFloat((totalRevenue / 1000000).toFixed(1)), 'M USD');
        updateKpi('Financial KPIs', 'Cost Per Shipment', parseFloat(costPerShipment.toFixed(2)), 'USD');
        updateKpi('Financial KPIs', 'ROI', parseFloat(customerROI.toFixed(1)), '%');
        updateKpi('Operational KPIs', 'On-Time Delivery Rate', parseFloat(onTimeDeliveryRate.toFixed(1)), '%');
        updateKpi('Operational KPIs', 'Avg. Customs Clearance', parseFloat(averageClearanceTime.toFixed(1)), 'days');
        updateKpi('Strategic KPIs', 'Customer Satisfaction Score', parseFloat(averageSatisfactionScore.toFixed(1)), '/ 5');

        data.news_analysis = analyzedNews;
        data.customer_insights = customerAnalysis; 

        res.json(data);
        console.log(`Successfully processed data, analyzed news, and customer insights.`);

    } catch (error) {
        console.error('Error in /api/data endpoint:', error);
        res.status(500).json({ message: 'Error reading or processing data files on the server.' });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        const newData = req.body;
        await fs.promises.writeFile(JSON_DATA_FILE, JSON.stringify(newData, null, 2), 'utf8');
        res.json({ message: 'Base data template saved successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error writing data file.' });
    }
});

// --- 6. Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

