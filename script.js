// Event listener for fetching stock data when button is clicked
document.getElementById('fetchData').addEventListener('click', async () => {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase();
    
    try {
        // Fetch data from the Express server
        const response = await fetch(`http://localhost:3001/api/finance/${symbol}`);
        const data = await response.json();

        // Check if data is available
        if (data.chart.result) {
            const result = data.chart.result[0]; // Get first result
            const currency = result.meta.currency; // Extract currency
            
            // Prepare metrics with currency included
            const metrics = {
                'Current Price': `${currency} ${result.meta.regularMarketPrice}`,
                'Previous Close': `${currency} ${result.meta.previousClose}`,
                '52 Week High': `${currency} ${result.meta.fiftyTwoWeekHigh}`,
                '52 Week Low': `${currency} ${result.meta.fiftyTwoWeekLow}`,
                'Market Volume': result.meta.regularMarketVolume.toLocaleString(), // Format volume with commas
                'Long Name': result.meta.longName,
            };

            // Display metrics without using a table
            displayStockMetrics(metrics); // Updated function to display metrics properly
            drawChart(result.timestamp, result.indicators.quote[0].close);
        } else {
            alert('Stock symbol not found.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
    }
});

// Updated function to properly display stock metrics in a structured way
function displayStockMetrics(metrics) {
    const stockMetricsDiv = document.getElementById('stockMetrics');
    stockMetricsDiv.innerHTML = ''; // Clear previous metrics

    // Stock metric data
    const stockData = [
        { label: "Current Price", value: metrics['Current Price'] },
        { label: "Previous Close", value: metrics['Previous Close'] },
        { label: "52 Week High", value: metrics['52 Week High'] },
        { label: "52 Week Low", value: metrics['52 Week Low'] },
        { label: "Market Volume", value: metrics['Market Volume'] },
        { label: "Company", value: metrics['Long Name'] }
    ];

    const row = document.createElement('div');
    row.className = 'row g-3'; // Bootstrap row with gap

    stockData.forEach((data) => {
        const col = document.createElement('div');
        col.className = 'col-md-6'; // Ensure two boxes per row

        const box = document.createElement('div');
        box.className = 'alert alert-info p-3 text-center';
        box.innerHTML = `<strong>${data.label}:</strong> ${data.value}`;

        col.appendChild(box);
        row.appendChild(col);
    });

    stockMetricsDiv.appendChild(row);
}

let myChart; // Declare a variable to hold the chart instance

// Function to draw chart with price data
function drawChart(timestamps, prices) {
    const ctx = document.getElementById('priceChart').getContext('2d');

    // Check if the chart already exists and destroy it
    if (myChart) {
        myChart.destroy(); // Destroy existing chart instance
    }

    // Check if timestamps and prices are defined and are arrays
    if (Array.isArray(timestamps) && Array.isArray(prices)) {
        // Create a new chart instance with price data
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps.map(ts => new Date(ts * 1000).toLocaleDateString()), // Format timestamps as dates
                datasets: [{
                    label: 'Price',
                    data: prices, // Price data for charting
                    borderColor: 'rgba(75, 192, 192, 1)', // Line color for chart
                    fill: false // Do not fill under the line
                }]
            },
            options: {
                responsive: true, // Make chart responsive
                scales: {
                    xAxes: [{ type: 'time', time: { unit: 'day' } }], // Time scale for x-axis
                    yAxes: [{ ticks: { beginAtZero: true } }] // Start y-axis at zero
                }
            }
        });
    } else {
        console.error('Timestamps or prices are not valid arrays:', timestamps, prices);
        alert('No data available for this stock symbol.');
    }
}