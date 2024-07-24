document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById('reportLostForm');
  form.addEventListener('submit', handleFormSubmit);
  initializeNotification();
});

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : 'https://lost-and-found-project.onrender.com/api';

function getItemDataFromForm(formData, imageUrl) {
  const userId = 1; 
  return {
      itemName: formData.get('itemName'),
      locationLost: formData.get('locationLost'),
      lostDate: formData.get('lostDate'),
      timeLost: formData.get('timeLost'),
      category: formData.get('category'),
      color: formData.get('color'), 
      description: formData.get('description'),
      contactEmail: formData.get('contactEmail'),
      contactPhone: formData.get('contactPhone'),
      status: 'Lost',
      imageUrl: imageUrl, 
      userId: userId 
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
  console.log('Submitting item data:', itemData); 
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
      showNotification('Please upload an image.');
      return;
  }

  uploadImage(file)
      .then(imageUrl => {
          console.log('Using image URL:', imageUrl);
          const itemData = getItemDataFromForm(formData, imageUrl);
          return submitItemData(itemData);
      })
      .then(() => {
          showNotification('Item reported successfully!', { ok: () => window.location.href = 'list_Item.html' });
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
      showNotification(message); 
      throw error;
  };
}

const initializeNotification = () => {
  const notification = document.getElementById('notification');
  const notificationYes = document.getElementById('notification-yes');
  const notificationNo = document.getElementById('notification-no');
  const notificationButton = document.getElementById('notification-button');
  notificationYes.addEventListener('click', () => {
      if (notification.confirmCallback) notification.confirmCallback();
      hideNotification();
  });
  notificationNo.addEventListener('click', hideNotification);
  notificationButton.addEventListener('click', hideNotification);
};

const showNotification = (message, actions = { yes: null, no: null, ok: null }) => {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  const notificationYes = document.getElementById('notification-yes');
  const notificationNo = document.getElementById('notification-no');
  const notificationButton = document.getElementById('notification-button');

  notificationMessage.textContent = message;

  if (actions.yes && actions.no) {
      notificationYes.style.display = 'block';
      notificationNo.style.display = 'block';
      notificationButton.style.display = 'none';
      notification.confirmCallback = actions.yes;
  } else {
      notificationYes.style.display = 'none';
      notificationNo.style.display = 'none';
      notificationButton.style.display = 'block';
      notification.confirmCallback = null;
      if (actions.ok) notificationButton.onclick = actions.ok;
  }

  notification.style.display = 'flex';
};

const hideNotification = () => {
  const notification = document.getElementById('notification');
  notification.style.display = 'none';
};
