let data = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line),
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    processCommits();
    displayStats();
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    console.log('Commits:', commits);

    await createScatterplot();
});

let commits = [];

function processCommits() {
    commits = d3
        .groups(data, (d) => d.commit)
        .map(([commit, lines]) => {
            let first = lines[0];
            let { author, date, time, timezone, datetime } = first;
            let ret = {
                id: commit,
                url: 'https://github.com/YOUR_REPO/commit/' + commit,
                author,
                date,
                time,
                timezone,
                datetime,
                hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
                totalLines: lines.length,
            };

            Object.defineProperty(ret, 'lines', {
                value: lines,
                writable: false,
                enumerable: false,
                configurable: false,
            });

            return ret;
        });
}

function displayStats() {
    const dl = d3.select('main').append('dl').attr('class', 'stats');

    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    const numberOfFiles = d3.group(data, (d) => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numberOfFiles);

    const maxFileLength = d3.max(data, (d) => d.line);
    dl.append('dt').text('Maximum file length (in lines)');
    dl.append('dd').text(maxFileLength);

    const longestFile = d3.max(data, (d) => d.file);
    dl.append('dt').text('Longest file');
    dl.append('dd').text(longestFile);
}

function createScatterplot() {
    const width = 1000;
    const height = 600;

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();

    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);

    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);

    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([2, 30]); // adjust these values based on your experimentation

    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const dots = svg.append('g').attr('class', 'dots');

    dots
        .selectAll('circle')
        .data(sortedCommits) // Use sortedCommits to ensure larger dots are rendered first
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines)) // Use radius scale based on totalLines
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        .on('mouseenter', function (event, d) {
            updateTooltipContent(d);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', function () {
            updateTooltipContent({});
            updateTooltipVisibility(false); // Clear tooltip content
        });

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);

    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Add the brush
    const brush = d3.brush()
        .on('start brush end', brushed);

    svg.call(brush);

    // Raise dots and everything after overlay
    svg.selectAll('.dots, .overlay ~ *').raise();

    let brushSelection = null;

    function brushed(event) {
        brushSelection = event.selection;
        updateSelection();
    }

    function isCommitSelected(commit) {
        if (!brushSelection) {
            return false;
        }
        const [x0, y0] = brushSelection[0];
        const [x1, y1] = brushSelection[1];
        return (
            xScale(commit.datetime) >= x0 &&
            xScale(commit.datetime) <= x1 &&
            yScale(commit.hourFrac) >= y0 &&
            yScale(commit.hourFrac) <= y1
        );
    }

    function updateSelection() {
        d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
        updateSelectionCount();
        updateLanguageBreakdown();
    }

    function updateSelectionCount() {
        const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
        const countElement = document.getElementById('selection-count');
        countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;
    }

    function updateLanguageBreakdown() {
        const selectedCommits = brushSelection ? commits.filter(isCommitSelected) : [];
        const container = document.getElementById('language-breakdown');
        if (selectedCommits.length === 0) {
            container.innerHTML = '';
            return;
        }
        const lines = selectedCommits.flatMap((d) => d.lines);
        const breakdown = d3.rollup(
            lines,
            (v) => v.length,
            (d) => d.type
        );
        container.innerHTML = '';
        for (const [language, count] of breakdown) {
            const proportion = count / lines.length;
            const formatted = d3.format('.1~%')(proportion);
            container.innerHTML += `
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            `;
        }
    }
}

function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
        dateStyle: 'full',
    });
    time.textContent = commit.datetime?.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
    
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX+10}px`;
    tooltip.style.top = `${event.clientY+10}px`;
}