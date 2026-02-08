// app.js

// This variable will hold the data fetched from the server.
// The large, hardcoded appData object has been removed.
let appData = {};

// Chart instances
let charts = {};

// --- MODIFIED INITIALIZATION ---
// The application now starts by fetching data from the server.
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(fetchedData => {
            // Once data is successfully fetched, store it in our appData variable
            appData = fetchedData;
            // Now that we have the data, initialize the rest of the dashboard
            initializeApp();
        })
        .catch(error => {
            console.error("Error loading data from server for index.html:", error);
            // Display an error message directly on the page if data fails to load
            document.body.innerHTML = `<div style="padding: 2rem; text-align: center; font-family: sans-serif;">
                <h1 style="color: #b91c1c; font-size: 1.5rem;">Failed to load dashboard data.</h1>
                <p style="color: #374151;">Please make sure the backend server is running.</p>
                <p style="color: #6b7280;">Error: ${error.message}</p>
            </div>`;
        });
});

// This function now runs *after* the data has been fetched.
function initializeApp() {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    initializeNavigation();
    updateAlertStatus();
    renderOverview();
    renderKPISections();
    renderNewsAnalysis();
    renderCrisisManagement();
    renderPredictions();
    renderCharts();
    renderCustomerSegmentationChart();
    renderTradeRouteChart();
}

// All the functions below this line are the same as before,
// as they correctly use the global 'appData' variable.

// Date and time updates
function updateDateTime() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
    };
    const dateTimeString = now.toLocaleDateString('en-US', options) + ' IST';
    document.getElementById('datetime').textContent = dateTimeString;
}

