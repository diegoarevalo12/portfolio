console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'CV/Resume' }

];
  
  
  let nav = document.createElement('nav');
  document.body.prepend(nav);
  

for (let p of pages) {
    let url = p.url;
    let title = p.title;
  
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;
  

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
 
    if (a.host === location.host && a.pathname === location.pathname) {
      a.classList.add('current');
    }
  
    
    if (a.host !== location.host) {
      a.target = '_blank';
    }
  
    nav.append(a);
}

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
  if ('colorScheme' in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme; // Set select dropdown to saved value
  } else {
    // Default to 'Automatic' if no saved preference is found
    select.value = 'light dark';
  }