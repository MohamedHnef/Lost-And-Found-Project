// profile page table
const populateTableWithData = () => {
    fetch('data/items.json')
        .then(response => response.json())
        .then(data => {
            const itemsTable = document.getElementById('itemsTable');
            itemsTable.innerHTML = ''; // Clear any existing rows

            data.forEach(item => {
                const row = document.createElement('tr');

                const nameCell = document.createElement('td');
                nameCell.textContent = item.itemName;
                row.appendChild(nameCell);

                const dateCell = document.createElement('td');
                dateCell.textContent = item.lostDate;
                row.appendChild(dateCell);

                const locationCell = document.createElement('td');
                locationCell.textContent = item.location;
                row.appendChild(locationCell);

                const statusCell = document.createElement('td');
                statusCell.textContent = item.status;
                row.appendChild(statusCell);

                itemsTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
};

document.addEventListener("DOMContentLoaded", function () {
    fetch("data/reports.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const reportsTbody = document.getElementById("reports-tbody");
            data.forEach(report => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${report.itemName}</td>
                    <td>${report.category}</td>
                    <td>${report.color}</td>
                    <td>${report.dateFound}</td>
                    <td>${report.location}</td>
                    <td><span class="badge bg-danger">${report.status}</span></td>
                    <td class="actions">
                        <img src="images/view-icon.png" alt="View" class="action-icon">
                        <img src="images/edit-icon.png" alt="Edit" class="action-icon">
                        <img src="images/delete-icon.png" alt="Delete" class="action-icon">
                    </td>
                `;

                reportsTbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
});

//chart profile page
document.addEventListener("DOMContentLoaded", function () {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Items Reported',
                data: [0, 25, 15, 10, 30, 50],
                backgroundColor: 'rgba(10, 162, 192, 0.2)',
                borderColor: '#0AA2C0',
                borderWidth: 2,
                pointBackgroundColor: '#0AA2C0'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});

