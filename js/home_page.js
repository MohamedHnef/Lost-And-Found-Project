document.addEventListener('DOMContentLoaded', () => {
    populateItemsTable();
    initializeChart();
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';
const GRAPH_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/server/data/homeGraph.json' : 'https://lost-and-found-project-3.onrender.com/server/data/homeGraph.json';

const fetchJSON = (url) => fetch(url).then(response => {
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
});

const populateItemsTable = () => {
    fetchJSON(`${API_URL}/items`)
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = data.map(createTableRow).join('');
        })
        .catch(error => console.error('Error fetching items:', error));
};

const createTableRow = (item) => `
    <tr>
        <td>${item.itemName}</td>
        <td>${new Date(item.lostDate).toLocaleDateString()}</td>
        <td>${item.locationLost}</td>
        <td><span class="${item.status === 'Found' ? 'status-found' : 'status-lost'}">${item.status}</span></td>
    </tr>
`;

const initializeChart = () => {
    fetchJSON(GRAPH_URL)
        .then(chartData => {
            new Chart(document.getElementById('itemsChart').getContext('2d'), getChartConfig(chartData));
        })
        .catch(error => console.error('Error fetching chart data:', error));
};

const getChartConfig = (chartData) => ({
    type: 'bar',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'Found Items Count',
            data: chartData.data,
            backgroundColor: 'rgba(10, 162, 192, 0.2)',
            borderColor: 'rgba(10, 162, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            x: { beginAtZero: true },
            y: { beginAtZero: true }
        }
    }
});
