function convertDateFormat(date) {
    const parts = date.split('/');
    return `${parts[1]}/${parts[0]}/${parts[2]}`;
}
function getWeekDaybyDate(date) {
    return date.getDay();
}
function getWeekDaybyString(dateString) {
    const date = getDate(dateString);
    return date.getDay();
}
function stringToDate(dateString) {
    const [month, day, year] = dateString.split('/').map(num => parseInt(num, 10));
    const date = new Date(year, month - 1, day);
    return date;
}
function dateToString(date) {
    const dateString = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    return dateString;
}
function downloadCSV(content, fileName) {
    const blob = new Blob([content], {type: "text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
function click_function(iDoc) {
    const tables = iDoc.querySelectorAll('table.PSGROUPBOXWBO');
    let csvData = 'Subject,Start Date,Start Time,End Date,End Time,Description,Location,Guests\n'; // Google Calendar CSV header

    tables.forEach(table => {
        if (table != tables[0]) {
            const title = table.querySelector('td.PAGROUPDIVIDER')?.textContent.trim();
            const classTable = table.querySelector('table[id^="CLASS_MTG_VW$scroll$"]');

            if (!classTable) return;

            const rows = classTable.querySelectorAll('tr');
            let preClassNbr = "", preSection = "", preComponent = "";
            rows.forEach(row => {
                const cols = row.querySelectorAll('td');
                if (cols.length == 7) {
                    let classNbr = cols[0].textContent.trim(); // Class Nbr
                    let section = cols[1].textContent.trim(); // Section
                    let component = cols[2].textContent.trim(); // Component
                    if (!classNbr) { classNbr = preClassNbr; }
                    if (!section) { section = preSection; }
                    if (!component) { component = preComponent; }
                    preClassNbr = classNbr;
                    preSection = section;
                    preComponent = component;

                    const daysTimes = cols[3].textContent.trim().split(' '); // Days & Times
                    const room = cols[4].textContent.trim(); // Room
                    const instructor = cols[5].textContent.trim(); // Instructor
                    const startEndDate = cols[6].textContent.trim(); // Start/End Date

                    const dates = startEndDate.split(' - ');
                    if (dates.length < 2) return;

                    // startDate and endDate is correct now.
                    const startDateString = convertDateFormat(dates[0]);
                    const endDateString = convertDateFormat(dates[1]);

                    const days = daysTimes[0];
                    let sevendays = [false, false, false, false, false, false, false];
                    let regex = /(M)/;
                    sevendays[1] = regex.test(days);
                    regex = /(T(?!r))/;
                    sevendays[2] = regex.test(days);
                    regex = /(W)/;
                    sevendays[3] = regex.test(days);
                    regex = /(Tr)/;
                    sevendays[4] = regex.test(days);
                    regex = /(F)/;
                    sevendays[5] = regex.test(days);
                    const startTime = daysTimes[1].replace(/(AM|PM)/, ' $1');
                    const endTime = daysTimes[3].replace(/(AM|PM)/, ' $1');
                    // ok, now we have startdate, enddate, and what dates should have class from starttime to endtime.
                    // from startdate to enddate, only if (sevendays[getweeknumber()]), we add this day from starttime to endtime.
                    
                    const startDate = stringToDate(startDateString);
                    const endDate = stringToDate(endDateString);
                    for (let i = startDate; i.getTime() <= endDate.getTime(); i.setDate(i.getDate() + 1)) {
                        let date = dateToString(i), day = getWeekDaybyDate(i);
                        if (sevendays[day] == true) {
                            csvData += `${title},${date},${startTime},${date},${endTime},${classNbr} ${section} ${component},${room},${instructor}\n`;
                        }
                    }
                }
            });
        }
    });
    downloadCSV(csvData, "date.csv");
}
// main logic here.

function main_logic() {
    console.log("js is really really a bad language");
    let iframe = document.querySelector('iframe');
    if (iframe) {
        let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
        const targetSpan = iframeDocument.querySelector('#DERIVED_REGFRM1_SS_TRANSACT_TITLE');
        if (targetSpan) {
            const exportButton = iframeDocument.createElement('button');
            exportButton.textContent = 'Click to export as Google CSV';
            exportButton.style.marginLeft = '10px';
            exportButton.style.cursor = 'pointer';
            exportButton.addEventListener('click', function() {
                 click_function(iframeDocument); 
            });

            targetSpan.parentNode.insertBefore(exportButton, targetSpan.nextSibling);
        } else {
            console.error('Target span element not found.');
        }
    } else {
        console.error('iframe element not found.');
    }
}

window.onload = function() {
    setTimeout(function() {
        let iframe = document.querySelector('iframe');
        if (iframe) {
            iframe.addEventListener('load', function() {
                console.log('iframe content loaded');
                main_logic();
            })
        } else {
            console.error('iframe element not found.');
        }
    }, 1000);
};