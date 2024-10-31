/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.92101341281669, "KoPercent": 7.078986587183309};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5668777943368107, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5533333333333333, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.8666666666666667, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.8416666666666667, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.44, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.6973684210526315, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.8071065989847716, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.7588832487309645, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.043333333333333335, 500, 1500, "Login Request"], "isController": false}, {"data": [0.5716666666666667, 500, 1500, "Home Request"], "isController": false}, {"data": [0.285, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2684, 190, 7.078986587183309, 1082.3058867362108, 12, 6340, 626.0, 2343.5, 3800.25, 4917.450000000001, 267.9712460063898, 185.179689060004, 71.98657928564297], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 875.7966666666672, 76, 2415, 832.5, 1405.5000000000005, 1631.75, 2131.790000000002, 49.02761889197581, 52.71426601568884, 18.145964414119955], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 413.33333333333366, 12, 1476, 359.0, 735.5000000000002, 854.6999999999999, 1334.010000000001, 51.00306018361102, 38.99941027711663, 9.413650756545394], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 456.1433333333332, 64, 1473, 387.5, 812.0, 1055.3999999999999, 1420.4200000000005, 49.123956115932536, 15.255291059439987, 9.114796544948419], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 1117.586666666666, 125, 3647, 1344.5, 1869.0, 2075.45, 2262.3100000000004, 42.58943781942078, 16.00153943072118, 7.819154599659285], "isController": false}, {"data": ["Login Request-2", 190, 0, 0.0, 608.9736842105264, 55, 1976, 514.0, 1397.0, 1683.5, 1872.2600000000004, 27.088679783290562, 20.713316670230967, 4.9997660928143715], "isController": false}, {"data": ["Home Request-1", 197, 0, 0.0, 503.74619289340114, 53, 3645, 410.0, 854.4000000000001, 1311.3999999999996, 3605.8, 32.36937232993756, 24.75118997494249, 5.974425166365428], "isController": false}, {"data": ["Home Request-0", 197, 0, 0.0, 584.7969543147204, 40, 3644, 473.0, 1372.8000000000002, 1435.7, 2194.580000000015, 27.560156687185227, 8.558720533715725, 5.059872516787913], "isController": false}, {"data": ["Login Request", 300, 190, 63.333333333333336, 3208.1333333333328, 318, 6340, 3538.5, 4853.700000000002, 5062.5, 5981.290000000001, 31.545741324921135, 38.68152766824395, 17.61201202681388], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 913.8866666666668, 100, 4068, 760.5, 1814.8000000000002, 2145.9499999999994, 3877.9300000000103, 41.45936981757877, 36.22256015927308, 12.636605384535656], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1597.6566666666665, 128, 3907, 1976.5, 2347.2000000000003, 2594.0, 3700.8, 32.94169320303064, 12.063608350719228, 8.492780278906336], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 190, 100.0, 7.078986587183309], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2684, 190, "Test failed: text expected to contain /Logout/", 190, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 190, "Test failed: text expected to contain /Logout/", 190, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
