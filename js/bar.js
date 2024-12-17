// แสดงสไลด์ของแต่ละ content
function showContent(sectionId) {
  // Hide all content sections
  document.querySelectorAll(".content-section").forEach((section) => {
    section.classList.remove("active");
  });
  // Show the selected section
  document.getElementById(sectionId).classList.add("active");

  // Show sidebar only on the "map1" page
  if (sectionId === "map1") {
    sidebar.style.display = "block"; // Show sidebar
  } else {
    sidebar.style.display = "none"; // Hide sidebar
  }
}

// Show only the first section (home) when the page loads
window.onload = function () {
  showContent("home");
};

// Initial setup: Hide sidebar if not on the "map1" page
document.addEventListener("DOMContentLoaded", () => {
  const activeSection = document.querySelector(".content-section.active");
  if (activeSection && activeSection.id !== "map1") {
    sidebar.style.display = "none"; // Hide sidebar
  }
});
