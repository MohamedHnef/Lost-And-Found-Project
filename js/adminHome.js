const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchAdminDashboardData();
});

const fetchAdminDashboardData = () => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/admin-dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('totalApproved').innerText = data.totalApproved;
        document.getElementById('totalRejected').innerText = data.totalRejected;
        document.getElementById('totalPending').innerText = data.totalPending;
        
        const activitiesTable = document.getElementById('activitiesTable').getElementsByTagName('tbody')[0];
        activitiesTable.innerHTML = '';

        data.recentActivities.forEach(activity => {
            const row = activitiesTable.insertRow();
            row.insertCell(0).innerText = activity.itemName;
            row.insertCell(1).innerText = activity.claimant;
            row.insertCell(2).innerText = activity.action;
            row.insertCell(3).innerText = new Date(activity.timestamp).toLocaleString();
        });
    })
    .catch(error => console.error('Error fetching admin dashboard data:', error));
};
