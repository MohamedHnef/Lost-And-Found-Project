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
