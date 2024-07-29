const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener("DOMContentLoaded", () => {
    fetchDashboardData();
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
        populateRecentActivities(data.recentActivities);
        updateSummary(data.summary);
    })
    .catch(error => {
        console.error('Error fetching dashboard data:', error);
    });
}

function populateRecentActivities(activities) {
    const activitiesContainer = document.getElementById('recent-activities');
    if (!activitiesContainer) return;

    activitiesContainer.innerHTML = '';

    if (Array.isArray(activities)) {
        activities.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.classList.add('activity-item');
            activityElement.textContent = `${activity.action} - ${activity.timestamp}`;
            activitiesContainer.appendChild(activityElement);
        });
    }
}

function updateSummary(summary) {
    const approvedCountElem = document.getElementById('approved-count');
    const rejectedCountElem = document.getElementById('rejected-count');

    if (approvedCountElem) approvedCountElem.textContent = summary.approvedCount;
    if (rejectedCountElem) rejectedCountElem.textContent = summary.rejectedCount;
}
