document.addEventListener("DOMContentLoaded", function() {
    fetch("../Lost-And-Found-Project/data/reports.json")
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            const reportsTbody = document.getElementById("reports-tbody");
            data.forEach(report => {
                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${report.itemName}</td>
                    <td>${report.category}</td>
                    <td>${report.color}</td>
                    <td>${report.dateFound}</td>
                    <td>${report.location}</td>
                    <td><span class="badge bg-danger">${report.status}</span></td>
                    <td class="actions">
                        <img src="../Lost-And-Found-Project/images/view-icon.png" alt="View" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/edit-icon.png" alt="Edit" class="action-icon">
                        <img src="../Lost-And-Found-Project/images/delete-icon.png" alt="Delete" class="action-icon">
                    </td>
                `;

                reportsTbody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching JSON:', error);
        });
});
