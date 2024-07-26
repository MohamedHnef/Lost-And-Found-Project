const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchClaims();
});

const fetchClaims = () => {
    fetch(`${API_URL}/items?claimStatus=Pending`, {
        headers: { 'Authorization': localStorage.getItem('token') }
    })
    .then(response => response.json())
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
            approveButton.className = 'btn btn-success';
            approveButton.onclick = () => updateClaimStatus(item.id, true);
            actionsCell.appendChild(approveButton);

            const rejectButton = document.createElement('button');
            rejectButton.innerText = 'Reject';
            rejectButton.className = 'btn btn-danger';
            rejectButton.onclick = () => updateClaimStatus(item.id, false);
            actionsCell.appendChild(rejectButton);
        });
    })
    .catch(error => console.error('Error fetching claims:', error));
};

const updateClaimStatus = (itemId, approved) => {
    fetch(`${API_URL}/items/claim/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem('token')
        },
        body: JSON.stringify({ approved })
    })
    .then(response => response.json())
    .then(data => {
        console.log(`Claim ${data.claimStatus}`);
        fetchClaims(); // Refresh the claims table
    })
    .catch(error => console.error('Error updating claim status:', error));
};
