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



document.addEventListener("DOMContentLoaded", function () {
    // Define the breadcrumb structure
    const breadcrumbStructure = {
        "index.html": {
            "Home": "index.html"
        },
        "report_lost.html": {
            "Home": "index.html",
            "Report Lost": "report_lost.html"
        },
        "profile.html": {
            "Home": "index.html",
            "Report Lost": "report_lost.html",
            "My Profile": "profile.html"
        }
        // Add more page structures as needed
    };

    // Get the current page
    const currentPage = window.location.pathname.split("/").pop();

    // Get the breadcrumb container
    const breadcrumbContainer = document.getElementById("breadcrumb");

    // Build the breadcrumb trail
    if (breadcrumbStructure[currentPage]) {
        const trail = breadcrumbStructure[currentPage];
        Object.keys(trail).forEach((key, index, array) => {
            const li = document.createElement("li");
            li.classList.add("breadcrumb-item");

            if (index === array.length - 1) {
                li.classList.add("active");
                li.setAttribute("aria-current", "page");
                li.textContent = key;
            } else {
                const a = document.createElement("a");
                a.href = trail[key];
                a.textContent = key;
                li.appendChild(a);
            }

            breadcrumbContainer.appendChild(li);
        });
    }
});


//chart 
document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('itemsChart').getContext('2d');
    const itemsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Phones', 'Wallets', 'Keys', 'Purses', 'Computers', 'Others'],
            datasets: [{
                label: 'Found Items Count',
                data: [40, 88, 60, 45, 10, 6],
                backgroundColor: 'rgba(10, 162, 192, 0.2)',
                borderColor: 'rgba(10, 162, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});


