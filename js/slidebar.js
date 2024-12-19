const body = document.querySelector('body'),
    sidebar = body.querySelector('nav'),
    toggle = body.querySelector(".toggle"),
    searchBtn = body.querySelector(".search-box"),
    modeSwitch = body.querySelector(".toggle-switch"),
    modeText = body.querySelector(".mode-text");
toggle.addEventListener("click", () => {
    sidebar.classList.toggle("close");
})
searchBtn.addEventListener("click", () => {
        sidebar.classList.remove("close");
    })
    // modeSwitch.addEventListener("click", () => {
    //     body.classList.toggle("dark");
    //     if (body.classList.contains("dark")) {
    //         modeText.innerText = "Light mode";
    //     } else {
    //         modeText.innerText = "Dark mode";
    //     }
    // });

let nav = document.querySelector("nav");
window.onscroll = function() {
    if (document.documentElement.scrollTop > 20) {
        nav.classList.add("sticky");
    } else {
        nav.classList.remove("sticky");
    }
}