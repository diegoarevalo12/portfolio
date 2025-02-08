import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

const projectsTitle = document.querySelector('.projects-title');
if (projectsTitle) {
  projectsTitle.innerText = `${projects.length} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let filteredProjects = [...projects];

function renderPieChart(projectsGiven) {
  let newSVG = d3.select('svg');
  newSVG.selectAll('path').remove();
  d3.select('.legend').selectAll('li').remove();

  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year
  );

  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });

  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));

  newArcs.forEach((arc, idx) => {
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(idx))
      .on('click', () => {
        selectedIndex = selectedIndex === idx ? -1 : idx;

        newSVG.selectAll('path')
          .attr('class', (_, index) => (selectedIndex === index ? 'selected' : ''));

        let legend = d3.select('.legend');
        legend.selectAll('li')
          .attr('class', (_, index) => (selectedIndex === index ? 'selected' : ''));

        if (selectedIndex === -1) {
          renderProjects(filteredProjects, projectsContainer, 'h2'); 
        } else {
          let selectedYear = newData[selectedIndex].label; 
          let filteredByYear = filteredProjects.filter((project) => project.year === selectedYear);
          renderProjects(filteredByYear, projectsContainer, 'h2');
        }
      });
  });

  let legend = d3.select('.legend');
  newData.forEach((d, idx) => {
    legend.append('li')
      .attr('style', `--color:${colors(idx)}`)
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
  });
}

let selectedIndex = -1;

renderPieChart(projects);

let query = '';
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('change', (event) => {
  query = event.target.value;
  filteredProjects = projects.filter((project) => {
    let values = Object.values(project).join(' ').toLowerCase();
    return values.includes(query.toLowerCase());
  });
  
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects); 
});