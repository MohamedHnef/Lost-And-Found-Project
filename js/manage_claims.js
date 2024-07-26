const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    fetchClaims();
});

const fetchClaims = () => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/items?claimStatus=Pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
};

const updateClaimStatus = (itemId, approved) => {
    const token = localStorage.getItem('token');

    fetch(`${API_URL}/items/claim/${itemId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Forbidden');
            }
            return response.json();
        })
        .then(data => {
            console.log(`Claim ${data.claimStatus}`);
            alert(`Claim ${data.claimStatus}`); // Add alert for response
            fetchClaims(); // Refresh the claims table
        })
        .catch(error => console.error('Error updating claim status:', error));
};

const viewItem = (itemId) => {
    localStorage.setItem('selectedItemId', itemId);
    window.location.href = `item.html?id=${itemId}`;
};
