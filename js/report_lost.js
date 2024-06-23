document.addEventListener("DOMContentLoaded", () => {
    initReportLostForm();
    initFileInputChange();
});

function initReportLostForm() {
    const form = document.getElementById('reportLostForm');
    form.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const itemData = getItemDataFromForm(formData);
    saveItemToSessionStorage(itemData);
    alert('Item reported successfully!');
    window.location.href = 'list_item.html';
}

function getItemDataFromForm(formData) {
    return {
        itemName: formData.get('itemName'),
        locationLost: formData.get('locationLost'),
        lostDate: formData.get('lostDate'),
        timeLost: formData.get('timeLost'),
        category: formData.get('category'),
        itemColor: formData.get('itemColor'),
        description: formData.get('description'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        status: 'Lost',
        imageUrl: sessionStorage.getItem('currentImageUrl') || 'default-image-url.jpg'
    };
}

function saveItemToSessionStorage(itemData) {
    const addedItems = JSON.parse(sessionStorage.getItem('addedItems')) || [];
    addedItems.push(itemData);
    sessionStorage.setItem('addedItems', JSON.stringify(addedItems));
}

function initFileInputChange() {
    const fileInput = document.getElementById('addImage');
    fileInput.addEventListener('change', handleFileInputChange);
}

function handleFileInputChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            sessionStorage.setItem('currentImageUrl', e.target.result);
            event.target.nextElementSibling.textContent = file.name;
        };
        reader.readAsDataURL(file);
    }
}