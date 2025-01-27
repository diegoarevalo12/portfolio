console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'CV/Resume' },
    { url: 'https://github.com/diegoarevalo12', title: 'GitHub' } 
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

select.addEventListener('input', function (event) {
  const selectedTheme = event.target.value;

  
  document.documentElement.style.setProperty('color-scheme', selectedTheme);

  
  localStorage.colorScheme = selectedTheme;
});


window.addEventListener('DOMContentLoaded', () => {
  if ('colorScheme' in localStorage) {
    const savedScheme = localStorage.colorScheme;
    document.documentElement.style.setProperty('color-scheme', savedScheme);
    select.value = savedScheme; 
  } else {
    
    select.value = 'light dark';
    document.documentElement.style.setProperty('color-scheme', 'light dark');
  }
});


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