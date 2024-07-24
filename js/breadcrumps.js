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
            li.textContent = crumb.displayName;
        } else {
            const a = document.createElement("a");
            a.href = crumb.href;
            a.textContent = crumb.displayName;
            li.appendChild(a);
        }
        breadcrumbContainer.appendChild(li);
    });
}

function updateBreadcrumbTrail(currentPage) {
    let breadcrumbTrail = JSON.parse(sessionStorage.getItem('breadcrumbTrail')) || [{ displayName: "Home", href: "index.html" }];
    const displayName = getDisplayName(currentPage);
    const href = getHrefForCrumb(displayName);

    const existingCrumbIndex = breadcrumbTrail.findIndex(crumb => crumb.displayName === displayName);
    if (existingCrumbIndex === -1) {
        breadcrumbTrail.push({ displayName, href });
    } else {
        breadcrumbTrail = breadcrumbTrail.slice(0, existingCrumbIndex + 1);
    }

    return breadcrumbTrail;
}

function getDisplayName(currentPage) {
    if (currentPage === "Item") {
        return localStorage.getItem('selectedItemName') || currentPage;
    }
    return currentPage;
}

function getHrefForCrumb(crumb) {
    switch (crumb) {
        case "Home":
            return "index.html";
        case "Item":
            const selectedItemName = localStorage.getItem('selectedItemId');
            return selectedItemName ? `item.html?id=${selectedItemName}` : "item.html";
        case "Items List":
            return "list_Item.html";
        case "Report Lost":
        case "Report Lost Item":
            return "report_lost.html";
        case "Report Found":
        case "Report Found Item":
            return "report_found.html";
        case "Profile":
            return "profile.html";
        default:
            return crumb.toLowerCase().replace(/\s/g, '_') + ".html";
    }
}

// Additional function to preserve the item selection
function handleItemLinkClick(itemName) {
    localStorage.setItem('selectedItemName', itemName);
    window.location.href = `item.html?id=${itemName}`;
}
