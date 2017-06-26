(function ($) {

    bgd.lineChart = function(definition) {
        this.definition = definition;
        this.dataContainer = null;
        this.dataTableProcessor = null;
        this.dataTable = null;
    };
    
    bgd.lineChart.prototype = {
        initialize: function(dataContainer) {
            log('>>> lineChart#initialize');
            this.contentBox = new bgd.contentBox(this.definition);
            this.contentBox.initialize();
            this.dataContainer = dataContainer;
            this.dataContainer.registerLoadStateChangeCallback(this.redrawContent, this);
            this.dataTableProcessor = new bgd.dataTableProcessor();
            log('<<< lineChart#initialize');
        },
        
        render: function(parent) {
            log('>>> lineChart#render');
            this.contentBox.render(parent);
            $('#' + this.definition.id).css('height', '16vmax');
            this.redrawContent();
            log('<<< lineChart#render');
        },
        
        redrawContent: function() {
            log('>>> lineChart#redrawContent');
            switch (this.dataContainer.state) {
                case 'initialized':
                case 'loading':
                    this.dataTable = null;
                    this.contentBox.showLoadingBubbles();
                    $('#' + this.definition.id + ' div').first().css('padding-top', '6vmax');
                    break;
                case 'nodata':
                    this.dataTable = null;
                    this.contentBox.showNoDataMessage();
                    break;
                case 'error':
                    this.dataTable = null;
                    this.contentBox.showErrorMessage(this.dataContainer.errorMessage);
                    break;
                case 'loaded':
                    if (this.dataTable == null) {
                        this.dataTable = this.getDataAsGoogleDataTable();
                    }
                    var options = this.buildChartOptions();
                    var chart = new google.visualization.AreaChart(document.getElementById(this.definition.id));
                    chart.draw(this.dataTable, options);
                    break;
            }
            log('<<< lineChart#redrawContent');
        },
        
        buildChartOptions: function() {
            log('>>> lineChart#buildChartOptions');
            var options = $.extend(true, {}, bgd.lineChart.templates.defaultOptions);
            var seriesDefinition = this.definition.seriesDefinition;
            if (seriesDefinition.type == 'static') {
                options.series = [];
                $.each(seriesDefinition.series, function(index, series) {
                    if (typeof series.isOnSecondAxis === 'boolean' && series.isOnSecondAxis) {
                        options.series[index] = {
                            targetAxisIndex: 1
                        };
                    } else {
                        options.series[index] = {
                            targetAxisIndex: 0
                        };
                    }
                });
            } else {
                log('    unsupported series type: ' + seriesDefinition.type);
            }

            var seriesInfo = this.dataTableProcessor.seriesInfo;
            var colors = [];
            var index = 0;
            var numberOfSeries = 0;
            $.each(seriesInfo, function(currentSeriesId, currentSeriesInfo) {
                numberOfSeries++;
                if (currentSeriesInfo.color != null) {
                    colors[index] = currentSeriesInfo.color;
                }
            });
            if (colors.length > 0) {
                options.colors = colors;
            }
            var seriesFiltering = this.definition.seriesDefinition.filtering;
            if (typeof seriesFiltering === 'object') {
                while (options.colors.length < numberOfSeries + 1) {
                    var newColors = $.merge([], options.colors);
                    $.merge(newColors, options.colors);
                    options.colors = newColors;
                }
                options.colors[numberOfSeries] = seriesFiltering.condenseTo.color;
            }

            options.vAxes = [];
            $.each(this.definition.numberFormats, function(numberFormatIndex, numberFormat) {
                if (numberFormatIndex == 0) {
                    $.extend(true, options.vAxis, {format: numberFormat.axis});
                }
                options.vAxes[numberFormatIndex] = {
                    format: numberFormat.axis,
                    minValue: 0
                }
            });
            if (options.vAxes.length == 2) {
                $.extend(true, options.chartArea, {width: '86%'});
            }
            if (typeof this.definition.chartOptions === 'object') {
                $.extend(true, options, this.definition.chartOptions);
            }
            log('<<< lineChart#buildChartOptions: ' + JSON.stringify(options));
            return options;
        },
        
        getDataAsGoogleDataTable: function() {
            log('>>> lineChart#getDataAsGoogleDataTable');

            var seriesDefinition = this.definition.seriesDefinition;
            var categoriesDefinition = this.definition.categoriesDefinition;
            var numberFormats = this.definition.numberFormats;
            var seriesStyles = this.getSeriesStyles(seriesDefinition);
            
            var dataTable = this.dataTableProcessor.process(
                this.dataContainer.data, seriesDefinition, categoriesDefinition, numberFormats, seriesStyles);
            
            log('<<< lineChart#getDataAsGoogleDataTable');
            return dataTable;
        },
        
        getSeriesStyles: function(seriesDefinition) {
            var seriesStyles = {};
            $.each(seriesDefinition.series, function(index, series) {
                seriesStyles[series.name] = 'point { fill-color: #ffffff; stroke-color: ' + series.color + '; stroke-width: 2; }';
            });
            return seriesStyles;
        }
    };
    
    bgd.lineChart.templates = {
        defaultOptions: {
            chartArea: {
                top: 5,
                left: '7%',
                width: '92%',
                height: '82%'
            },
            hAxis: {
                format: 'MMM dd'
            },
            vAxis: {
                minValue: 0,
                format: 'decimal'
            },
            pointSize: 5,
            pointShape: {
                type: 'circle',
                style: 'point { size: 18; }'
            },
            legend: {
                position: 'none'
            },
            lineWidth: 1
        }
    };

    if (bgd.widgetRenderers == null || bgd.widgetRenderers == undefined) {
        bgd.widgetRenderers = {};
    }
    bgd.widgetRenderers['lineChart'] = bgd.lineChart;

}(jQuery));
