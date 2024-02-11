function createTable(data) {
    // Create a new table
    let table = document.createElement('table');

    // Create table header
    let thead = document.createElement('thead');
    let headerRow = document.createElement('tr');
    let headers = ['score', 'label', 'mask'];
    headers.forEach(header => {
        let th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create table body
    let tbody = document.createElement('tbody');
    data.forEach((item, index) => {
        let row = document.createElement('tr');
        headers.forEach(header => {
            let td = document.createElement('td');
            if (header === 'mask') {
                // Create a button to toggle visibility of mask details
                let button = document.createElement('button');
                button.textContent = 'Show mask details';
                button.onclick = function() {
                    // Toggle visibility of mask details
                    let maskDetails = this.nextSibling;
                    maskDetails.style.display = maskDetails.style.display === 'none' ? '' : 'none';
                };

                // Create a div for mask details and hide it by default
                let maskDetails = document.createElement('div');
                maskDetails.style.display = 'none';
                for (let maskKey in item[header]) {
                    maskDetails.appendChild(document.createTextNode(maskKey + ': ' + item[header][maskKey]));
                    maskDetails.appendChild(document.createElement('br'));
                }

                td.appendChild(button);
                td.appendChild(maskDetails);
            } else if (header === 'label') {
                // Create a button for label
                let button = document.createElement('button');
                button.classList.add('seg-label-button');
                button.textContent = item[header];
                button.id = 'segment_' + index;
                td.appendChild(button);
            } else {
                td.textContent = item[header];
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
    table.appendChild(tbody);

    return table;
}

