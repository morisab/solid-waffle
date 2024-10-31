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

    var data = {"OkPercent": 93.56494275562574, "KoPercent": 6.43505724437426};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5523095144097908, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.455, 500, 1500, "Logout Request"], "isController": false}, {"data": [0.85, 500, 1500, "Logout Request-1"], "isController": false}, {"data": [0.7966666666666666, 500, 1500, "Logout Request-0"], "isController": false}, {"data": [0.5716666666666667, 500, 1500, "Login Request-1"], "isController": false}, {"data": [0.7177914110429447, 500, 1500, "Login Request-2"], "isController": false}, {"data": [0.7666666666666667, 500, 1500, "Home Request-1"], "isController": false}, {"data": [0.7481481481481481, 500, 1500, "Home Request-0"], "isController": false}, {"data": [0.045, 500, 1500, "Login Request"], "isController": false}, {"data": [0.5783333333333334, 500, 1500, "Home Request"], "isController": false}, {"data": [0.295, 500, 1500, "Login Request-0"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2533, 163, 6.43505724437426, 1100.3932096328442, 33, 6998, 762.0, 2551.1999999999994, 3221.199999999999, 4346.879999999997, 225.95896520963427, 153.43582738626225, 73.22537424732381], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Logout Request", 300, 0, 0.0, 1116.0433333333333, 119, 4922, 853.5, 2418.3000000000006, 2594.2, 3158.050000000003, 39.494470774091624, 42.464269845971565, 17.934500888625593], "isController": false}, {"data": ["Logout Request-1", 300, 0, 0.0, 493.9133333333332, 33, 4153, 333.5, 1256.8000000000002, 1751.6999999999994, 2252.6200000000013, 40.84967320261438, 31.235638786764703, 9.25500408496732], "isController": false}, {"data": ["Logout Request-0", 300, 0, 0.0, 598.6066666666661, 80, 4302, 383.0, 1361.6000000000004, 1824.5, 2462.4900000000007, 39.67204443268976, 12.320029423432954, 9.026939797672574], "isController": false}, {"data": ["Login Request-1", 300, 0, 0.0, 846.48, 120, 3457, 787.0, 1248.8000000000006, 1381.9, 3195.970000000002, 35.09182360510001, 13.745896815417009, 7.916221926541116], "isController": false}, {"data": ["Login Request-2", 163, 0, 0.0, 660.4233128834354, 48, 3321, 448.0, 1101.8, 2463.399999999995, 3272.3599999999988, 20.764331210191084, 15.877413415605096, 4.704418789808917], "isController": false}, {"data": ["Home Request-1", 135, 0, 0.0, 648.4592592592594, 75, 4152, 384.0, 1610.0, 1872.1999999999991, 4106.6399999999985, 18.409927723987455, 14.077122468634938, 4.170999249965908], "isController": false}, {"data": ["Home Request-0", 135, 0, 0.0, 660.5037037037035, 129, 4883, 437.0, 1314.6000000000004, 2016.9999999999982, 4294.399999999978, 17.32546201232033, 5.38036808585729, 3.908380590669918], "isController": false}, {"data": ["Login Request", 300, 163, 54.333333333333336, 2798.113333333334, 532, 6998, 2805.5, 4068.8000000000006, 5178.149999999998, 6029.770000000001, 27.818991097922847, 32.64230790407084, 18.040325945845698], "isController": false}, {"data": ["Home Request", 300, 0, 0.0, 938.7633333333333, 96, 5492, 768.5, 1886.9000000000003, 2184.7999999999993, 4347.850000000005, 37.453183520599254, 28.179497308052436, 12.267380617977528], "isController": false}, {"data": ["Login Request-0", 300, 0, 0.0, 1551.2033333333338, 172, 3173, 1585.5, 2529.6000000000004, 2698.0499999999997, 2949.51, 29.539188656951556, 10.817573971051594, 8.855987224300906], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /Logout/", 163, 100.0, 6.43505724437426], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2533, 163, "Test failed: text expected to contain /Logout/", 163, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Login Request", 300, 163, "Test failed: text expected to contain /Logout/", 163, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
