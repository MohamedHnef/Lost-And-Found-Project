(function() {
    let API_URL;
    if (window.location.hostname === 'localhost') {
        API_URL = 'http://localhost:3000';
    } else if (window.location.hostname.includes('shenkar.ac.il')) {
        API_URL = 'https://lost-and-found-project.onrender.com';
    } else {
        API_URL = 'https://lost-and-found-project.onrender.com';
    }
    console.log('API URL from config.js:', API_URL); // Debugging log

    // Make API_URL globally accessible
    window.API_URL = API_URL;
})();
