document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('reportLostForm');
    form.addEventListener('submit', handleFormSubmit);
  });
  
  const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';
  
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
    return fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: formData
    })
    .then(handleResponse)
    .then(data => data.imageUrl)
    .catch(handleError('Error uploading image'));
  }
  
  function submitItemData(itemData) {
    console.log('Submitting item data:', itemData); // Log the item data being submitted
    return fetch(`${API_URL}/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(itemData)
    })
    .then(handleResponse)
    .then(data => {
      console.log('Item reported successfully:', data);
      return data;
    })
    .catch(handleError('Error submitting item data'));
  }
  
  function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get('addImage');
  
    console.log('Handling form submission...');
    if (!file || file.size === 0) {
      alert('Please upload an image.');
      return;
    }
  
    uploadImage(file)
      .then(imageUrl => {
        console.log('Using image URL:', imageUrl);
        const itemData = getItemDataFromForm(formData, imageUrl);
        return submitItemData(itemData);
      })
      .then(() => {
        alert('Item reported successfully!');
        window.location.href = 'list_Item.html'; // Redirect to item list page after successful submission
      })
      .catch(error => console.error('Failed to report item:', error));
  }
  
  function handleResponse(response) {
    if (!response.ok) {
      throw new Error(`Failed, server responded with status: ${response.status}`);
    }
    return response.json();
  }
  
  function handleError(message) {
    return error => {
      console.error(message, error);
      alert(message); // Alert the error message
      throw error;
    };
  }
  