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
    fetch('data/items.json')
        .then(response => response.json())
        .then(data => {
            const container = document.querySelector('.row');
            container.innerHTML = '';
            data.forEach(item => {
                const card = `
                    <div class="col">
                        <div class="card list-item-card">
                            <img src="${item.imageUrl}" class="card-img-top" alt="${item.itemName}">
                            <div class="card-body">
                                <h5 class="card-title">${item.itemName}</h5>
                                <div class="card-details">
                                    <div class="card-detail">
                                        <i class="bi bi-calendar"></i> <span>${item.lostDate}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-tag"></i> <span>${item.category}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-clock"></i> <span>${item.timeLost}</span>
                                    </div>
                                    <div class="card-detail">
                                        <i class="bi bi-geo-alt"></i> <span>${item.locationLost}</span>
                                    </div>
                                </div>
                                <a href="#" class="status-btn status-${item.status.toLowerCase()}">${item.status}</a>
                            </div>
                        </div>
                    </div>`;
                container.innerHTML += card;
            });
        })
        .catch(error => console.error('Error fetching data:', error));
});