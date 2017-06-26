(function ($) {

    bgd.dataTableProcessor = function() {
        this.rawData = null;
        this.processedRawData = null;
        this.seriesInfo = null;
        this.categoryInfo = null;
        this.dataTable = null;
    };

    bgd.dataTableProcessor.prototype = {
        initialize: function() {
            log('>>> dataTableProcessor#initialize');
            this.rawData = null;
            this.processedRawData = null;
            this.seriesInfo = null;
            this.categoryInfo = null;
            this.dataTable = null;
            log('<<< dataTableProcessor#initialize');
        },
        
        process: function(rawData, seriesDefinition, categoryDefinition, numberFormats, seriesStyles) {
            log('>>> dataTableProcessor#create');
            this.rawData = rawData;
            this.processedRawData = this.dictionarify();
            this.seriesInfo = this.obtainSeriesInformation(seriesDefinition);
            this.categoryInfo = this.obtainCategoriesInformation(categoryDefinition);
            this.dataTable = this.initializeDataTable(seriesDefinition.ordering, seriesStyles);
            this.fillDataTable();
            this.doSeriesFiltering(seriesDefinition.filtering);
            this.doCategoryOrdering(categoryDefinition.ordering);
            this.doCategoryFiltering(categoryDefinition.filtering);
            this.applyNumberFormats(numberFormats);
            log('<<< dataTableProcessor#create');
            return this.dataTable;
        },
        
        dictionarify: function() {
            log('>>> dataTableProcessor#dictionarify');
            var processedRawData = [];
            var firstRow = null;
            $.each(this.rawData, function(rowIndex, row) {
                if (rowIndex == 0) {
                    firstRow = row;
                } else {
                    var processedRowDictionary = {};
                    $.each(row, function(cellIndex, cell) {
                        processedRowDictionary[firstRow[cellIndex]] = cell;
                    });
                    processedRawData.push(processedRowDictionary);
                }
            });
            
            log('<<< dataTableProcessor#dictionarify: ' + JSON.stringify(processedRawData));
            return processedRawData;
        },
        
        obtainSeriesInformation: function(seriesDefinition) {
            log('>>> dataTableProcessor#obtainSeriesInformation');
            var seriesInfo = {};
            var processedRawData = this.processedRawData;
            if (seriesDefinition.type == 'static') {
                $.each(seriesDefinition.series, function(seriesDefinitionIndex, currentSeriesDefinition) {
                    var currentSeriesInfo = {};
                    currentSeriesInfo.id = currentSeriesDefinition.name;
                    currentSeriesInfo.title = currentSeriesDefinition.name;
                    currentSeriesInfo.color = currentSeriesDefinition.color;
                    if (typeof currentSeriesDefinition.title === 'string') {
                        currentSeriesInfo.title = currentSeriesDefinition.title;
                    }
                    currentSeriesInfo.rawColumnName = currentSeriesDefinition.name;
                    currentSeriesInfo.isOnSecondAxis = false;
                    if (typeof currentSeriesDefinition.isOnSecondAxis === 'boolean') {
                        currentSeriesInfo.isOnSecondAxis = currentSeriesDefinition.isOnSecondAxis;
                    }
                    seriesInfo[currentSeriesInfo.id] = currentSeriesInfo;
                });
            } else if (seriesDefinition.type == 'dynamic') {
                $.each(processedRawData, function(rowIndex, row) {
                    var seriesId = row[seriesDefinition.columnName];
                    if (typeof seriesInfo[seriesId] === 'undefined') {
                        var currentSeriesInfo = {};
                        currentSeriesInfo.id = seriesId;
                        currentSeriesInfo.title = seriesId;
                        currentSeriesInfo.color = null;
                        currentSeriesInfo.isOnSecondAxis = false;
                        if (typeof seriesDefinition.transformations === 'object' && 
                            typeof seriesDefinition.transformations[seriesId] === 'object')
                        {
                            var transformation = seriesDefinition.transformations[seriesId];
                            if (typeof transformation.title === 'string') {
                                currentSeriesInfo.title = transformation.title;
                            }
                            if (typeof transformation.color === 'string') {
                                currentSeriesInfo.color = transformation.color;
                            }
                            if (typeof transformation.isOnSecondAxis === 'boolean') {
                                currentSeriesInfo.isOnSecondAxis = transformation.isOnSecondAxis;
                            }
                        }
                        currentSeriesInfo.rawColumnName = seriesDefinition.valueColumnName;
                        currentSeriesInfo.idColumnName = seriesDefinition.columnName;
                        currentSeriesInfo.sumOfValues = row[currentSeriesInfo.rawColumnName];
                        currentSeriesInfo.countOfValues = 1;
                        seriesInfo[currentSeriesInfo.id] = currentSeriesInfo;
                    } else {
                        seriesInfo[seriesId].sumOfValues += row[seriesInfo[seriesId].rawColumnName];
                        seriesInfo[seriesId].countOfValues += 1;
                    }
                });
            } else {
                log('    unknown seriesDefinition type: ' + seriesDefinition.type);
            }
            
            log('<<< dataTableProcessor#obtainSeriesInformation: ' + JSON.stringify(seriesInfo));
            return seriesInfo;
        },

        obtainCategoriesInformation: function(categoryDefinition) {
            log('>>> dataTableProcessor#obtainCategoriesInformation');
            var categoryInfo = {};
            categoryInfo.order = [];
            var categoryColumnName = null;
            if (categoryDefinition.type == 'time') {
                categoryColumnName = 'slice_start__';
                categoryInfo.column = categoryColumnName;
                categoryInfo.dataTableColumnType = 'date';
                categoryInfo.dataTableColumnName = 'Date';
            } else if (categoryDefinition.type == 'column') {
                categoryColumnName = categoryDefinition.columnName;
                categoryInfo.column = categoryColumnName;
                categoryInfo.dataTableColumnType = 'string';
                categoryInfo.dataTableColumnName = 'Category';
            } else {
                log('    unknown categoryDefinition type: ' + categoryDefinition.type);
            }
            $.each(this.processedRawData, function(rowIndex, row) {
                var categoryName = row[categoryColumnName];
                if (categoryInfo.order.indexOf(categoryName) < 0) {
                    categoryInfo.order.push(categoryName);
                }
            });
            log('<<< dataTableProcessor#obtainCategoriesInformation: ' + JSON.stringify(categoryInfo));
            return categoryInfo;
        },
        
        initializeDataTable: function(seriesOrdering, seriesStyles) {
            log('>>> dataTableProcessor#initializeDataTable');
            var seriesInfo = this.seriesInfo;
            var categoryInfo = this.categoryInfo;
            var dataTable = new google.visualization.DataTable();
            dataTable.addColumn(categoryInfo.dataTableColumnType, categoryInfo.dataTableColumnName);
            var dataTableColumnIndex = 1;
            var seriesOrder = [];
            $.each(seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                seriesOrder.push(currentSeriesId);
            });
            if (typeof seriesOrdering === 'object') {
                var sortComparator;
                if (seriesOrdering.on == 'sum') {
                    sortComparator = function(firstSeriesId, secondSeriesId) {
                        var result = seriesInfo[firstSeriesId].sumOfValues - seriesInfo[secondSeriesId].sumOfValues;
                        if (typeof seriesOrdering.descending === 'boolean' && seriesOrdering.descending) {
                            result *= -1;
                        }
                        return result;
                    };
                }
                seriesOrder.sort(sortComparator);
            }
            $.each(seriesOrder, function(currentSeriesIndex, currentSeriesId) {
                var currentSeriesInfo = seriesInfo[currentSeriesId];
                dataTable.addColumn('number', currentSeriesInfo.title, currentSeriesInfo.id);
                seriesInfo[currentSeriesId].dataTableColumnIndex = dataTableColumnIndex++;
                if (typeof seriesStyles === 'object' && typeof seriesStyles[currentSeriesId] === 'string') {
                    dataTable.addColumn({type:'string',role:'style'});
                    seriesInfo[currentSeriesId].dataTableStyleColumnIndex = dataTableColumnIndex++;
                    seriesInfo[currentSeriesId].styleValue = seriesStyles[currentSeriesId];
                }
            });
            dataTable.addRows(categoryInfo.order.length);
            $.each(categoryInfo.order, function(categoryIndex, categoryName) {
                var value = categoryName;
                if (categoryInfo.dataTableColumnType == 'date') {
                    value = moment(value);
                    value = new Date(value.year(), value.month(), value.date());
                }
                dataTable.setCell(categoryIndex, 0, value);
            });
            log('<<< dataTableProcessor#initializeDataTable');
            return dataTable;
        },
        
        fillDataTable: function() {
            log('>>> dataTableProcessor#fillDataTable');
            var seriesInfo = this.seriesInfo;
            var categoryInfo = this.categoryInfo;
            var dataTable = this.dataTable;
            $.each(this.processedRawData, function(rowIndex, row) {
                var category = row[categoryInfo.column];
                $.each(seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                    var value = row[currentSeriesInfo.rawColumnName];
                    if (typeof currentSeriesInfo.idColumnName === 'undefined' || row[currentSeriesInfo.idColumnName] == currentSeriesId) {
                        var rowIndex = categoryInfo.order.indexOf(category);
                        dataTable.setCell(rowIndex, currentSeriesInfo.dataTableColumnIndex, value);
                        if (typeof currentSeriesInfo.styleValue === 'string') {
                            dataTable.setCell(rowIndex, currentSeriesInfo.dataTableStyleColumnIndex, currentSeriesInfo.styleValue);
                        }
                    }
                });
            });
            
            log('<<< dataTableProcessor#fillDataTable: ' + dataTable.toJSON());
        },
        
        doSeriesFiltering: function(seriesFiltering) {
            log('>>> dataTableProcessor#doSeriesFiltering');

            if (typeof seriesFiltering === 'object') {
                var seriesInfo = this.seriesInfo;
                var dataTable = this.dataTable;
                var condensationColumnIndex = null;
                if (typeof seriesFiltering.condenseTo === 'object') {
                    condensationColumnIndex = dataTable.getNumberOfColumns();
                    dataTable.addColumn('number', seriesFiltering.condenseTo.title, seriesFiltering.condenseTo.name);
                }
                for (var rowIndex = 0; rowIndex < dataTable.getNumberOfRows(); rowIndex++) {
                    var seriesWithValues;
                    var count = 0;
                    do
                    {
                        seriesWithValues = 0;
                        var seriesToRemove = null;
                        var valueToRemove = null;
                        $.each(seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                            var seriesValue = dataTable.getValue(rowIndex, currentSeriesInfo.dataTableColumnIndex);
                            if (seriesValue != null)
                            {
                                if (seriesToRemove == null || 
                                    (seriesFiltering.greatest && seriesValue <= valueToRemove) || 
                                    (!seriesFiltering.greatest && seriesValue >= valueToRemove))
                                {
                                    seriesToRemove = currentSeriesId;
                                    valueToRemove = seriesValue;
                                }
                                seriesWithValues++;
                            }
                        });
                        if (seriesWithValues > seriesFiltering.amount) {
                            dataTable.setValue(rowIndex, seriesInfo[seriesToRemove].dataTableColumnIndex, null);
                            if (condensationColumnIndex != null) {
                                var previousValue = dataTable.getValue(rowIndex, condensationColumnIndex);
                                if (previousValue == null) {
                                    previousValue = 0;
                                }
                                dataTable.setValue(rowIndex, condensationColumnIndex, previousValue + valueToRemove);
                            }
                        }
                        count++;
                    }
                    while (seriesWithValues > seriesFiltering.amount);
                }
            }
            
            log('<<< dataTableProcessor#doSeriesFiltering');
        },
        
        doCategoryOrdering: function(categoryOrdering) {
            log('>>> dataTableProcessor#doCategoryOrdering');
            if (typeof categoryOrdering === 'object') {
                var columnIndex = this.seriesInfo[categoryOrdering.seriesId].dataTableColumnIndex;
                var descending = false;
                if (typeof categoryOrdering.descending === 'boolean') {
                    descending = categoryOrdering.descending;
                }
                this.dataTable.sort({column: columnIndex, desc: descending});
            }
            log('<<< dataTableProcessor#doCategoryOrdering');
        },
        
        doCategoryFiltering: function(categoryFiltering) {
            log('>>> dataTableProcessor#doCategoryFiltering');
            if (typeof categoryFiltering === 'object') {
                var numberOfRows = this.dataTable.getNumberOfRows();
                if (typeof categoryFiltering.condenseTo === 'object') {
                    var condenseRow = [categoryFiltering.condenseTo.title];
                    for (var i = 0; i < this.dataTable.getNumberOfColumns() - 1; i++) {
                        condenseRow.push(0);
                    }
                    this.dataTable.addRow(condenseRow);
                }
                
                var cellIndex = this.seriesInfo[categoryFiltering.seriesId].dataTableColumnIndex;
                while (numberOfRows > categoryFiltering.amount) {
                    var rowIndexToRemove = null;
                    var rowValueToRemove = null;
                    for (var rowIndex = 0; rowIndex < numberOfRows; rowIndex++) {
                        var rowValue = this.dataTable.getValue(rowIndex, cellIndex);
                        if (rowIndexToRemove == null || 
                            (categoryFiltering.greatest && rowValue <= rowValueToRemove) || 
                            (!categoryFiltering.greatest && rowValue >= rowValueToRemove))
                        {
                            rowIndexToRemove = rowIndex;
                            rowValueToRemove = rowValue;
                        }
                    }
                    if (typeof categoryFiltering.condenseTo === 'object') {
                        var condenseRowIndex = this.dataTable.getNumberOfRows() - 1;
                        for (var i = 1; i < this.dataTable.getNumberOfColumns(); i++) {
                            var previousValue = this.dataTable.getValue(condenseRowIndex, i);
                            var valueToAdd = this.dataTable.getValue(rowIndexToRemove, i);
                            this.dataTable.setValue(condenseRowIndex, i, previousValue + valueToAdd);
                        }
                    }
                    var dataTable = this.dataTable;
                    $.each(this.seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                        dataTable.setValue(rowIndexToRemove, currentSeriesInfo.dataTableColumnIndex, null);
                    });
                    numberOfRows--;
                }
            }
            log('<<< dataTableProcessor#doCategoryFiltering');
        },
        
        applyNumberFormats: function(numberFormats) {
            log('>>> dataTableProcessor#applyNumberFormats');
            var dataTable = this.dataTable;
            $.each(this.seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                var numberFormat;
                if (currentSeriesInfo.isOnSecondAxis) {
                    numberFormat = numberFormats[1];
                } else {
                    numberFormat = numberFormats[0];
                }
                var format = numberFormat.axis;
                if (typeof numberFormat.value === 'string') {
                    format = numberFormat.value;
                }
                var formatter = new google.visualization.NumberFormat({pattern: format});
                formatter.format(dataTable, currentSeriesInfo.dataTableColumnIndex);
            });
            log('<<< dataTableProcessor#applyNumberFormats');
        }
    };

}(jQuery));
