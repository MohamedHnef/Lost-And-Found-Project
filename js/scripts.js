window.onload = () => {
    populateTableWithData();
};

const populateTableWithData = () => {
    fetch('data/data.json')
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

document.addEventListener("DOMContentLoaded", function() {
    fetch("../Lost-And-Found-Project/data/reports.json")
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
                        <img src="../Lost-And-Found-Project/images/view-icon.png" alt="View" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/edit-icon.png" alt="Edit" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/delete-icon.png" alt="Delete" class="action-icon">
                    </td>
                `;

                reportsTbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
});

//breadcrumbs
document.addEventListener("DOMContentLoaded", function () {
    const breadcrumbContainer = document.getElementById("breadcrumb");

    // Get the current page title
    const currentPage = document.title.split(' - ')[1];

    // Get the breadcrumb trail from session storage or initialize it
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];

    // If navigating to a new page, update the breadcrumb trail
    if (!breadcrumbTrail.includes(currentPage)) {
        breadcrumbTrail.push(currentPage);
    } else {
        
        const currentIndex = breadcrumbTrail.indexOf(currentPage);
        breadcrumbTrail = breadcrumbTrail.slice(0, currentIndex + 1);
    }

    
    sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbTrail));


    function buildBreadcrumbTrail(trail) {
        breadcrumbContainer.innerHTML = ''; 
        trail.forEach((crumb, index) => {
            const li = document.createElement("li");
            li.classList.add("breadcrumb-item");

            if (index === trail.length - 1) {
                li.classList.add("active");
                li.setAttribute("aria-current", "page");
                li.textContent = crumb;
            } else {
                const a = document.createElement("a");
                a.href = crumb === "Home" ? "index.html" : crumb.toLowerCase().replace(/\s/g, '_') + ".html";
                a.textContent = crumb;
                li.appendChild(a);
            }

            breadcrumbContainer.appendChild(li);
        });
    }

    buildBreadcrumbTrail(breadcrumbTrail);
});

//chart profile page
document.addEventListener("DOMContentLoaded", function() {
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



//chart home page
document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('itemsChart').getContext('2d');
    const itemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Phones', 'Wallets', 'Keys', 'Purses', 'Computers', 'Others'],
            datasets: [{
                label: 'Found Items Count',
                data: [40, 88, 60, 45, 10, 6],
                backgroundColor: 'rgba(10, 162, 192, 0.6)',
                borderColor: 'rgba(10, 162, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            responsive: true,
            maintainAspectRatio: true // Change this to true
        }
    });
});
