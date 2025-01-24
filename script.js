document.getElementById('fetchData').addEventListener('click', async () => {
    const symbol = document.getElementById('stockSymbol').value.toUpperCase(); // Get user input

    try {
        // Fetch data from your Express proxy instead of directly from Yahoo Finance
        const response = await fetch(`http://localhost:3001/api/finance/${symbol}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.chart.result) {
            const result = data.chart.result[0];
            const metrics = {
                'Current Price': result.meta.regularMarketPrice,
                'Market Cap': result.meta.marketCap,
                'P/E Ratio': result.meta.trailingPE,
                'Dividend Yield': result.meta.dividendYield * 100 + '%'
            };

            updateMetricsTable(metrics);
            drawChart(result.timestamp, result.indicators.quote[0].close);
        } else {
            alert('Stock symbol not found.');
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch data.');
    }
});

function updateMetricsTable(metrics) {
    const tbody = document.getElementById('metricsTable').getElementsByTagName('tbody')[0];
    tbody.innerHTML = ''; // Clear previous data

    for (const [key, value] of Object.entries(metrics)) {
        const row = tbody.insertRow();
        row.insertCell(0).innerText = key;
        row.insertCell(1).innerText = value;
    }
}

function drawChart(timestamps, prices) {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps.map(ts => new Date(ts * 1000).toLocaleDateString()),
            datasets: [{
                label: 'Price',
                data: prices,
                borderColor: 'rgb(38, 7, 238)',
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                xAxes: [{ type: 'time', time: { unit: 'day' } }],
                yAxes: [{ ticks: { beginAtZero: true } }]
            }
        }
    });
}

document.getElementById('downloadCSV').addEventListener('click', () => {
    const tableData = Array.from(document.querySelectorAll('#metricsTable tbody tr'))
                            .map(row => Array.from(row.cells).map(cell => cell.innerText));
    
    let csvContent = "data:text/csv;charset=utf-8," + tableData.map(e => e.join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stock_data.csv");
    
    document.body.appendChild(link);
    
    link.click();
});
