document.addEventListener('DOMContentLoaded', function () {
    initializeChart();
    populateItemsTable();
    adjustHeights();
});

window.onresize = () => adjustHeights();

function initializeChart() {
    const ctx = document.getElementById('itemsChart').getContext('2d');
    const itemsChart = new Chart(ctx, {
        type: 'bar',
        data: getChartData(),
        options: getChartOptions()
    });
}

function getChartData() {
    return {
        labels: ['Phones', 'Wallets', 'Keys', 'Purses', 'Computers', 'Others'],
        datasets: [{
            label: 'Found Items Count',
            data: [40, 88, 60, 45, 10, 6],
            backgroundColor: 'rgba(10, 162, 192, 0.2)',
            borderColor: 'rgba(10, 162, 192, 1)',
            borderWidth: 1
        }]
    };
}

function getChartOptions() {
    return {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
            x: {
                beginAtZero: true
            },
            y: {
                beginAtZero: true
            }
        }
    };
}

function adjustHeights() {
    const chartBackground = document.querySelector('.chart-background');
    const dataBackground = document.querySelector('.data-background');
    const tableResponsive = document.querySelector('.table-responsive');

    resetHeights(chartBackground, dataBackground, tableResponsive);
    setEqualHeights(chartBackground, dataBackground);
}

function resetHeights(...elements) {
    elements.forEach(element => element.style.height = 'auto');
}

function setEqualHeights(chartBackground, dataBackground) {
    const chartHeight = chartBackground.offsetHeight;
    const dataHeight = dataBackground.offsetHeight;
    const maxHeight = Math.max(chartHeight, dataHeight);

    chartBackground.style.height = `${maxHeight}px`;
    dataBackground.style.height = `${maxHeight}px`;
}

function populateItemsTable() {
    fetch('../data/NearbyItems.json')
        .then(response => response.json())
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = '';
            data.forEach(item => createTableRow(itemsTable, item));
        })
        .catch(error => console.error('Error fetching items:', error));
}

function createTableRow(table, item) {
    const row = document.createElement('tr');
    row.appendChild(createCell(item.itemName));
    row.appendChild(createCell(new Date(item.lostDate).toLocaleDateString()));
    row.appendChild(createCell(item.location));
    row.appendChild(createStatusCell(item.status));
    table.appendChild(row);
}

function createCell(text) {
    const cell = document.createElement('td');
    cell.textContent = text;
    return cell;
}

function createStatusCell(status) {
    const cell = document.createElement('td');
    const statusSpan = document.createElement('span');
    statusSpan.textContent = status;
    statusSpan.classList.add(status === 'Found' ? 'status-found' : 'status-lost');
    cell.appendChild(statusSpan);
    return cell;
}