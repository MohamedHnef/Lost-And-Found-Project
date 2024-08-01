document.addEventListener('DOMContentLoaded', () => {
    fetchAdminClaims();
});

function fetchAdminClaims() {
    const token = sessionStorage.getItem('token');
    const API_URL = 'https://lost-and-found-project.onrender.com'; // Ensure this is the correct base URL

    fetch(`${API_URL}/claim-requests?claimStatus=PendingApproval`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        const claimsTable = document.getElementById('claimsTable').getElementsByTagName('tbody')[0];
        claimsTable.innerHTML = '';

        data.forEach(item => {
            const row = claimsTable.insertRow();
            row.insertCell(0).innerText = item.itemName || 'N/A';
            row.insertCell(1).innerText = item.claimant || 'N/A';

            const actionsCell = row.insertCell(2);

            const approveButton = document.createElement('button');
            approveButton.innerText = 'Approve';
            approveButton.className = 'btn btn-success me-2';
            approveButton.onclick = () => updateClaimStatus(item.id, true);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.innerText = 'Reject';
            rejectButton.className = 'btn btn-danger me-2';
            rejectButton.onclick = () => updateClaimStatus(item.id, false);
            actionsCell.appendChild(rejectButton);

            const viewButton = document.createElement('button');
            viewButton.innerText = 'View';
            viewButton.className = 'btn btn-info';
            viewButton.onclick = () => showItemModal(item.itemId, item.status);
            actionsCell.appendChild(viewButton);
        });
    })
    .catch(error => console.error('Error fetching claims:', error));
}
