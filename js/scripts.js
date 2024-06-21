/*Breadcrumb Navigation*/
document.addEventListener("DOMContentLoaded", function () {
    const breadcrumbContainer = document.getElementById("breadcrumb");
    const currentPage = document.title.split(' - ')[1];
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];
    
    if (!breadcrumbTrail.includes(currentPage)) {
        breadcrumbTrail.push(currentPage);
    } else {
        breadcrumbTrail = breadcrumbTrail.slice(0, breadcrumbTrail.indexOf(currentPage) + 1);
    }
    sessionStorage.setItem('breadcrumbTrail', JSON.stringify(breadcrumbTrail));
    
    breadcrumbContainer.innerHTML = '';
    breadcrumbTrail.forEach((crumb, index) => {
        const li = document.createElement("li");
        li.classList.add("breadcrumb-item");
        if (index === breadcrumbTrail.length - 1) {
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
                                    <div class="card-detail"><i class="bi bi-calendar"></i> <span>${item.lostDate}</span></div>
                                    <div class="card-detail"><i class="bi bi-tag"></i> <span>${item.category}</span></div>
                                    <div class="card-detail"><i class="bi bi-clock"></i> <span>${item.timeLost}</span></div>
                                    <div class="card-detail"><i class="bi bi-geo-alt"></i> <span>${item.locationLost}</span></div>
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
/* filter function */
document.addEventListener('DOMContentLoaded', function() {
    const data = [{date: '2023-06-01', location: 'New York', category: 'Electronics', status: 'Lost'},
                  {date: '2023-06-05', location: 'San Francisco', category: 'Clothing', status: 'Found'}];

    const locations = [...new Set(data.map(item => item.location))];
    const categories = [...new Set(data.map(item => item.category))];
    const statuses = [...new Set(data.map(item => item.status))];

    locations.forEach(loc => locationSelect.add(new Option(loc, loc)));
    categories.forEach(cat => categorySelect.add(new Option(cat, cat)));
    statuses.forEach(stat => statusSelect.add(new Option(stat, stat)));

    document.getElementById('applyFilter').addEventListener('click', () => {
        const filteredData = data.filter(item => 
            (!fromDate.value || new Date(item.date) >= new Date(fromDate.value)) &&
            (!toDate.value || new Date(item.date) <= new Date(toDate.value)) &&
            (!location.value || item.location === location.value) &&
            (!category.value || item.category === category.value) &&
            (!status.value || item.status === status.value)
        );
        console.log('Filtered Data:', filteredData);
        // Update items list with filtered data
    });

    document.getElementById('clearFilter').addEventListener('click', () => {
        document.getElementById('filterForm').reset();
    });
});

/*Sorting Items function*/

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sortByFound').addEventListener('click', () => {
        const sortedData = [...data].sort((a, b) => a.status.localeCompare(b.status));
        console.log('Sorted by Found:', sortedData);
        // Update items list with sorted data
    });

    document.getElementById('sortByLost').addEventListener('click', () => {
        const sortedData = [...data].sort((a, b) => b.status.localeCompare(a.status));
        console.log('Sorted by Lost:', sortedData);
        // Update items list with sorted data
    });
});
