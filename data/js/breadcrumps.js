document.addEventListener("DOMContentLoaded", initBreadcrumbs);

function initBreadcrumbs() {
    const breadcrumbContainer = document.getElementById("breadcrumb");
    const currentPage = document.title.split(' - ')[1];
    const breadcrumbTrail = updateBreadcrumbTrail(currentPage);

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
            a.href = getHrefForCrumb(crumb);
            a.textContent = crumb;
            li.appendChild(a);
        }
        breadcrumbContainer.appendChild(li);
    });
};

function updateBreadcrumbTrail(currentPage) {
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || ["Home"];
    const displayName = getDisplayName(currentPage);

    if (!breadcrumbTrail.includes(displayName)) {
        breadcrumbTrail.push(displayName);
    } else {
        breadcrumbTrail = breadcrumbTrail.slice(0, breadcrumbTrail.indexOf(displayName) + 1);
    }
    return breadcrumbTrail;
};

function getDisplayName(currentPage) {
    if (currentPage === "Item") {
        return localStorage.getItem('selectedItemName') || currentPage;
    }
    return currentPage;
};

function getHrefForCrumb(crumb) {
    switch (crumb) {
        case "Home":
            return "index.html";
        case "Item":
            const selectedItemName = localStorage.getItem('selectedItemName');
            return selectedItemName ? `item.html?item=${selectedItemName}` : "item.html";
        case "Items List":
            return "list_Item.html";
        case "Report Lost":
        case "Report Lost Item":
            return "report_lost.html";
        case "Profile":
            return "profile.html";
        default:
            return crumb.toLowerCase().replace(/\s/g, '_') + ".html";
    }
};

// Additional function to preserve the item selection
function handleItemLinkClick(itemName) {
    localStorage.setItem('selectedItemName', itemName);
    window.location.href = `item.html?item=${itemName}`;
};