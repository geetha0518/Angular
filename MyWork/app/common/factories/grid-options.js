(function() {
    'use strict';

    var module = angular.module('fmc.common');

    module.factory('gridOptions', [function() {
        var initializeMultiSelectFilter = function(gridOptions, menu, field) {            
            var helpText = menu.find('.k-filter-help-text');
            var operatorDropdown = menu.find('[role=listbox]');
            var input = menu.find('input');
            var filterButton = menu.find('[type=submit]');
            var fieldName = _.filter(gridOptions.columns, function(item) { return item.field == field })[0].title;

            helpText.text("Filter table by " + fieldName + " (click below for options)");
            operatorDropdown.remove();
            input.removeAttr('data-bind');
           
            input.css({ width: '400px' });

            // obtain a unique list of the column values for the selected column 
            var selectOptions = _.map(gridOptions.dataSource._pristineData, function(item) {                
                return item[field];                
            });
            
            selectOptions = _.without(_.uniq(selectOptions), '');            

            var multiSelect = input.kendoMultiSelect({
                dataSource: selectOptions                
            }).data("kendoMultiSelect");

            filterButton.on('click', { select: multiSelect, gridOptions: gridOptions, field: field }, function(e) {
                updateFilters(e.data.gridOptions, e.data.select.value(), e.data.field);
            });
        };

        var updateFilters = function(gridOptions, selections, field) {
            // Note: this function is more complicated than it should have to be because
            // Kendo internally messes with the filters to try and optimize their definition,
            // making it impossible to predictably modify them.
            // Therefore, the approach here is the read the current configuration,
            // and then totally re-build it in a predictable way each time, keeping only what we need
            
            // get existing fields and make sure they are in our expected format
            var filter = gridOptions.dataSource.filter() || {
                logic: 'and',
                filters: []
            };

            // ensure master filter's logic is set to 'and'
            filter.logic = 'and';

            var newGroups = {};

            // ensure each field is defined as a group with it's own separate logic (vs flat fields)
            filter.filters = _.filter(filter.filters, function(item) {
                // find items which are not in groups
                if (!item.logic) {      
                    var group = newGroups[item.field];
                    if (!group) {
                        group = newGroups[item.field] = {
                            logic: 'or',
                            filters: []
                        };
                    }

                    group.filters.push({
                        field: item.field,
                        value: item.value
                    });

                    return false; // don't include
                } else {
                    return true;
                }
            });

            // push new dictionary items into master filters            
            _.each(newGroups, function(value, key) {
                filter.filters.push(value);
            });

            // now that we have a predictable format, cull group for currently modified group, leaving others in place
            filter.filters = _.filter(filter.filters, function(item) {
               // each field has a group of "or'd" terms and should not exist unless there is at least one item
               return item.filters[0].field != field;               
            });

            // re-create current group with new filters if selections were made
            if (selections.length > 0) {
                var fieldFilters = [];

                _.each(selections, function(value) {
                    fieldFilters.push({
                        field: field,
                        operator: 'equals',
                        value: value
                    });
                });

                // push new group for this fields filters
                filter.filters.push({
                    logic: 'or',
                    filters: fieldFilters
                });
            }

            // re-calculate rows with new filter
            gridOptions.dataSource.filter(filter);
        };

        return function(templateId, columns, opts) {            
            var options = {
                filterMenuInit: function(e) {
                    var gridOptions = e.sender.element.data('kendoGrid');
                    var element = e.container;
                    var field = e.field;

                    initializeMultiSelectFilter(gridOptions, element, field);
                },
                dataSource: new kendo.data.DataSource({
                    pageSize: 50,
                    filter: {
                        logic: 'and',
                        filters: []
                    }
                }),
                dataBound: function(e) {
                    // apply alt row class here every time data binding changes
                    // this is a shortcut to avoid having to create an alternate row template for every grid on the site
                    // a small performance hit is incurred for this
                    // only apply this logic if using custom template
                    if (e.sender.options.rowTemplate.length > 0) {
                        e.sender.table.find('tr:odd').addClass('k-alt');
                    }

                    if (e.sender && e.sender.options && e.sender.options.onDataBound)
                        e.sender.options.onDataBound(e);
                },
                onDataBound: function(e) {
                    // override me in indivdual instances.
                    // don't override above or zebra stripes will go away.
                },
                autoBind: true,
                scrollable: false,
                sortable: {
                    mode: 'single'
                },
                pageable: true,
                resizable: true,
                filterable: {
                    extra: false
                },
                columnMenu: false,
                reorderable: true,
                columns: columns
            };

            if (opts) {
                _.extend(options, opts);
            }

            if (templateId) {
                options.rowTemplate = kendo.template($('#' + templateId).html());
            }

            return options;
        };
    }]);   
})();