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
            maintainAspectRatio: false
        }
    });
});