// Navigation handling - Fixed version
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.sidebar__link');
    const sections = document.querySelectorAll('.section');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionName = this.getAttribute('data-section');
            const targetSectionId = sectionName + '-section';
            
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            this.classList.add('active');
            
            const targetSection = document.getElementById(targetSectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Alert status update
function updateAlertStatus() {
    const alertIndicator = document.getElementById('alertIndicator');
    const alertText = document.getElementById('alertText');
    const alertDot = alertIndicator.querySelector('.alert-dot');
    
    const status = appData.crisis_management.current_status;
    
    alertDot.className = `alert-dot ${status}`;
    
    switch(status) {
        case 'green':
            alertText.textContent = 'Normal Operations';
            break;
        case 'yellow':
            alertText.textContent = 'Monitor Closely';
            break;
        case 'red':
            alertText.textContent = 'Crisis Response';
            break;
    }
}

// Render overview section
function renderOverview() {
    renderCompanyProfile();
    renderKeyMetrics();
    renderQuickNews();
    renderPredictionsOverview();
}

function renderCompanyProfile() {
    const profileContainer = document.getElementById('companyProfile');
    const profile = appData.company_profile;
    
    profileContainer.innerHTML = `
        <div class="profile-item">
            <span class="profile-label">Company Type</span>
            <span class="profile-value">${profile.type}</span>
        </div>
        <div class="profile-item">
            <span class="profile-label">Established</span>
            <span class="profile-value">${profile.established}</span>
        </div>
        <div class="profile-item">
            <span class="profile-label">Headquarters</span>
            <span class="profile-value">${profile.headquarters}</span>
        </div>
        <div class="profile-item">
            <span class="profile-label">Employees</span>
            <span class="profile-value">${profile.employee_count}</span>
        </div>
        <div class="profile-item">
            <span class="profile-label">Annual Revenue</span>
            <span class="profile-value">$${(profile.annual_revenue / 1000000).toFixed(0)}M</span>
        </div>
        <div class="profile-item">
            <span class="profile-label">Markets</span>
            <span class="profile-value">${profile.markets_served.length} regions</span>
        </div>
    `;
}

function renderKeyMetrics() {
    const metricsContainer = document.getElementById('keyMetrics');
    const financialKPIs = appData.kpis['Financial KPIs'];
    const operationalKPIs = appData.kpis['Operational KPIs'];
    
    metricsContainer.innerHTML = `
        <div class="metric-item">
            <span class="metric-label">Revenue Growth</span>
            <span class="metric-value">${financialKPIs['Revenue Growth'].value}${financialKPIs['Revenue Growth'].unit}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">On-Time Delivery</span>
            <span class="metric-value">${operationalKPIs['On-Time Delivery Rate'].value}${operationalKPIs['On-Time Delivery Rate'].unit}</span>
        </div>
        <div class="metric-item">
            <span class="metric-label">Customer Satisfaction</span>
            <span class="metric-value">${appData.kpis['Strategic KPIs']['Customer Satisfaction Score'].value}${appData.kpis['Strategic KPIs']['Customer Satisfaction Score'].unit}</span>
        </div>
    `;
}

function renderQuickNews() {
    const newsContainer = document.getElementById('quickNews');
    const recentNews = appData.news_analysis.slice(0, 3);
    
    newsContainer.innerHTML = recentNews.map(news => `
        <div class="quick-news-item">
            <span class="quick-news-text">${news.headline}</span>
            <span class="impact-score">Impact: ${news.impact_score}/10</span>
        </div>
    `).join('');
}

function renderPredictionsOverview() {
    const predictionsContainer = document.getElementById('predictionsOverview');
    const forecast = appData.predictive_insights.sales_forecast;
    
    predictionsContainer.innerHTML = `
        <div class="prediction-item">
            <span class="prediction-label">Next Month Sales Growth</span>
            <span class="prediction-value">+${forecast.next_month.prediction}%</span>
        </div>
        <div class="prediction-item">
            <span class="prediction-label">Next Quarter Growth</span>
            <span class="prediction-value">+${forecast.next_quarter.prediction}%</span>
        </div>
        <div class="prediction-item">
            <span class="prediction-label">Supply Chain Risk</span>
            <span class="prediction-value">High</span>
        </div>
    `;
}

// Render KPI sections
function renderKPISections() {
    renderKPISection('Financial KPIs', 'financialKPIs');
    renderKPISection('Operational KPIs', 'operationalKPIs');
    renderKPISection('Strategic KPIs', 'strategicKPIs');
}

function renderKPISection(category, containerId) {
    const container = document.getElementById(containerId);
    const kpis = appData.kpis[category];
    
    container.innerHTML = Object.entries(kpis).map(([name, data]) => {
        const progress = Math.min((data.value / data.target) * 100, 100);
        const progressClass = progress >= 90 ? 'success' : progress >= 70 ? 'warning' : 'error';
        const trendIcon = data.trend === 'up' ? '↗️' : data.trend === 'down' ? '↘️' : '➡️';
        
        return `
            <div class="kpi-card">
                <div class="kpi-header">
                    <h3 class="kpi-title">${name}</h3>
                    <span class="kpi-trend ${data.trend}">${trendIcon} ${data.trend}</span>
                </div>
                <div class="kpi-value">${data.value}${data.unit}</div>
                <div class="kpi-progress">
                    
                    <!-- MODIFIED SECTION BELOW -->
                    <div class="progress-label">
                        <span>Target: ${data.target} ${data.unit}</span> 
                        <span>Progress: ${progress.toFixed(0)}%</span>
                    </div>
                    <!-- END MODIFIED SECTION -->

                    <div class="progress-bar">
                        <div class="progress-fill ${progressClass}" style="width: ${progress}%"></div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}


// Render news analysis
function renderNewsAnalysis() {
    const newsContainer = document.getElementById('newsAnalysis');
    
    newsContainer.innerHTML = appData.news_analysis.map(news => {
        const sentimentClass = news.sentiment > 0.2 ? 'positive' : news.sentiment < -0.2 ? 'negative' : 'neutral';
        const sentimentText = news.sentiment > 0.2 ? 'Positive' : news.sentiment < -0.2 ? 'Negative' : 'Neutral';
        
        return `
            <div class="news-item">
                <div class="news-header">
                    <div class="news-info">
                        <h3 class="news-headline">${news.headline}</h3>
                    </div>
                    <div class="news-meta">
                        <div class="news-date">${formatDate(news.date)}</div>
                        <div class="news-source">${news.source}</div>
                        <div class="sentiment-badge sentiment-${sentimentClass}">${sentimentText}</div>
                    </div>
                </div>
                
                <div class="impact-predictions">
                    <div class="impact-item">
                        <div class="impact-label">Sales Impact</div>
                        <div class="impact-value">
                            <span class="impact-direction ${news.predicted_effects.sales.direction}">
                                ${getDirectionIcon(news.predicted_effects.sales.direction)}
                            </span>
                            <span>Magnitude: ${news.predicted_effects.sales.magnitude}/10</span>
                        </div>
                    </div>
                    <div class="impact-item">
                        <div class="impact-label">Customer Behavior</div>
                        <div class="impact-value">
                            <span class="impact-direction ${news.predicted_effects.customer_behavior.direction}">
                                ${getDirectionIcon(news.predicted_effects.customer_behavior.direction)}
                            </span>
                            <span>Magnitude: ${news.predicted_effects.customer_behavior.magnitude}/10</span>
                        </div>
                    </div>
                    <div class="impact-item">
                        <div class="impact-label">Workflow Impact</div>
                        <div class="impact-value">
                            <span class="impact-direction ${news.predicted_effects.workflow.direction}">
                                ${getDirectionIcon(news.predicted_effects.workflow.direction)}
                            </span>
                            <span>Magnitude: ${news.predicted_effects.workflow.magnitude}/10</span>
                        </div>
                    </div>
                </div>
                
                <div class="recommendations">
                    <h4>Recommended Actions:</h4>
                    <ul>
                        ${news.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }).join('');
}

// Render crisis management
function renderCrisisManagement() {
    const crisisContainer = document.getElementById('crisisDashboard');
    const crisis = appData.crisis_management;
    
    crisisContainer.innerHTML = `
        <div class="crisis-status">
            <div class="status-indicator">
                <div class="status-level ${crisis.current_status}">${crisis.current_status.toUpperCase()}</div>
                <p>Current Alert Level</p>
                <p class="alert-description">${crisis.alert_levels[crisis.current_status].description}</p>
            </div>
            
            <div class="active-alerts">
                <h3>Active Alerts</h3>
                ${crisis.active_alerts.map(alert => `
                    <div class="alert-item">
                        <div class="alert-content">
                            <h4>${alert.type} Alert</h4>
                            <p class="alert-message">${alert.message}</p>
                        </div>
                        <div class="severity-badge">${alert.severity.toUpperCase()}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Render predictions
function renderPredictions() {
    renderSalesForecast();
    renderRiskAssessment();
}

function renderSalesForecast() {
    const forecastContainer = document.getElementById('salesForecast');
    const forecast = appData.predictive_insights.sales_forecast;
    
    forecastContainer.innerHTML = `
        <div class="forecast-item">
            <span class="forecast-label">Next Month</span>
            <div class="forecast-value">
                <span>+${forecast.next_month.prediction}%</span>
                <span class="confidence-badge">${Math.round(forecast.next_month.confidence * 100)}% confidence</span>
            </div>
        </div>
        <div class="forecast-item">
            <span class="forecast-label">Next Quarter</span>
            <div class="forecast-value">
                <span>+${forecast.next_quarter.prediction}%</span>
                <span class="confidence-badge">${Math.round(forecast.next_quarter.confidence * 100)}% confidence</span>
            </div>
        </div>
    `;
}

function renderRiskAssessment() {
    const riskContainer = document.getElementById('riskAssessment');
    const risks = appData.predictive_insights.risk_assessment;
    
    riskContainer.innerHTML = Object.entries(risks).map(([category, risk]) => `
        <div class="risk-item">
            <span class="risk-label">${category.charAt(0).toUpperCase() + category.slice(1)} Risk</span>
            <div class="risk-value">
                <span class="risk-level ${risk.risk_level}">${risk.risk_level.toUpperCase()}</span>
                <span>${Math.round(risk.probability * 100)}% probability</span>
            </div>
        </div>
    `).join('');
}

// Render charts
function renderCharts() {
    // Use setTimeout to ensure DOM elements are ready
    setTimeout(() => {
        renderFinancialChart();
        renderOperationalChart();
        renderStrategicChart();
        renderPredictiveChart();
    }, 100);
}

function renderFinancialChart() {
    const ctx = document.getElementById('financialChart');
    if (!ctx) return;
    
    charts.financial = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Revenue Growth (%)',
                data: [8.2, 9.5, 10.1, 11.3, 12.0, 12.5],
                borderColor: '#1FB8CD',
                backgroundColor: 'rgba(31, 184, 205, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Gross Margin (%)',
                data: [26.5, 27.2, 27.8, 28.0, 28.2, 28.3],
                borderColor: '#FFC185',
                backgroundColor: 'rgba(255, 193, 133, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', } }, scales: { y: { beginAtZero: true } } }
    });
}

