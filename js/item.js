document.addEventListener('DOMContentLoaded', function() {
    const selectedItemName = localStorage.getItem('selectedItemName');

    if (selectedItemName) {
        fetch(`https://lost-and-found-project-2.onrender.com/api/items/${selectedItemName}`)
            .then(response => response.json())
            .then(data => {
                const selectedItem = data;

                if (selectedItem) {
                    document.getElementById('item-details-box').innerHTML = `
                        <h3>Report Information</h3>
                        <div class="item-details">
                            <div class="item-detail"><strong>Item Name</strong><span>${selectedItem.itemName}</span></div>
                            <div class="item-detail"><strong>Category</strong><span>${selectedItem.category}</span></div>
                            <div class="item-detail"><strong>Color</strong><span>${selectedItem.color}</span></div>
                            <div class="item-detail"><strong>Date</strong><span>${formatDate(selectedItem.lostDate)}</span></div>
                            <div class="item-detail"><strong>Status</strong><span>${selectedItem.status}</span></div>
                            <div class="item-detail"><strong>Location</strong><span>${selectedItem.locationLost}</span></div>
                        </div>
                    `;

                    document.getElementById('item-description-box').innerHTML = `
                        <h3>Report Information</h3>
                        <p>${selectedItem.description || 'No description provided.'}</p>
                        <img src="${selectedItem.imageUrl}" alt="${selectedItem.itemName}" class="img-fluid">
                    `;
                } else {
                    document.getElementById('item-details-box').innerHTML = '<p>No item details available.</p>';
                    document.getElementById('item-description-box').innerHTML = '<p>No item details available.</p>';
                }
            })
            .catch(error => console.error('Error fetching data:', error));
    } else {
        document.getElementById('item-details-box').innerHTML = '<p>No item selected.</p>';
        document.getElementById('item-description-box').innerHTML = '<p>No item selected.</p>';
    }
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}