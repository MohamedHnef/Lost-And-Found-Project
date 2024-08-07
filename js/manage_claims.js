const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';


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

function showItemModal(itemId, status) {
    fetch(`${API_URL}/item-details/${itemId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch item details');
        }
        return response.json();
      })
      .then(item => {
        const modalBody = document.getElementById('itemModalBody');
        modalBody.innerHTML = getItemDetailsHTML(item);
        const itemModal = new bootstrap.Modal(document.getElementById('itemModal'));
        itemModal.show();
      })
      .catch(error => console.error('Error fetching item details:', error));
  }
  
  function getItemDetailsHTML(item) {
    return `
      <h3>Report Information</h3>
      <div class="item-details">
        <div class="item-detail"><strong>Item Name</strong><span>${item.itemName || 'N/A'}</span></div>
        <div class="item-detail"><strong>Category</strong><span>${item.category || 'N/A'}</span></div>
        <div class="item-detail"><strong>Color</strong><span>${item.color || 'N/A'}</span></div>
        <div class="item-detail"><strong>Date</strong><span>${formatDate(item.foundDate) || 'N/A'}</span></div>
        <div class="item-detail"><strong>Status</strong><span>${item.status || 'N/A'}</span></div>
        <div class="item-detail"><strong>Location</strong><span>${item.locationFound || 'N/A'}</span></div>
        <div class="item-detail"><strong>Description</strong><span>${item.description || 'No description provided.'}</span></div>
        <div class="item-detail"><strong>Security Question</strong><span>${item.securityQuestion || 'N/A'}</span></div>
        <div class="item-detail"><strong>Security Answer</strong><span>${item.securityAnswer || 'N/A'}</span></div>
      </div>
    `;
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }  
  
function updateClaimStatus(requestId, approved) {
    const token = sessionStorage.getItem('token');
    const action = approved ? 'Approved' : 'Rejected';

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
            logActivity(requestId, action);
            fetchAdminClaims(); 
        })
        .catch(error => console.error('Error updating claim status:', error));
}

function logActivity(requestId, action) {
    const token = sessionStorage.getItem('token');

    fetch(`${API_URL}/log-activity`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestId, action })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to log activity');
            }
            return response.json();
        })
        .then(data => {
        })
        .catch(error => console.error('Error logging activity:', error));
}


document.addEventListener('DOMContentLoaded', () => {
    fetchAdminClaims();
});
