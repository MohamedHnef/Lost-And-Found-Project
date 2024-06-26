document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('reportLostForm');
    form.addEventListener('submit', handleFormSubmit);
});

function getItemDataFromForm(formData, imageUrl) {
    const userId = 1; // Replace with actual user ID
    return {
        itemName: formData.get('itemName'),
        locationLost: formData.get('locationLost'),
        lostDate: formData.get('lostDate'),
        timeLost: formData.get('timeLost'),
        category: formData.get('category'),
        color: formData.get('color'), // Ensure color is gathered here
        description: formData.get('description'),
        contactEmail: formData.get('contactEmail'),
        contactPhone: formData.get('contactPhone'),
        status: 'Lost',
        imageUrl: imageUrl, // Use the uploaded image URL
        userId: userId // Add userId to the item data
    };
}

function uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    return fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            console.log('Upload failed with status:', response.status);
            throw new Error(`Failed to upload image, server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Image uploaded successfully:', data.imageUrl);
        return data.imageUrl;
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        throw error;
    });
}

function submitItemData(itemData) {
    console.log('Submitting item data:', itemData); // Log the item data being submitted
    return fetch('http://localhost:3000/api/items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
    })
    .then(response => {
        if (!response.ok) {
            console.error('Response not OK:', response.statusText);
            throw new Error(`Failed to submit item data, server responded with status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Item reported successfully:', data);
        return data;
    })
    .catch(error => {
        console.error('Error submitting item data:', error);
        throw error;
    });
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get('addImage');

    console.log('Handling form submission...');

    let imageUploadPromise;
    if (file && file.size > 0) {
        console.log('File detected, preparing to upload...');
        imageUploadPromise = uploadImage(file);
    } else {
        alert('Please upload an image.');
        return;
    }

    imageUploadPromise
        .then(imageUrl => {
            console.log('Using image URL:', imageUrl);
            const itemData = getItemDataFromForm(formData, imageUrl);
            return submitItemData(itemData);
        })
        .then(data => {
            console.log('Item submission response:', data);
            alert('Item reported successfully!');
            window.location.href = 'list_item.html'; // Redirect to item list page after successful submission
        })
        
}
