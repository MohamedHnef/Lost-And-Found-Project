document.addEventListener("DOMContentLoaded", function () {
    initBreadcrumbs();
});



function initBreadcrumbs() {
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
}
