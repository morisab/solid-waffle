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

    var data = {"OkPercent": 91.6451969083548, "KoPercent": 8.354803091645197};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4944792050055208, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.36666666666666664, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.7683333333333333, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.6916666666666667, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.59, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.6321585903083701, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.6923076923076923, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.6846153846153846, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.021666666666666667, 500, 1500, "Login Request"], "isController": false}, {"data": [0.45, 500, 1500, "Home Request"], "isController": false}, {"data": [0.21666666666666667, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2717, 227, 8.354803091645197, 1292.4979757085, 24, 8371, 770.0, 2948.800000000001, 3942.0, 5349.240000000022, 262.0816050930838, 182.77873902768397, 70.76013432043985], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 1370.2500000000005, 146, 4749, 1054.0, 2609.5000000000014, 3094.8999999999987, 4423.92, 43.79562043795621, 47.088845802919714, 16.20951186131387], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 594.32, 31, 2956, 329.5, 1618.6000000000004, 1861.6, 2522.88, 45.27618472683369, 34.62036390733474, 8.35663956383942], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 759.8, 77, 4557, 440.0, 1819.9, 2137.2999999999997, 4213.450000000001, 44.00117336462306, 13.664426884716926, 8.164280214139044], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 917.5299999999999, 82, 4506, 779.0, 1618.8000000000002, 1812.3999999999999, 4203.700000000015, 42.229729729729726, 14.94069142384572, 7.7531144425675675], "isController": false}, {"data": ["Login Request-2", 227, 0, 0.0, 779.7488986784142, 90, 4482, 575.0, 1716.4000000000005, 1851.8, 3863.8399999999983, 31.721632196757962, 24.255896494200673, 5.854871567565679], "isController": false}, {"data": ["Home Request-1", 195, 0, 0.0, 725.0717948717951, 24, 4572, 458.0, 1770.2, 1933.7999999999984, 4562.4, 29.200359389038635, 22.328009181266847, 5.38951945754717], "isController": false}, {"data": ["Home Request-0", 195, 0, 0.0, 776.2102564102566, 128, 4503, 480.0, 1695.8000000000002, 1911.9999999999986, 4225.559999999998, 26.53422234317594, 8.240119829228465, 4.871517383317458], "isController": false}, {"data": ["Login Request", 300, 227, 75.66666666666667, 3425.94333333333, 453, 8371, 3378.0, 5210.7, 5743.299999999999, 8000.870000000003, 30.696817763225212, 39.862595767676254, 17.836829626266244], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 1213.1733333333334, 163, 5116, 868.0, 2388.5000000000005, 2925.6499999999974, 4823.300000000001, 39.95205753096284, 34.74931644526568, 12.128024495605272], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1858.863333333334, 114, 3725, 1928.0, 3388.6000000000004, 3581.8, 3620.95, 33.21891263425977, 12.165129138522865, 8.564250913520096], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 227, 100.0, 8.354803091645197], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2717, 227, "Test failed: text expected to contain /Logout/", 227, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 227, "Test failed: text expected to contain /Logout/", 227, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
