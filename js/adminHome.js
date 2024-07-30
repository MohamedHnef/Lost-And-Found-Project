const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
    fetchRecentActivities();
});

function fetchDashboardData() {
    fetch(`${API_URL}/admin/dashboard-data`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }
        return response.json();
    })
    .then(data => {
        updateSummary(data);
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
    });
}

function fetchRecentActivities() {
    fetch(`${API_URL}/recent-activities`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch recent activities');
        }
        return response.json();
    })
    .then(data => {
        populateRecentActivities(data);
    })
    .catch(error => {
        console.error('Error fetching recent activities:', error);
    });
}

function populateRecentActivities(activities) {
    const activitiesTableBody = document.getElementById('activitiesTable').getElementsByTagName('tbody')[0];
    if (!activitiesTableBody) return;

    activitiesTableBody.innerHTML = '';

    if (Array.isArray(activities)) {
        activities.forEach(activity => {
            const row = activitiesTableBody.insertRow();
            row.insertCell(0).innerText = activity.itemName;
            row.insertCell(1).innerText = activity.claimant;
            row.insertCell(2).innerText = activity.action;
            row.insertCell(3).innerText = new Date(activity.timestamp).toLocaleString();
        });
    }
}

function updateSummary(summary) {
    const approvedCountElem = document.getElementById('totalApproved');
    const rejectedCountElem = document.getElementById('totalRejected');
    const pendingCountElem = document.getElementById('totalPending');

    if (approvedCountElem) approvedCountElem.textContent = summary.approvedCount;
    if (rejectedCountElem) rejectedCountElem.textContent = summary.rejectedCount;
    if (pendingCountElem) pendingCountElem.textContent = summary.pendingCount;
}
