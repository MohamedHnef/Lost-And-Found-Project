function fetchAdminClaims() {
    const token = sessionStorage.getItem('token');
    
    fetch(`${API_URL}/claim-requests?claimStatus=pendingApproval`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch claims');
        }
        return response.json();
    })
    .then(data => {
        const claimsTable = document.getElementById('claimsTable').getElementsByTagName('tbody')[0];
        claimsTable.innerHTML = '';

        data.forEach(item => {
            const row = claimsTable.insertRow();
            row.insertCell(0).innerText = item.itemName;
            row.insertCell(1).innerText = item.claimant;

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
            viewButton.onclick = () => viewItem(item.id);
            actionsCell.appendChild(viewButton);
        });
    })
    .catch(error => console.error('Error fetching claims:', error));
}

// Function to update claim status
function updateClaimStatus(requestId, approved) {
    const token = sessionStorage.getItem('token');
    
    fetch(`${API_URL}/claim-requests/${requestId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update claim status');
        }
        return response.json();
    })
    .then(data => {
        console.log(`Claim ${data.status}`);
        alert(`Claim ${data.status}`);
        fetchAdminClaims(); // Refresh the claims table
    })
    .catch(error => console.error('Error updating claim status:', error));
}

// Function to view item details
function viewItem(itemId) {
    window.location.href = `item.html?id=${itemId}`;
}

// Ensure fetchAdminClaims is called after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchAdminClaims();
});