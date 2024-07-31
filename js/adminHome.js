const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    fetchClaimCounts();
    fetchRecentActivities();
});

function fetchClaimCounts() {
    fetch(`${API_URL}/claim-counts`, {
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch claim counts');
        }
        return response.json();
    })
    .then(data => {
        document.getElementById('totalApproved').innerText = data.approved;
        document.getElementById('totalRejected').innerText = data.rejected;
        document.getElementById('totalPending').innerText = data.pending;
    })
    .catch(error => {
        console.error('Error fetching claim counts:', error);
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
