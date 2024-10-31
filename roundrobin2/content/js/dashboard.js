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

    var data = {"OkPercent": 92.37634808478988, "KoPercent": 7.623651915210115};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5396058014131647, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.435, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.77, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.7283333333333334, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.7366666666666667, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.7291666666666666, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.6536585365853659, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.6796875, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.04833333333333333, 500, 1500, "Login Request"], "isController": false}, {"data": [0.4483333333333333, 500, 1500, "Home Request"], "isController": false}, {"data": [0.32166666666666666, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2689, 205, 7.623651915210115, 1065.3518036444798, 44, 7798, 716.0, 2320.0, 2955.0, 4015.6999999999985, 239.10723812911257, 165.7528579606082, 64.35986267339499], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 1178.7433333333336, 286, 3692, 1024.5, 1804.2000000000003, 2752.7, 3146.9900000000007, 39.04216553878189, 41.977953377147315, 14.450176503123373], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 546.7, 44, 2730, 471.5, 950.2000000000023, 1308.6999999999998, 2460.84, 41.26547455295736, 31.553580639614857, 7.616381533700138], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 618.8166666666667, 95, 2841, 499.0, 1159.2000000000025, 1508.2999999999997, 2528.76, 39.729837107667855, 12.337976758045292, 7.37174711958681], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 628.4899999999997, 167, 2545, 476.0, 1202.2000000000003, 1578.9, 2385.420000000004, 39.49967083607637, 14.489641622778144, 7.2518926925608955], "isController": false}, {"data": ["Home Request-1", 192, 0, 0.0, 627.9739583333338, 144, 2375, 490.5, 1271.6000000000001, 1532.7, 2344.31, 23.759435713401807, 18.16761539413439, 4.385286474446232], "isController": false}, {"data": ["Login Request-2", 205, 0, 0.0, 767.1317073170732, 187, 2532, 567.0, 1465.2, 1755.699999999999, 2493.08, 25.12562814070352, 19.21227229899497, 4.637445037688442], "isController": false}, {"data": ["Home Request-0", 192, 0, 0.0, 758.5781249999999, 159, 2670, 517.5, 1696.4000000000012, 2401.45, 2630.9399999999996, 23.032629558541267, 7.15271113243762, 4.2286468330134355], "isController": false}, {"data": ["Login Request", 300, 205, 68.33333333333333, 2644.51, 471, 7798, 2655.0, 3924.8000000000006, 4210.099999999999, 5082.950000000001, 28.91844997108155, 36.308563626614614, 16.412067578802777], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 1187.3733333333323, 166, 3784, 1055.0, 2232.6000000000004, 2692.5499999999997, 3202.9100000000008, 35.31489111241907, 30.50875515008829, 10.655164802825192], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1332.8699999999997, 243, 2726, 1442.0, 2131.8, 2155.95, 2596.2300000000014, 33.68137420006737, 12.334487622094981, 8.683479285954867], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 205, 100.0, 7.623651915210115], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2689, 205, "Test failed: text expected to contain /Logout/", 205, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 205, "Test failed: text expected to contain /Logout/", 205, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