function renderOperationalChart() {
    const ctx = document.getElementById('operationalChart');
    if (!ctx) return;
    
    charts.operational = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['On-Time Delivery', 'Order Fill Rate', 'Documentation Accuracy'],
            datasets: [{
                label: 'Current Performance (%)',
                data: [94.2, 97.8, 98.5],
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 1
            }, {
                label: 'Target (%)',
                data: [96.0, 98.0, 99.0],
                backgroundColor: 'rgba(180, 65, 60, 0.3)',
                borderColor: '#B4413C',
                borderWidth: 2,
                type: 'line'
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });
}

function renderStrategicChart() {
    const ctx = document.getElementById('strategicChart');
    if (!ctx) return;
    
    charts.strategic = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Market Share', 'Customer Satisfaction', 'Supplier Performance'],
            datasets: [{
                data: [12.8, 86, 87.2], // Normalized values for better visualization
                backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderColor: ['#1FB8CD', '#FFC185', '#B4413C'],
                borderWidth: 2
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', } } }
    });
}

function renderPredictiveChart() {
    const ctx = document.getElementById('predictiveChart');
    if (!ctx) return;
    
    charts.predictive = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
            datasets: [{
                label: 'Sales Forecast (%)',
                data: [12.5, 13.2, 14.8, 16.2, 18.5, 21.0],
                borderColor: '#5D878F',
                backgroundColor: 'rgba(93, 135, 143, 0.1)',
                fill: true,
                tension: 0.4
            }, {
                label: 'Confidence Interval',
                data: [10.0, 11.5, 12.8, 13.9, 15.2, 17.8],
                borderColor: 'rgba(93, 135, 143, 0.3)',
                backgroundColor: 'rgba(93, 135, 143, 0.05)',
                fill: false,
                borderDash: [5, 5],
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', } }, scales: { y: { beginAtZero: true } } }
    });
}

