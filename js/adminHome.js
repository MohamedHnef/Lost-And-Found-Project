const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    fetchAdminDashboardData();
});

const fetchAdminDashboardData = () => {
    fetch(`${API_URL}/admin/dashboard-data`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalApproved').textContent = data.totalApproved;
        document.getElementById('totalRejected').textContent = data.totalRejected;
        document.getElementById('totalPending').textContent = data.totalPending;
        populateRecentActivities(data.recentActivities);
    })
    .catch(error => console.error('Error fetching dashboard data:', error));
};

const populateRecentActivities = (activities) => {
    const tbody = document.getElementById('activitiesTable').querySelector('tbody');
    tbody.innerHTML = '';
    activities.forEach(activity => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${activity.itemName}</td>
            <td>${activity.claimant || 'Unknown'}</td>
            <td>${activity.status}</td>
            <td>${new Date(activity.timestamp).toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    });
};
