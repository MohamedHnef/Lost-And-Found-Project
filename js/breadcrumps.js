document.addEventListener("DOMContentLoaded", function () {
    initBreadcrumbs();
});

function initBreadcrumbs() {
    const breadcrumbContainer = document.getElementById("breadcrumb");
    const currentPage = document.title.split(' - ')[1];
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];

    let itemName = null;
    if (currentPage === "Item") { 
        itemName = localStorage.getItem('selectedItemName');
    }

    const displayName = itemName || currentPage;

    if (!breadcrumbTrail.includes(displayName)) {
        breadcrumbTrail.push(displayName);
    } else {
        breadcrumbTrail = breadcrumbTrail.slice(0, breadcrumbTrail.indexOf(displayName) + 1);
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
}