document.addEventListener("DOMContentLoaded", () => {
    fetchPendingClaims();
});

const fetchPendingClaims = () => {
    fetch(`${API_URL}/admin/pending-claims`)
    .then(response => response.json())
    .then(claims => {
        const tbody = document.getElementById('claimsTable').querySelector('tbody');
        tbody.innerHTML = '';
        claims.forEach(claim => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${claim.itemName}</td>
                <td>${claim.claimant}</td>
                <td>
                    <button onclick="handleClaim(${claim.id}, 'Approve')">Approve</button>
                    <button onclick="handleClaim(${claim.id}, 'Reject')">Reject</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching pending claims:', error));
};

const handleClaim = (claimId, action) => {
    const comments = prompt(`Enter comments for ${action.toLowerCase()}ing this claim:`);
    fetch(`${API_URL}/admin/handle-claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action, comments })
    })
    .then(response => response.json())
    .then(result => {
        alert(result.message);
        fetchPendingClaims(); // Refresh the list of pending claims
    })
    .catch(error => console.error(`Error ${action.toLowerCase()}ing claim:`, error));
};
