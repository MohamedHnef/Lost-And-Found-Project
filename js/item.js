const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : `https://${window.location.hostname}/api`;

document.addEventListener('DOMContentLoaded', () => {
    const selectedItemName = localStorage.getItem('selectedItemName');
    if (selectedItemName) {
        fetchItemDetails(selectedItemName);
    } else {
        displayNoItemSelected();
    }
});

const fetchItemDetails = (itemName) => {
    fetch(`${API_URL}/items/${itemName}`)
        .then(response => response.json())
        .then(data => displayItemDetails(data))
        .catch(error => console.error('Error fetching data:', error));
};

const displayItemDetails = (item) => {
    if (item) {
        document.getElementById('item-details-box').innerHTML = getItemDetailsHTML(item);
        document.getElementById('item-description-box').innerHTML = getItemDescriptionHTML(item);
    } else {
        displayNoItemDetails();
    }
};

const getItemDetailsHTML = (item) => `
    <h3>Report Information</h3>
    <div class="item-details">
        <div class="item-detail"><strong>Item Name</strong><span>${item.itemName}</span></div>
        <div class="item-detail"><strong>Category</strong><span>${item.category}</span></div>
        <div class="item-detail"><strong>Color</strong><span>${item.color}</span></div>
        <div class="item-detail"><strong>Date</strong><span>${formatDate(item.lostDate)}</span></div>
        <div class="item-detail"><strong>Status</strong><span>${item.status}</span></div>
        <div class="item-detail"><strong>Location</strong><span>${item.locationLost}</span></div>
    </div>
`;

const getItemDescriptionHTML = (item) => `
    <h3>Report Information</h3>
    <p>${item.description || 'No description provided.'}</p>
    <img src="${item.imageUrl}" alt="${item.itemName}" class="img-fluid">
`;

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const displayNoItemDetails = () => {
    document.getElementById('item-details-box').innerHTML = '<p>No item details available.</p>';
    document.getElementById('item-description-box').innerHTML = '<p>No item details available.</p>';
};

const displayNoItemSelected = () => {
    document.getElementById('item-details-box').innerHTML = '<p>No item selected.</p>';
    document.getElementById('item-description-box').innerHTML = '<p>No item selected.</p>';
};
