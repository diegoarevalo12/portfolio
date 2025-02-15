console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// ../ - taking one step back
// ./  - look inside current dir (folder)
// /   - look from the root

let pages = [
    { url: 'index.html', title: 'Home' },
    { url: 'projects/index.html', title: 'Projects' },
    { url: 'contact/index.html', title: 'Contact' },
    { url: 'resume/index.html', title: 'CV/Resume' },
    { url: 'meta/index.html', title: 'Meta' },
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

export async function fetchJSON(url) {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
  }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    
  const validHeadings = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  if (!validHeadings.includes(headingLevel)) {
  headingLevel = 'h2'; 
  }
  
  if (!containerElement) {
      console.error("Invalid container element.");
      return;
  }

  containerElement.innerHTML = '';

  projects.forEach((project) => {
      const article = document.createElement('article');
      
      article.innerHTML = `
          <${headingLevel}>${project.title || 'Untitled Project'}</${headingLevel}>
          <img src="${project.image || 'default-image.jpg'}" alt="${project.title || 'Untitled Project'}">
          <div>
          <p>${project.description || 'No description available.'}</p>
          <p class="project-year">${project.year || 'Year not available'}</p>
          </div>
      `;

      containerElement.appendChild(article);
  });
}

export async function fetchGithubData(username) {
  try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
          throw new Error(`GitHub API request failed: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error fetching GitHub data:', error);
  }
}
