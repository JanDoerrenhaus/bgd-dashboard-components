(function ($) {
    bgd.spaceFilter = function(isActive) {
        this.isActive = isActive;
        this.value = null;
    };
    
    bgd.spaceFilter.prototype = {
        initialize: function() {
            log('>>> spaceFilter#initialize');
            if (this.isActive) {
                this.loadSpaces();

                var self = this;
                $('#spaceSelect').change(function() {
                    log('!!! #spaceSelect.change');
                    self.value = null;
                    $('option:selected', spaceSelect).each(function() {
                        self.value = $(this).val();
                    });
                });
            } else {
                $('#spaceFilter').remove();
            }
            log('<<< spaceFilter#initialize');
        },
        
        reset: function() {
            log('>>> spaceFilter#reset');
            if (this.isActive) {
                this.value = null;
                
                this.fillSpaceSelect();
            }
            log('<<< spaceFilter#reset');
        },
        
        loadSpaces: function(channelsLoadedCallback) {
            log('>>> spaceFilter#loadSpaces');
            var hardcodedResponse = [ // TODO
                ['space'],
                ['A'],
                ['B']
            ];
            
            log('<<< spaceFilter#loadSpaces');
            this.spacesLoadedCallback(hardcodedResponse);
        },
        
        spacesLoadedCallback: function(response) {
            log('>>> spaceFilter#spacesLoadedCallback');
            this.spaces = [];
            var self = this;
            $.each(response, function(index, row) {
                var spaceIndex = 0;
                if (index == 0) {
                    spaceIndex = $.inArray('space', row);
                } else {
                    var space = row[spaceIndex];
                    self.spaces.push(space);
                }
            });
            this.fillSpaceSelect();
            log('<<< spaceFilter#spacesLoadedCallback');
        },
        
        fillSpaceSelect: function() {
            log('>>> spaceFilter#fillSpaceSelect');
            var spaceSelect = $('#spaceSelect');
            $('option', spaceSelect).remove();
            var spaceSelectOptions = spaceSelect.prop('options');
            $.each(this.spaces, function(index, value) {
                spaceSelectOptions[spaceSelectOptions.length] = new Option(value, value);
            });
            spaceSelect.prop('disabled', false);
            log('<<< spaceFilter#fillSpaceSelect');
        }
    };
}(jQuery));
