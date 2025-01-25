console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'CV/Resume' },
    { url: 'https://github.com/diegoarevalo12', title: 'GitHub' } // Add GitHub link here
];

// Create navigation and add it to the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// Dynamically create navigation links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust URL for the home page if necessary
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight current page in the nav
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open external links (like GitHub) in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    nav.append(a);
}

// Inject the theme switcher dropdown into the page (always at the top)
document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
        Theme:
        <select id="theme-switcher">
          <option value="light dark">Automatic</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </label>`
);

// Get the select element for the theme switcher
const select = document.getElementById('theme-switcher');

// Apply the theme when user selects an option
select.addEventListener('input', function (event) {
  const selectedTheme = event.target.value;

  // Set the color-scheme to the selected theme
  document.documentElement.style.setProperty('color-scheme', selectedTheme);

  // Save the selected theme in localStorage
  localStorage.colorScheme = selectedTheme;
});

// Check for saved color scheme preference on page load
window.addEventListener('DOMContentLoaded', () => {
  if ('colorScheme' in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme; // Set select dropdown to saved value
  } else {
    // Default to 'Automatic' if no saved preference is found
    select.value = 'light dark';
    document.documentElement.style.setProperty('color-scheme', 'light dark');
  }
});

// Ensure the toggle button is correctly positioned
const style = document.createElement('style');
style.innerHTML = `
  .color-scheme {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 80%;
    font-family: inherit;
    z-index: 1000; /* Ensure it is on top of other content */
  }
`;
document.head.appendChild(style);