function renderCustomerSegmentationChart() {
    const ctx = document.getElementById('customerSegmentChart');
    if (!ctx || !appData.customer_insights?.customer_segmentation) return;

    const segmentationData = appData.customer_insights.customer_segmentation;
    const clusterColors = ['rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)', 'rgba(75, 192, 192, 0.7)'];
    
    const datasets = Array.from({ length: 4 }, (_, i) => ({
        label: `Segment ${i + 1}`,
        data: segmentationData.filter(p => p.cluster === i),
        backgroundColor: clusterColors[i],
        borderColor: clusterColors[i].replace('0.7', '1'),
        pointRadius: 6,
        pointHoverRadius: 8
    }));

    if (charts.customerSegment) charts.customerSegment.destroy();
    charts.customerSegment = new Chart(ctx, {
        type: 'scatter',
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: { display: true, text: 'Order Value (USD)' },
                    ticks: { callback: value => `$${(value / 1000).toFixed(0)}k` }
                },
                y: {
                    title: { display: true, text: 'Satisfaction Score' },
                    beginAtZero: true,
                    max: 5.5
                }
            },
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                label += `Value: $${context.parsed.x.toLocaleString()}`;
                            }
                            if (context.parsed.y !== null) {
                                label += `, Score: ${context.parsed.y}`;
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

function renderTradeRouteChart() {
    const ctx = document.getElementById('tradeRouteChart');
    if (!ctx || !appData.customer_insights?.trade_route_analysis) return;

    const routeData = appData.customer_insights.trade_route_analysis;

    if (charts.tradeRoute) charts.tradeRoute.destroy();
    charts.tradeRoute = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: routeData.labels,
            datasets: [{
                label: 'Number of Shipments',
                data: routeData.data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y', // Horizontal bar chart
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    beginAtZero: true,
                    title: { display: true, text: 'Number of Export Shipments' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function getDirectionIcon(direction) {
    switch(direction) {
        case 'positive': return '↗️';
        case 'negative': return '↘️';
        case 'neutral': return '➡️';
        default: return '➡️';
    }
}

