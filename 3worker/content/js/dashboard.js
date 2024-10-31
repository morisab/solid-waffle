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

    var data = {"OkPercent": 92.75037369207773, "KoPercent": 7.249626307922272};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5749252615844545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.9616666666666667, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.895, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.7, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.6237113402061856, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.819371727748691, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.5654450261780105, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.03833333333333333, 500, 1500, "Login Request"], "isController": false}, {"data": [0.3883333333333333, 500, 1500, "Home Request"], "isController": false}, {"data": [0.26, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2676, 194, 7.249626307922272, 1075.3908819132987, 28, 7030, 601.0, 2823.800000000001, 3370.2000000000007, 4487.76, 240.49609059045565, 166.2157294755999, 78.44981871236631], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 722.7200000000001, 129, 2980, 633.5, 1091.1000000000006, 1769.2499999999998, 2916.000000000001, 45.214770158251696, 48.61470892991711, 20.532097776940468], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 302.51, 28, 860, 292.5, 475.0, 532.8499999999999, 672.9000000000001, 53.22924059616749, 40.701655651171045, 12.059749822569199], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 415.23666666666685, 69, 2522, 309.0, 686.9000000000001, 1190.0, 2464.88, 45.627376425855516, 14.1694391634981, 10.382010456273765], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 617.3433333333337, 132, 2787, 538.5, 951.7, 1473.8999999999974, 2496.51, 57.570523891767415, 21.493745202456342, 12.9871006044905], "isController": false}, {"data": ["Login Request-2", 194, 0, 0.0, 693.9175257731961, 227, 2587, 601.0, 1007.0, 1537.75, 2458.7500000000014, 34.16696019725255, 26.125712728953857, 7.740951919690032], "isController": false}, {"data": ["Home Request-1", 191, 0, 0.0, 461.58115183246065, 115, 2383, 406.0, 721.2, 905.1999999999971, 2111.5999999999954, 27.281816883302387, 20.86099865197829, 6.181036637623197], "isController": false}, {"data": ["Home Request-0", 191, 0, 0.0, 971.895287958115, 178, 2623, 744.0, 2096.0000000000005, 2403.8, 2588.0399999999995, 26.157217200766915, 8.123042060394413, 5.90070036462613], "isController": false}, {"data": ["Login Request", 300, 194, 64.66666666666667, 2978.4399999999982, 634, 7030, 3271.5, 4454.700000000003, 4900.65, 6283.210000000001, 35.075412136092595, 43.284109011457964, 23.56720595112826], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 1296.6399999999996, 130, 4106, 1097.0, 2404.3000000000006, 2665.9, 3064.5000000000005, 39.10323253388947, 33.70502619101929, 14.461577000782064], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1898.2166666666683, 166, 3337, 2228.0, 3028.5, 3162.3999999999996, 3301.370000000001, 39.856516540454365, 14.59589228776405, 11.949170486249502], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 194, 100.0, 7.249626307922272], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2676, 194, "Test failed: text expected to contain /Logout/", 194, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 194, "Test failed: text expected to contain /Logout/", 194, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
