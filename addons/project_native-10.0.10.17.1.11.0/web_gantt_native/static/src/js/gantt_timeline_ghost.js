odoo.define('web_gantt_native.Ghost', function (require) {
"use strict";

var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');
var time = require('web.time');
var formats = require('web.formats');
var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;


function get_data_ghosts (parentg) {

        var ghosts = parentg.Ghost;
        var ghost_id = parentg.fields_view.arch.attrs.ghost_id;
        var ghost_ids_name = parentg.fields_view.arch.attrs.ghost_name;
        var ghost_ids_date_start = parentg.fields_view.arch.attrs.ghost_date_start;
        var ghost_ids_date_end = parentg.fields_view.arch.attrs.ghost_date_end;
        var ghost_ids_durations = parentg.fields_view.arch.attrs.ghost_durations;

        var data_ghosts = _.map(ghosts, function(ghost) {

                var data_row_id = ghost[ghost_id][0];

                var durations = ghost[ghost_ids_durations];

                var date_start = time.auto_str_to_date(ghost[ghost_ids_date_start]);
                if (!date_start){
                    return
                }
                var date_end = time.auto_str_to_date(ghost[ghost_ids_date_end]);
                if (!date_end){

                    if (durations){
                        date_end = moment(date_start).add(durations*60, 'minutes')._d;
                    }
                    else{
                        return
                    }
                }

                return {
                    data_row_id: data_row_id,
                    name : ghost[ghost_ids_name],
                    date_start : date_start,
                    date_end : date_end,
                    durations : ghost[ghost_ids_durations]
            }
        });

        var data_min = _.min(data_ghosts, function(ghost){ return ghost.date_start; });
        var data_max = _.max(data_ghosts, function(ghost){ return ghost.date_end; });


        try {
            var start_time = data_min["date_start"].getTime();
            parentg.GtimeStopA = parentg.GtimeStopA.concat(start_time);
        } catch (err) {}

        try {
            var stop_time = data_max["date_end"].getTime();
            parentg.GtimeStartA = parentg.GtimeStartA.concat(stop_time);
        } catch (err) {}


        return data_ghosts;



}


var GanttTimeLineGhost = Widget.extend({
    template: "GanttTimeLine.ghost",

    init: function(parent) {
        this._super.apply(this, arguments);
    },


    start: function(){

        var parentg =  this.getParent();


        var data_widgets =  parentg.gantt_timeline_data_widget;

        var data_ghosts = parentg.Ghost_Data;

        _.each(data_widgets, function(widget) {

            if (!widget.record.is_group) {

                var row_id = widget.record.id;

                var link_ghosts = _.where(data_ghosts, {data_row_id: row_id});

                if (link_ghosts.length > 0){

                    var data_min = _.min(link_ghosts, function(ghost){ return ghost.date_start; });
                    var data_max = _.max(link_ghosts, function(ghost){ return ghost.date_end; });

                    var start_time = data_min["date_start"].getTime();
                    var stop_time = data_max["date_end"].getTime();

                    var start_pxscale = Math.round((start_time-parentg.firstDayScale) / parentg.pxScaleUTC);
                    var stop_pxscale = Math.round((stop_time-parentg.firstDayScale) / parentg.pxScaleUTC);

                    var bar_left = start_pxscale;
                    var bar_width = stop_pxscale-start_pxscale;

                    var ghost_bar = $('<div class="task-gantt-bar-ghosts"></div>');

                    ghost_bar.addClass("task-gantt-bar-ghosts-"+row_id);

                    ghost_bar.css({"left": bar_left + "px"});
                    ghost_bar.css({"width": bar_width + "px"});

                    var rowdata = '#task-gantt-timeline-row-'+row_id;



                    _.each(link_ghosts, function(link_ghost){

                        var ghost_bar_x = $('<div class="task-gantt-bar-ghost"></div>');
                        var ghost_start_time = link_ghost["date_start"].getTime();
                        var ghost_stop_time = link_ghost["date_end"].getTime();

                        var ghost_start_pxscale = Math.round((ghost_start_time-parentg.firstDayScale) / parentg.pxScaleUTC);
                        var ghost_stop_pxscale = Math.round((ghost_stop_time-parentg.firstDayScale) / parentg.pxScaleUTC);

                        var ghost_bar_left = ghost_start_pxscale;
                        var ghost_bar_width = ghost_stop_pxscale-ghost_start_pxscale;

                        ghost_bar_x.css({"left": ghost_bar_left + "px"});
                        ghost_bar_x.css({"width": ghost_bar_width + "px"});

                        $(rowdata).append(ghost_bar_x);
                    });

                    $(rowdata).append(ghost_bar);

                    var test = "ok";


                }

            }

            return true;
        })






    }


    // start: function(){
    //
    //     var parentg =  this.getParent();
    //
    //     var data_widgets =  parentg.gantt_timeline_data_widget;

        // var ghost_data_widgets = _.map(data_widgets, function(widget , key) {
        //
        // var task_start_pxscale = 0;
        // var task_stop_pxscale = 0;
        //
        // if (!widget.record.is_group) {
        //     var task_start_time = widget.record.task_start.getTime();
        //     var task_stop_time = widget.record.task_stop.getTime();
        //
        //     task_start_pxscale = Math.round((task_start_time - parentw.firstDayScale) / parentw.pxScaleUTC);
        //     task_stop_pxscale = Math.round((task_stop_time - parentw.firstDayScale) / parentw.pxScaleUTC);
        // }
        //
        //
        //  return {
        //      record_id: widget.record.id,
        //      group: widget.record.is_group,
        //      task_start_pxscale: task_start_pxscale,
        //      task_stop_pxscale: task_stop_pxscale
        //
        //  }
        //
        // });



        // var self = this;
        // var el = self.$el;
        //
        // var ghosts = parentg.Ghost;
        //
        // var ghost_id = parentg.fields_view.arch.attrs.ghost_id;
        // var ghost_ids_name = parentg.fields_view.arch.attrs.ghost_name;
        // var ghost_ids_date_start = parentg.fields_view.arch.attrs.ghost_date_start;
        // var ghost_ids_date_end = parentg.fields_view.arch.attrs.ghost_date_end;
        // var ghost_ids_durations = parentg.fields_view.arch.attrs.ghost_durations;



        // _.each(ghost_data_widgets, function(data_widget) {
        //
        //     var widget_record = data_widget.record;

            // if (!widget_record.is_group){
            //
            //     var w_el = data_widget.el;
            //
            //     // var data_obj = _.findWhere(ghosts, {record_id: data_id});
            //
            //     var ghost_obj = _.find(ghosts, function(item) {
            //
            //
            //
            //         return item.a == 1 || item.a == 11;
            //     });
            //
            //
            //    return true;
            // })
        // })


        //})

        // _.each(ghosts, function(ghost , key){
        //
        //
        //     var data_id = ghost[ghost_id][0];
        //
        //     var data_obj = _.findWhere(data_widget, {record_id: data_id});
        //
        //     if (data_obj == null){
        //
        //         return false
        //     }
        //
        // })

    //},









});

return {
    get_data_ghosts: get_data_ghosts,
    GhostWidget: GanttTimeLineGhost
}

});