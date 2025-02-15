let data = [];

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        date: new Date(row.date + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));

    // Once data is loaded, call processCommits() and displayStats()
    displayStats();
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
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
    // Create the dl element in the main element
    const dl = d3.select('main').append('dl').attr('class', 'stats');

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Add more stats as needed...
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