(function ($) {
    bgd.channelFilter = function(isActive) {
        this.isActive = isActive;
        this.channelValue = null;
        this.campaignValue = null;
        this.siteValue = null;
    };
    
    bgd.channelFilter.prototype = {
        initialize: function() {
            log('>>> channelFilter#initialize');
            if (this.isActive) {
                var self = this;
                $('#channelSelect').change(function() {
                    log('!!! #channelSelect.change');
                    self.channelValue = null;
                    self.campaignValue = null;
                    self.siteValue = null;
                    $('option:selected', channelSelect).each(function() {
                        self.channelValue = $(this).val();
                    });
                    self.updateCampaignSelect();
                });
                $('#campaignSelect').change(function() {
                    log('!!! #campaignSelect.change');
                    self.campaignValue = null;
                    self.siteValue = null;
                    $('option:selected', campaignSelect).each(function() {
                        self.campaignValue = $(this).val();
                    });
                    self.updateSiteSelect();
                });
                $('#siteSelect').change(function() {
                    log('!!! #siteSelect.change');
                    self.siteValue = null;
                    $('option:selected', siteSelect).each(function() {
                        self.siteValue = $(this).val();
                    });
                });

                this.loadChannels();
            } else {
                $('#channelFilter').remove();
                $('#campaignFilter').remove();
                $('#siteFilter').remove();
            }
            log('<<< channelFilter#initialize');
        },
        
        reset: function() {
            log('>>> channelFilter#reset');
            if (this.isActive) {
                this.channelValue = null;
                this.campaignValue = null;
                this.siteValue = null;

                this.fillChannelSelect();
            }
            log('<<< channelFilter#reset');
        },
        
        loadChannels: function(channelsLoadedCallback) {
            log('>>> channelFilter#loadChannels');

            var query = {
                    select: [{
                             column: 'channel'
                         }, {
                             column: 'campaign'
                         }, {
                             column: 'site'
                         }],
                         from: 'static_daily_channels',
                         where: [{
                             column: 'slice_start__',
                             operator: 'EQUAL',
                             values: [{
                                 value: moment().format('YYYY-MM-DD') + 'T00:00:00.000Z', 
                                 type: 'DATETIME'
                             }]
                         }]
                     };
            var url = 'api/dataaccess?query=' + JSON.stringify(query);
            $.ajax({
                url: url,
                context: this,
                dataType: 'json'
            }).done(function(data, textStatus) {
                log('!!! channelFilter#loadChannels.done');
                this.channelsLoadedCallback(data instanceof Array ? data : JSON.parse(data));
            }).fail(function(jqXHR, textStatus, errorThrown) {
                log('!!! channelFilter#loadChannels.fail');
                log('    error: ' + textStatus + ' ' + jqXHR.status + ' ' + jqXHR.responseText);
                this.channelsLoadedCallback([]);
            });
            
            log('<<< channelFilter#loadChannels');
        },
        
        channelsLoadedCallback: function(response) {
            log('>>> channelFilter#channelsLoadedCallback');
            this.channels = {};
            var self = this;
            $.each(response, function(index, row) {
                var channelIndex = 0;
                var campaignIndex = 1;
                var siteIndex = 2;
                if (index == 0) {
                    channelIndex = $.inArray('channel', row);
                    campaignIndex = $.inArray('campaign', row);
                    siteIndex = $.inArray('site', row);
                } else {
                    var channel = row[channelIndex];
                    var campaign = row[campaignIndex];
                    var site = row[siteIndex];
                    if (self.channels[channel] === undefined) {
                        self.channels[channel] = {};
                    }
                    if (campaign != null && self.channels[channel][campaign] === undefined) {
                        self.channels[channel][campaign] = {};
                    }
                    if (site != null) {
                        self.channels[channel][campaign][site] = {};
                    }
                }
            });
            this.fillChannelSelect();
            log('<<< channelFilter#channelsLoadedCallback');
        },
        
        fillChannelSelect: function() {
            log('>>> channelFilter#fillChannelSelect');
            var channelSelect = $('#channelSelect');
            $('option', channelSelect).remove();
            var channelSelectOptions = channelSelect.prop('options');
            var channelsPresent = false;
            $.each(this.channels, function(key, value) {
                channelSelectOptions[channelSelectOptions.length] = new Option(key, key);
                channelsPresent = true;
            });
            channelSelect.prop('disabled', !channelsPresent);
            this.updateCampaignSelect();
            log('<<< channelFilter#fillChannelSelect');
        },
        
        updateCampaignSelect: function() {
            log('>>> channelFilter#updateCampaignSelect');
            var campaignSelect = $('#campaignSelect');
            $('option', campaignSelect).remove();
            var campaignSelectOptions = campaignSelect.prop('options');
            campaignSelect.prop('disabled', true);
            if (this.channelValue != null) {
                $.each(this.channels[this.channelValue], function(campaignValue) {
                    campaignSelectOptions[campaignSelectOptions.length] = new Option(campaignValue, campaignValue);
                    campaignSelect.prop('disabled', false);
                });
            }
            this.updateSiteSelect();
            log('<<< channelFilter#updateCampaignSelect');
        },
        
        updateSiteSelect: function() {
            log('>>> channelFilter#updateSiteSelect');
            var siteSelect = $('#siteSelect');
            $('option', siteSelect).remove();
            var siteSelectOptions = siteSelect.prop('options');
            siteSelect.prop('disabled', true);
            if (this.channelValue != null && this.campaignValue != null) {
                $.each(this.channels[this.channelValue][this.campaignValue], function(siteValue) {
                    siteSelectOptions[siteSelectOptions.length] = new Option(siteValue, siteValue);
                    siteSelect.prop('disabled', false);
                });
            }
            log('<<< channelFilter#updateSiteSelect');
        }
    };
}(jQuery));
