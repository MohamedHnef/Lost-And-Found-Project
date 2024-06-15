document.addEventListener('DOMContentLoaded', function() {
    fetch('data/reports.json')
        .then(response => response.json())
        .then(data => populateReportsTable(data))
        .catch(error => console.error('Error fetching JSON:', error));
});

function populateReportsTable(data) {
    const tbody = document.getElementById('reports-tbody');
    data.forEach(item => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td>${item.itemName}</td>
            <td>${item.category}</td>
            <td>${item.color}</td>
            <td>${item.dateFound}</td>
            <td>${item.location}</td>
            <td class="${item.statusClass}">${item.status}</td>
            <td class="actions">
                <i class="bi bi-eye"></i>
                <i class="bi bi-pencil"></i>
                <i class="bi bi-trash"></i>
            </td>
        `;

        tbody.appendChild(tr);
    });
}
