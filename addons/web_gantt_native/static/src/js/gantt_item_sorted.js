odoo.define('web_gantt_native.Item_sorted', function (require) {
"use strict";


var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');
var Model = require('web.Model');

var list_widget_registry = core.list_widget_registry;
var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;


var GanttListSortingItem = Widget.extend({
    template: "GanttList.sorting.item",

    init: function (parent, record) {

        this.parent = parent;
        this._super(parent);
        this.record = record;

    },
    start: function () {
        var self = this;
        var id = self.record['id'];
        var name = self.record['value_name'];


        if (id !== undefined) {
            // this.$el.append('<span class="task-gantt-item-sorting-name">'+id+'</span>');

            this.$el.prop('id', "task-gantt-item-sorting-" + id + "");
            this.$el.prop('data-id', id);
            this.$el.prop('grouping', true);
            this.$el.prop('allowRowHover', true);
        }
        else{
            this.$el.append('<span class="task-gantt-item-sorting-name"></span>');
        }

        if (self.parent.ItemsSorted){
            this.$el.prop('grouping', true);
            this.$el.append('<i class="fa fa-tasks" aria-hidden="true"></i>');

            this.$el.sortable({

                connectWith: ".task-gantt-items",
                items: 'div:not(.ui-state-disabled-notsort)',
                cancel: ".ui-state-disabled",


            });
            this.$el.toggleClass('ui-state-disabled-notsort');

        }




    },

    renderElement: function () {
        this._super();
        this.$el.data('record', this);

    }
});


function sorted (gantt, ItemsSorted) {

    var self = gantt;

    if (ItemsSorted) {

        var sortable_type = "group";

        var sortable = self.$('.task-gantt-items');
            sortable.sortable({
                placeholder: "ui-state-highlight",
                cursor: 'move',
                items: 'div:not(.ui-state-disabled):not(.ui-state-disabled-group)',
                cancel: ".ui-state-disabled",
                tolerance: "pointer",
                connectWith: '.task-gantt-sorting-item',


            stop: function (event, ui) {

                var record = ui.item.data('record');
                var test2 = $.contains(self.$el[0], record.$el[0]);
                var index = self.widgets.indexOf(record);
                if (index >= 0 && test2) {

                    var record_id = record.record['id'];
                    var subtask_record_project_id = record.record['subtask_project_id'];
                    var project_id = record.record['project_id'];


                    var previous_id = false;
                    var previous_record = false;


                    //Sorting or Grouping
                    //Grouping Parent Element
                    if (ui.item[0].parentElement) {

                        if (ui.item[0].parentElement.hasOwnProperty('grouping')){
                            if (ui.item[0].parentElement.hasOwnProperty('data-id')) {
                                previous_id = ui.item[0].parentElement['data-id'];
                                previous_record = ui.item[0].parentElement['id'];

                            }

                        }

                    }


                    var sorting_ids = false;
                    //Sorting Parent Element
                    if (ui.item[0].previousSibling) {
                        if (ui.item[0].previousSibling.hasOwnProperty('sorting')) {
                            sorting_ids = sortable.sortable('toArray', {attribute: 'id'});
                        }
                    }


                    var record_el = $("#" + previous_record);
                    var record_data = record_el.data('record');


                    var data = {};

                    if (sorting_ids) {
                        record_id = false;
                        var sorting_to = [];
                        var i = 0;
                        _.each(sorting_ids, function (record, i) {

                              var record_el = $("#" + record);
                              var record_data = record_el.data('record');

                              if (record_data) {
                                  i++;
                                  var sorting_element = {
                                      id : record_data.record['id'],
                                      seq: i
                                  };

                                  sorting_to.push(sorting_element)

                              }
                        });

                        var task_model = new Model(self.dataset.model);

                        task_model.call('sorting_update', [sorting_to, subtask_record_project_id, project_id]).then(function(result) {

                            return self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);

                        });
                        return;


                    }

                    data['parent_id'] = previous_id;

                    self.dataset.write(record_id, data, {}).then(function () {
                            return self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                    });

                }
                else{
                    self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
                }

            },

                start: function (event, ui) {
                    var record = ui.item.data('record');
                    var index = self.widgets.indexOf(record);
                    var test2 = $.contains(self.$el[0], record.$el[0]);

                    if (index >= 0 && test2) {

                        var record_project_id = record.record['project_id'];
                        var record_parent_id = record.record['parent_id'];
                        if (record_parent_id){
                            record_parent_id = record_parent_id[0];
                        }

                        var record_id = record.record['id'];

                        $("#task-gantt-item-sorting-" + record_id + "").remove();


                        var sortedIDs = $(".task-gantt-items").sortable('toArray', {attribute: 'id'});

                        _.each(sortedIDs, function (record) {

                            var record_el = $("#" + record);
                            var record_data = record_el.data('record');

                            if (record_data) {

                                var project_id = record_data.record['project_id'];
                                var parent_id = record_data.record['parent_id'];
                                if (parent_id){
                                    parent_id = parent_id[0];
                                }

                                var state_disaable = false;
                                if (project_id !== record_project_id) {

                                    // record_data.$el.css({'opacity': 0.0});
                                    record_data.$el.toggleClass('ui-state-disabled');

                                    state_disaable = true;


                                }

                                if (sortable_type === "group" && state_disaable == false ){

                                    if (parent_id !== record_parent_id ) {
                                        record_data.$el.toggleClass('ui-state-disabled');

                                    }

                                }

                                self.$('.task-gantt-items').sortable("refresh");

                            }
                        });
                    }


                }





            }


        )




    }
}


        //     //Allow Sorted
        //
        //     var sortable = self.$('.task-gantt-items');
        //
        //     sortable.sortable({
        //
        //         placeholder: "ui-state-highlight",
        //         cursor: 'move',
        //         items: 'div:not(.ui-state-disabledd)',
        //
        //
        //         update: function (event, ui) {
        //             var record = ui.item.data('record');
        //             var index = self.widgets.indexOf(record);
        //             var test2 = $.contains(self.$el[0], record.$el[0]);
        //
        //             // var sortedIDs = $(".task-gantt-items" ).sortable('toArray', {attribute: 'id'});
        //
        //             if (index >= 0 && test2) {
        //
        //                 var record_id = record.record['id'];
        //                 var project_id = record.record['project_id'];
        //                 // var mp_level = record.record['mp_level'];
        //                 var depth = record.record['depth'];
        //                 // var path = record.record['path'];
        //
        //
        //                 var TimeToLeft = Math.round((record.record.task_start.getTime()-self.firstDayScale) / self.pxScaleUTC);
        //                 self.TimeToLeft = TimeToLeft ;
        //                 self.ScrollToTop = $('.o_content').scrollTop();
        //
        //
        //                 var data = {};
        //                 var previous = false;
        //                 var next = false;
        //
        //                 if (ui.item[0].previousSibling.hasOwnProperty('data-id')) {
        //                     previous = ui.item[0].previousSibling['data-id'];
        //
        //                 }
        //
        //                 if (ui.item[0].nextSibling) {
        //                     next = ui.item[0].nextSibling['data-id'];
        //                 }
        //
        //                 var previous_proj_id = false;
        //                 var next_proj_id = false;
        //                 var previous_depth = false;
        //                 var next_depth = false;
        //
        //
        //                 var previous_data = $("#task-gantt-item-" + previous + "").data('record');
        //                 if (previous_data) {
        //                     previous_proj_id = previous_data.record['project_id'];
        //                     previous_depth = previous_data.record['depth'];
        //                 }
        //
        //                 var next_data = $("#task-gantt-item-" + next + "").data('record');
        //                 if (next_data) {
        //                     next_proj_id = next_data.record['project_id'];
        //                     next_depth = next_data.record['depth'];
        //                 }
        //
        //
        //                 data['sort_l_prev'] = previous;
        //                 data['sort_r_next'] = next;
        //                 data['sort_depth'] = depth;
        //                 data['sort_prev_depth'] = previous_depth;
        //                 data['sort_next_depth'] = next_depth;
        //                 data['sort_project_id'] = project_id;
        //                 data['sort_prev_proj_id'] = previous_proj_id;
        //                 data['sort_next_proj_id'] = next_proj_id;
        //
        //
        //                 self.dataset.write(record_id, data, {}).done(function () {
        //                     self.do_search(self.last_domains, self.last_contexts, self.last_group_bys, self.options);
        //                 });
        //
        //             }
        //         },
        //
        //
        //
        //         start: function (event, ui) {
        //             var record = ui.item.data('record');
        //             var index = self.widgets.indexOf(record);
        //             var test2 = $.contains(self.$el[0], record.$el[0]);
        //
        //             if (index >= 0 && test2 && record.record['is_group'] == false) {
        //
        //                 // var record_id = record.record['id'];
        //                 var record_project_id = record.record['project_id'];
        //                 var sortedIDs = $(".task-gantt-items").sortable('toArray', {attribute: 'id'});
        //
        //                 _.each(sortedIDs, function (record) {
        //
        //                     var record_el = $("#" + record);
        //                     var record_data = record_el.data('record');
        //
        //                     if (record_data) {
        //                         var depth = record_data.record['depth'];
        //                         var project_id = record_data.record['project_id'];
        //
        //                         if (depth < 0 || project_id != record_project_id) {
        //
        //                             // record_data.$el.css({'background-color': "#f64a0d"});
        //                             record_data.$el.css({'opacity': 0.6});
        //
        //                             var test = '';
        //
        //                         }
        //                     }
        //                 });
        //
        //             }
        //         }
        //
        //     });
        //
        // }


//}




return {
    sorted: sorted,
    GanttListSortingItem : GanttListSortingItem

};


});