document.addEventListener("DOMContentLoaded", function () {
    const breadcrumbContainer = document.getElementById("breadcrumb");

    // Get the current page title
    const currentPage = document.title.split(' - ')[1];

    // Get the breadcrumb trail from session storage or initialize it
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];

    // If navigating to a new page, update the breadcrumb trail
    if (!breadcrumbTrail.includes(currentPage)) {
        breadcrumbTrail.push(currentPage);
    } else {
        // If the current page is already in the trail, trim to this point
        const currentIndex = breadcrumbTrail.indexOf(currentPage);
        breadcrumbTrail = breadcrumbTrail.slice(0, currentIndex + 1);
    }

    // Update the breadcrumb trail in session storage
    sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbTrail));

    // Build the breadcrumb trail
    function buildBreadcrumbTrail(trail) {
        breadcrumbContainer.innerHTML = ''; // Clear previous breadcrumbs
        trail.forEach((crumb, index) => {
            const li = document.createElement("li");
            li.classList.add("breadcrumb-item");

            if (index === trail.length - 1) {
                li.classList.add("active");
                li.setAttribute("aria-current", "page");
                li.textContent = crumb;
            } else {
                const a = document.createElement("a");
                a.href = crumb === "Home" ? "index.html" : crumb.toLowerCase().replace(/\s/g, '_') + ".html";
                a.textContent = crumb;
                li.appendChild(a);
            }

            breadcrumbContainer.appendChild(li);
        });
    }

    buildBreadcrumbTrail(breadcrumbTrail);
});


document.addEventListener('DOMContentLoaded', function() {
    fetch('../data/items.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => renderCards(data))
    .catch(error => console.error('Error loading the items data:', error));

    function createCard(item, index) {
        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${index + 1}`;

        const info = document.createElement('div');
        info.className = 'item-info';
        info.innerHTML = `<strong>${item.itemName}</strong><br>
                          Date Lost: ${item.lostDate}<br>
                          Color: ${item.itemColor}<br>
                          Location Lost: ${item.locationLost}<br>
                          Category: ${item.category}<br>
                          Description: ${item.description}`;

        if (item.imageUrl) {
            const image = document.createElement('img');
            image.src = item.imageUrl;
            image.alt = `Image of ${item.itemName}`;
            card.appendChild(image);
        }

        card.appendChild(info);

        return card;
    }

    function renderCards(items) {
        const container = document.getElementById('cards-container');
        container.innerHTML = '';
        items.forEach((item, index) => {
            container.appendChild(createCard(item, index));
        });
    }
});
