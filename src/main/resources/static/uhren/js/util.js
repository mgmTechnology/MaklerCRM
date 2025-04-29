// util.js: Utility functions for statistics.html

// Initializes sticky tabs toggle functionality
document.addEventListener("DOMContentLoaded", function() {
  const stickyToggle = document.getElementById("stickyToggle");
  const navTabs = document.querySelector("ul.nav.nav-tabs.mb-3");
  const tabContent = document.getElementById("chartTabsContent");

  function updateSticky() {
    if (stickyToggle.checked) {
      navTabs.classList.add("sticky-tabs");
      tabContent.classList.add("sticky-content");
    } else {
      navTabs.classList.remove("sticky-tabs");
      tabContent.classList.remove("sticky-content");
    }
  }

  stickyToggle.addEventListener("change", updateSticky);
  // Restore saved state
  if (localStorage.getItem("stickyTabs") === "true") {
    stickyToggle.checked = true;
    updateSticky();
  }
  stickyToggle.addEventListener("change", function() {
    localStorage.setItem("stickyTabs", stickyToggle.checked);
  });
});
