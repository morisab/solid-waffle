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

    var data = {"OkPercent": 92.85981308411215, "KoPercent": 7.140186915887851};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6024299065420561, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5033333333333333, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.9033333333333333, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.8083333333333333, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.695, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.7041884816753927, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.8229166666666666, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.7213541666666666, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.07166666666666667, 500, 1500, "Login Request"], "isController": false}, {"data": [0.5383333333333333, 500, 1500, "Home Request"], "isController": false}, {"data": [0.415, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2675, 191, 7.140186915887851, 907.1390654205593, 28, 5238, 616.0, 1919.0000000000005, 2606.7999999999993, 3797.319999999996, 244.82884861797547, 169.10333579306243, 65.77183295579351], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 976.4733333333336, 186, 3071, 698.0, 1760.9, 1962.8, 2771.4500000000007, 39.46329913180742, 42.43075424230466, 14.606045284135753], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 390.1433333333333, 33, 1643, 270.5, 967.9000000000008, 1303.9999999999998, 1501.8200000000002, 41.952174521046004, 32.07866469724514, 7.743125961404], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 551.2666666666665, 61, 1889, 331.0, 1393.5000000000002, 1462.0, 1650.89, 39.78252221190824, 12.354337952526189, 7.38152267603766], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 613.5733333333337, 28, 1949, 575.5, 1085.5000000000005, 1306.75, 1782.3200000000015, 36.153289949385396, 13.561955817666908, 6.637518076644975], "isController": false}, {"data": ["Login Request-2", 191, 0, 0.0, 597.7958115183245, 138, 2200, 531.0, 1341.6000000000004, 1492.3999999999978, 2073.9599999999978, 24.290983085336386, 18.574062261541396, 4.483394338992751], "isController": false}, {"data": ["Home Request-1", 192, 0, 0.0, 481.53124999999983, 60, 1670, 339.0, 1099.7000000000005, 1361.1999999999996, 1534.219999999999, 26.0657073038284, 19.931102362204726, 4.8109557426011405], "isController": false}, {"data": ["Home Request-0", 192, 0, 0.0, 621.1770833333331, 88, 2600, 512.5, 1384.0000000000002, 1501.1999999999998, 2115.4699999999966, 24.628014366341713, 7.6481528989225245, 4.521549512570549], "isController": false}, {"data": ["Login Request", 300, 191, 63.666666666666664, 2256.4933333333347, 228, 5238, 2263.0, 3749.6000000000004, 4166.55, 5130.02, 28.65329512893983, 35.19085407712512, 16.01478554799427], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 980.7866666666671, 133, 2938, 815.5, 1819.8000000000004, 1951.4499999999998, 2487.970000000002, 37.9746835443038, 32.8065664556962, 11.45767405063291], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1233.5900000000004, 110, 3083, 1280.0, 2141.8, 2335.9499999999994, 2974.4000000000005, 29.779630732578916, 10.905626488981536, 7.677561048243002], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 191, 100.0, 7.140186915887851], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2675, 191, "Test failed: text expected to contain /Logout/", 191, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 191, "Test failed: text expected to contain /Logout/", 191, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
