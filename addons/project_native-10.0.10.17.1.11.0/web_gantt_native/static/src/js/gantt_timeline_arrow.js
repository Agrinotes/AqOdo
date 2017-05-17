odoo.define('web_gantt_native.TimeLineArrow', function (require) {
"use strict";

var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');

var ArrowDraw = require('web_gantt_native.TimeLineArrowDraw');

var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;


var GanttTimeLineArrow = Widget.extend({
    template: "GanttTimeLine.arrow",

    init: function(parent, timeline_width) {
        // this._super(parent);
        this._super.apply(this, arguments);
        this.canvas_width = timeline_width;
    },



    start: function(){


        var parentw =  this.getParent();

        var data_widget =  parentw.gantt_timeline_data_widget;

         var new_data_widget = _.map(data_widget, function(widget , key) {

            var task_start_pxscale = 0;
            var task_stop_pxscale = 0;

            if (!widget.record.is_group) {
                var task_start_time = widget.record.task_start.getTime();
                var task_stop_time = widget.record.task_stop.getTime();

                task_start_pxscale = Math.round((task_start_time - parentw.firstDayScale) / parentw.pxScaleUTC);
                task_stop_pxscale = Math.round((task_stop_time - parentw.firstDayScale) / parentw.pxScaleUTC);
            }


             return {
                 key: key,
                 y: 30*key,
                 record_id: widget.record.id,
                 group: widget.record.is_group,
                 task_start_pxscale: task_start_pxscale,
                 task_stop_pxscale: task_stop_pxscale

             }

         });

        var canvas_height = 30*new_data_widget.length;
        var canvas_width = this.canvas_width;

        var myCanvas = $('<canvas id="canvas" width="'+canvas_width+'" height="'+canvas_height+'" class="task-gantt-timeline-arrow-canvas"></canvas>');


        var self = this;
        var el = self.$el;

        // myCanvas.css({ width: 900 + "px" });
        // myCanvas.css({ height: 300 + "px" });

        var predecessors = parentw.Predecessor;

        _.each(predecessors, function(predecessor , key){


            var to = predecessor.task_id[0];
            var from = predecessor.parent_task_id[0];

            var from_obj = _.findWhere(new_data_widget, {record_id: from});
            var to_obj = _.findWhere(new_data_widget, {record_id: to});

            if (from_obj == null || to_obj == null ){

                return false
            }

            if (predecessor.type ===  "FS") {

                myCanvas.drawEllipse({
                    fillStyle: '#000',
                    x: from_obj.task_stop_pxscale+10, y:  from_obj.y+15,
                    width: 5, height: 5
                });

                myCanvas = ArrowDraw.drawFS(myCanvas,from_obj,to_obj);

                el.append(myCanvas);
            }

            if (predecessor.type ===  "SS") {

                myCanvas.drawEllipse({
                    fillStyle: '#135d88',
                    x: from_obj.task_start_pxscale-10, y:  from_obj.y+15,
                    width: 5, height: 5
                });

                myCanvas = ArrowDraw.drawSS(myCanvas,from_obj,to_obj);

                el.append(myCanvas);
            }

            if (predecessor.type ===  "FF") {

                myCanvas.drawEllipse({
                    fillStyle: '#13883d',
                    x: from_obj.task_stop_pxscale+10, y:  from_obj.y+15,
                    width: 5, height: 5
                });

                myCanvas = ArrowDraw.drawFF(myCanvas,from_obj,to_obj);

                el.append(myCanvas);
            }

            if (predecessor.type ===  "SF") {

                myCanvas.drawEllipse({
                    fillStyle: '#884e00',
                    x: from_obj.task_start_pxscale-10, y:  from_obj.y+15,
                    width: 5, height: 5
                });

                myCanvas = ArrowDraw.drawSF(myCanvas,from_obj,to_obj);

                el.append(myCanvas);
            }




        })

    },









});

return GanttTimeLineArrow;

});