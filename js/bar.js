// แสดงสไลด์ของแต่ละ content
function showContent(sectionId) {
    // Hide all content sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    // Show the selected section
    document.getElementById(sectionId).classList.add('active');
}

// Show only the first section (home) when the page loads
window.onload = function() {
    showContent('home');
};