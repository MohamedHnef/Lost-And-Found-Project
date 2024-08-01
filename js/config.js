let API_URL;
if (window.location.hostname === 'localhost') {
    API_URL = 'http://localhost:3000/api';
} else if (window.location.hostname === 'se.shenkar.ac.il') {
    API_URL = 'https://lost-and-found-project.onrender.com/api';
} else {
    API_URL = 'https://lost-and-found-project.onrender.com/api';
}
