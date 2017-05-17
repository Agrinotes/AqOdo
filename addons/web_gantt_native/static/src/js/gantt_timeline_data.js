odoo.define('web_gantt_native.TimeLineData', function (require) {
"use strict";

var config = require('web.config');
var core = require('web.core');
var Dialog = require('web.Dialog');
var form_common = require('web.form_common');
var Widget = require('web.Widget');

var _lt = core._lt;
var _t = core._t;
var QWeb = core.qweb;

var GanttToolTip = require('web_gantt_native.ToolTip');
var GanttToolHint = require('web_gantt_native.ToolHint');


var GanttTimeLineData = Widget.extend({
    template: "GanttTimeLine.data",

    events: {

        'mouseover  .task-gantt-bar-plan'    :'HandleTipOver',
        'mouseout   .task-gantt-bar-plan'    :'HandleTipOut',

        'mousedown .task-gantt-bar-plan': 'BarClick',
    },



   // 'mouseover  .task-gantt-item, .task-gantt-timeline-row'     :'handleHoverOver',
   // 'mouseout   .task-gantt-item, .task-gantt-timeline-row'     :'handleHoverOut',

    init: function(parent, timeScale, timeType, record) {
        this._super(parent);
        this.parent = parent;
        this.record = record;
        this.record_id = this.record['id'];

        this.BarRecord = undefined;
        this.BarClickDiffX = undefined;
        this.BarClickX = undefined;
        this.BarClickDown = false;

        this.deadline_status = false;

    },

    get_position: function(gantt_date_start, gantt_date_stop, deadline_date){

        var task_start_time = gantt_date_start.getTime();
        var task_stop_time = gantt_date_stop.getTime();

        var task_start_pxscale = Math.round((task_start_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);
        var task_stop_pxscale = Math.round((task_stop_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);
        // var bar_width = Math.round(task_time_len / this.parent.pxScaleUTC);
        var bar_left = task_start_pxscale;
        var bar_width = task_stop_pxscale-task_start_pxscale;


        if (deadline_date) {

            var date_deadline_time = deadline_date.getTime();
            var date_deadline_pxscale = Math.round((date_deadline_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);

            var bar_deadline_left = false;
            var bar_deadline_width = false;


            if (date_deadline_pxscale >= task_stop_pxscale){

                bar_deadline_left = bar_width;
                bar_deadline_width = date_deadline_pxscale-task_stop_pxscale;

                this.deadline_status = 'after_stop';

            }

            if (date_deadline_pxscale < task_stop_pxscale){

                bar_deadline_left = bar_width - (task_stop_pxscale - date_deadline_pxscale);
                bar_deadline_width = task_stop_pxscale-date_deadline_pxscale;
                this.deadline_status = 'before_stop'

            }

            if (date_deadline_pxscale <= task_start_pxscale){

                bar_deadline_left = bar_width - (task_stop_pxscale - date_deadline_pxscale);
                bar_deadline_width = task_start_pxscale-date_deadline_pxscale;
                this.deadline_status = 'before_start'

            }

        }

        return {
            bar_left: bar_left,
            bar_width: bar_width,
            bar_deadline_left : bar_deadline_left,
            bar_deadline_width : bar_deadline_width
        };

    },

    get_uposition: function(gantt_date_start, gantt_date_stop, any_date){

        var task_start_time = gantt_date_start.getTime();
        var task_stop_time = gantt_date_stop.getTime();

        var task_start_pxscale = Math.round((task_start_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);
        var task_stop_pxscale = Math.round((task_stop_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);

        var bar_left = task_start_pxscale;
        var bar_width = task_stop_pxscale-task_start_pxscale;

        var any_status = false;

        if (any_date) {

            var date_deadline_time = any_date.getTime();
            var date_deadline_pxscale = Math.round((date_deadline_time-this.parent.firstDayScale) / this.parent.pxScaleUTC);

            var bar_any_left = false;
            var bar_any_width = false;


            if (date_deadline_pxscale >= task_stop_pxscale){

                bar_any_left = bar_width;
                bar_any_width = date_deadline_pxscale-task_stop_pxscale;

                any_status = 'after_stop';

            }

            if (date_deadline_pxscale < task_stop_pxscale){

                bar_any_left = bar_width - (task_stop_pxscale - date_deadline_pxscale);
                bar_any_width = task_stop_pxscale-date_deadline_pxscale;
                any_status = 'before_stop'

            }

            if (date_deadline_pxscale <= task_start_pxscale){

                bar_any_left = bar_width - (task_stop_pxscale - date_deadline_pxscale);
                bar_any_width = task_start_pxscale-date_deadline_pxscale;
                any_status = 'before_start'

            }

        }

        return {
            bar_left: bar_left,
            bar_width: bar_width,
            bar_any_left : bar_any_left,
            bar_any_width : bar_any_width,
            any_status: any_status
        };

    },


    start: function(){

        var self = this;

        var id = this.record_id;

        if (!this.record.is_group) {

            //Gantt Bar

            var gantt_bar = $('<div class="task-gantt-bar-plan"></div>');

            var get_possition = this.get_position(this.record.task_start, this.record.task_stop, this.record.date_deadline);





            gantt_bar.css({"left": get_possition.bar_left + "px"});
            gantt_bar.css({"width": get_possition.bar_width + "px"});

            var bar_start = $('<div class="task-gantt-bar-plan-start"></div>');


            var bar_end = $('<div class="task-gantt-bar-plan-end"></div>');

            if (get_possition.bar_width === 0)
            {
                bar_start.addClass("task-gantt-bar-plan-start-zero");
                bar_end.addClass("task-gantt-bar-plan-end-zero");

            }


            gantt_bar.append(bar_start);
            gantt_bar.append(bar_end);

            // var bar_point_start = $('<div class="task-gantt-point task-gantt-point-start"></div>');
            // var bar_point_end = $('<div class="task-gantt-point task-gantt-point-end"></div>');

            // gantt_bar.append(bar_point_start);
            // gantt_bar.append(bar_point_end);

            //Done
            // Detect state for done if determinate in xml state_status. check state for done append to gannt.
            // Second check if field with done date is empty not render too.
            var done_append = true;

            if (this.parent.fields_view.arch.attrs.state_status) {
                done_append = false;
                if(this.record.state === this.parent.fields_view.arch.attrs.state_status){
                    done_append = true;
                }
            }

            if (done_append){

                var get_upossition_done = this.get_uposition(this.record.task_start, this.record.task_stop, this.record.date_done);
                var done_status = get_upossition_done.any_status;
                if (done_status){

                    var done_left = get_upossition_done.bar_any_left;
                    var done_width = get_upossition_done.bar_any_width;

                                    // var bar_deadline_overdue = $('<div class="task-gantt-bar-deadline-overdue"></div>');
                    var done_slider = $('<div class="task-gantt-done-slider fa fa-thumbs-o-up"></div>');



                    var done_slider_left = done_left+done_width;

                    if (done_status == 'before_stop' || done_status == 'before_start'){

                        done_slider_left = done_left;
                    }

                    done_slider.css({"left": done_slider_left + "px"});
                    gantt_bar.append(done_slider);

                    // bar_left: bar_left,
                    // bar_width: bar_width,
                    // bar_any_left : bar_any_left,
                    // bar_any_width : bar_any_width,
                    // any_status: any_status

                }
            }


            //Deadline

            //Position cont

            var bar_deadline_left = get_possition.bar_deadline_left;
            var bar_deadline_width = get_possition.bar_deadline_width;


            //HTML render
            if (bar_deadline_left && bar_deadline_width){

                //Bar Deadline
                var bar_deadline = $('<div class="task-gantt-bar-deadline"></div>');

                if (this.deadline_status == 'after_stop' || this.deadline_status == 'before_start') {

                    bar_deadline.css({"left": bar_deadline_left + "px"});
                    bar_deadline.css({"width": bar_deadline_width + "px"});
                    gantt_bar.append(bar_deadline);

                }

                if (this.deadline_status == 'before_start') {

                    bar_deadline.css({"left": bar_deadline_left + "px"});
                    bar_deadline.css({"width": bar_deadline_width + "px"});
                    bar_deadline.css({"background": "rgba(255, 190, 190, 0.2)" });

                    gantt_bar.append(bar_deadline);

                }

                // var bar_deadline_overdue = $('<div class="task-gantt-bar-deadline-overdue"></div>');
                var bar_deadline_slider = $('<div class="task-gantt-deadline-slider"></div>');

                var bar_deadline_slider_left = bar_deadline_left+bar_deadline_width;

                if (this.deadline_status == 'before_stop' || this.deadline_status == 'before_start'){

                    bar_deadline_slider_left = bar_deadline_left
                }

                bar_deadline_slider.css({"left": bar_deadline_slider_left + "px"});

                // gantt_bar.append(bar_deadline_overdue);
                gantt_bar.append(bar_deadline_slider);

            }

            //progress
            if (this.record.progress){

                // var bar_progress = $('<div class="task-gantt-progress">'+ this.record.progress +'%</div>');
                //
                // bar_progress.css({"left": get_possition.bar_width/3 + "px"});
                // gantt_bar.append(bar_progress);


                var progress_value = (get_possition.bar_width/100)*this.record.progress;

                if (progress_value < 0){

                    progress_value = -progress_value+get_possition.bar_width
                }

                var bar_progress = $('<div class="task-gantt-progress"></div>');

                bar_progress.css({"width": progress_value + "px"});

                gantt_bar.append(bar_progress);



                if (!this.record.on_gantt) {

                    var bar_progress2 = $('<div class="task-gantt-progress2">' + this.record.progress + '%</div>');
                    bar_progress2.css({"left": get_possition.bar_width / 3 + "px"});
                    gantt_bar.append(bar_progress2);

                }

            }


            //Milestone
            if (this.record.is_milestone) {

                bar_end.addClass("fa fa-flag fa-1x");
                gantt_bar.css({"background": "rgba(242, 197, 116, 0.1)"});

            }
            //Task Name on Gantt
            if (this.record.on_gantt) {

                var bar_name = $('<div class="task-gantt-name">'+ this.record.value_name +'</div>');

                bar_name.css({"width": get_possition.bar_width-5 + "px"});
                gantt_bar.append(bar_name);

            }






            if (id != undefined) {

                this.$el.prop('id', "task-gantt-timeline-row-" + id + "");
                this.$el.prop('data-id', id);
                this.$el.prop('allowRowHover', true);
                this.$el.prop('record', this.record);
                this.$el.prop('record_id', id);
                gantt_bar.prop('record_id', id);
                gantt_bar.prop('record', this.record);

                gantt_bar.addClass("task-gantt-bar-plan-" + id + "")

            }

            this.$el.append(gantt_bar);

        }


    },




    HandleTipOver: function(event) {

        // var bar_record_id = event.target.record_id ;
        // var bar_record_id = this.record_id;
        // var gantt_bar = $(".task-gantt-bar-plan-" + bar_record_id + "");

        if (this.parent.tip_move_widget) {
            this.parent.tip_move_widget.destroy();
            this.parent.tip_move_widget = undefined;

        }

         if (!this.parent.hint_move_widget) {

             var gantt_bar = this.$el.children('.task-gantt-bar-plan');
            // //Create Bar Hint
            var gantt_line_tip = new GanttToolTip(this.parent, gantt_bar);
            gantt_line_tip.appendTo(this.parent.$('.task-gantt-line-tips'));
            this.parent.tip_move_widget = gantt_line_tip;


         }


    },


    HandleTipOut: function() {

        if (this.parent.tip_move_widget) {
            this.parent.tip_move_widget.destroy();
            this.parent.tip_move_widget = undefined;



        }

    },



    HideDeadline: function(){

        var gantt_bar = this.$el.children('.task-gantt-bar-plan');
        //Deadline
        var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');

        if (gantt_bardeadline) {
            gantt_bardeadline.hide();
        }

        //Done Slider
        var gantt_done_slider = gantt_bar.children('.task-gantt-done-slider');
        if (gantt_done_slider) {
            gantt_done_slider.hide();
        }


        //Deadline Slider
        var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');

        if (bar_deadline_slider) {
            bar_deadline_slider.hide();
        }

    },

    ShowDeadline: function(){

        var gantt_bar = this.$el.children('.task-gantt-bar-plan');
        //Deadline
        var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');
        if (gantt_bardeadline) {
            gantt_bardeadline.show();
        }

        //Done Slider
        var gantt_done_slider = gantt_bar.children('.task-gantt-done-slider');
        if (gantt_done_slider) {
            gantt_done_slider.show();
        }

        //Deadline Slider
        var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');

        if (bar_deadline_slider) {
            bar_deadline_slider.show();
        }

    },


//BarChangeStart

//BarMouseDown
    BarClick: function(event){

        //Click On Bar
         if ( $(event.target).hasClass('task-gantt-bar-plan') ) {

                this.parent.$el.delegate('.task-gantt-timeline-data', 'mouseup', this.proxy('BarMouseUp'));
                this.parent.$el.delegate('.task-gantt-timeline-data', 'mousemove', this.proxy('BarMouseMove'));

                    this.BarRecord = event.currentTarget.record;
                    this.BarClickDiffX = event.target.offsetLeft - event.clientX;
                    this.BarClickX = event.clientX;

                    this.BarClickDown = true;

           }

        //Click On Start Bar
        if ( $(event.target).hasClass('task-gantt-bar-plan-start') ) {

                this.parent.$el.delegate('.task-gantt-timeline-data', 'mouseup', this.proxy('BarChangeStartUp'));
                this.parent.$el.delegate('.task-gantt-timeline-data', 'mousemove', this.proxy('BarChangeStartMove'));

                    this.BarRecord = event.currentTarget.record;
                    this.BarClickDiffX =  event.currentTarget.offsetLeft - event.clientX;
                    this.BarClickX = event.clientX;

                    this.BarWidth = event.currentTarget.offsetWidth;

           }
        //Click On End Bar
        if ( $(event.target).hasClass('task-gantt-bar-plan-end') ) {

                this.parent.$el.delegate('.task-gantt-timeline-data', 'mouseup', this.proxy('BarChangeEndUp'));
                this.parent.$el.delegate('.task-gantt-timeline-data', 'mousemove', this.proxy('BarChangeEndMove'));

                    this.BarRecord = event.currentTarget.record;
                    this.BarClickDiffX =  event.currentTarget.offsetWidth - event.clientX;
                    this.BarClickX = event.clientX;

           }


        //Create Bar Hint
        var gantt_line_hint = new GanttToolHint(this.parent);
        gantt_line_hint.appendTo(this.parent.$('.task-gantt-line-hints'));
        // this.widgets.push(gantt_line_hint);

        if (this.parent.hint_move_widget) {
            this.parent.hint_move_widget.destroy();
            this.parent.hint_move_widget = undefined;
        }

        if (this.parent.tip_move_widget) {
            this.parent.tip_move_widget.destroy();
            this.parent.tip_move_widget = undefined;
        }

        this.parent.hint_move_widget = gantt_line_hint;

    },

//END BAR MOUSE UP
    BarChangeEndUp: function(event) {

        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mousemove');
        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mouseup');

        this.BarSave(this.BarRecord.id);

        //Hint Widget
        this.parent.hint_move_widget.destroy();
        this.parent.hint_move_widget = undefined;

    },

//END BAR CHANGE MOVE
    BarChangeEndMove: function(event){

        var offsetWidth = event.target.offsetParent.offsetWidth;

        // var offsetLeft = event.target.offsetParent.offsetLeft;
        // var offsetLeft = $(event.target).parent().offset().left;
        // var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");
        // var offsetWidth = parseInt(gantt_bar.css('width'), 10);
        // var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");
        // var offsetLeft = Math.round(gantt_bar.offset().left);

        var DiffForMove = this.BarClickX - event.clientX; //raznica mez nazatijem i tekuchej poziciji mishi
        var BarNewPos = offsetWidth  - DiffForMove; //Velichina smechenija bloka.
        var NewBarClickDiffX = offsetWidth - event.clientX; //tekucheje rastojanija mezdu nachalom blok i tekuchem pol mishki
        var Kdiff =  this.BarClickDiffX - NewBarClickDiffX; //Koeficent corekciji dla poderzanija rastojanije meszu nachalom
        //bloka i tekuchem polozenijem mishi.

        //Dvigajem tolko tekuchij blok
        if (this.BarRecord.id == event.target.offsetParent.record_id || this.BarRecord.id == event.target.record_id) {

            var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");

            //Hint Bar
            // var gantt_bar = this.$el.children('.task-gantt-bar-plan');
            var new_width = BarNewPos+Kdiff+DiffForMove;
            var old_width = parseInt(gantt_bar.css('width'), 10);


            var bar_info = this.GetGanttBarPlanPxTime();
            this.parent.hint_move_widget.show_hint(gantt_bar, bar_info);

            gantt_bar.css({"width": new_width + "px"});

            this.HideDeadline();

            // var gantt_bardeadline_left = new_width;
            // var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');
            // gantt_bardeadline.css({'left': gantt_bardeadline_left + "px"});
            //
            // var deadline_width = parseInt(gantt_bardeadline.css('width'), 10);
            // var new_deadline_width = deadline_width + (old_width - new_width);
            // gantt_bardeadline.css({'width' : new_deadline_width + "px"});
            //
            //
            // var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');
            // var bar_deadline_slider_left = new_width+new_deadline_width;
            // bar_deadline_slider.css({"left": bar_deadline_slider_left + "px"});

        }
        else {

            this.BarChangeEndUp();
        }


    },

//START BAR MOUSE UP
    BarChangeStartUp: function(event){

        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mousemove');
        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mouseup');
        this.BarSave(this.BarRecord.id);

        //Hint Widget
        this.parent.hint_move_widget.destroy();
        this.parent.hint_move_widget = undefined;


    },

//START BAR CHANGE MOVE
    BarChangeStartMove: function(event){

        // var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");
        // var offsetLeft = event.target.offsetLeft;
        // var offsetWidth = event.target.offsetWidth;
        // var offsetLeft = event.target.offsetLeft;
        // var offsetLeft = event.target.offsetParent.offsetLeft;
        // var offsetWidth = event.target.offsetParent.offsetWidth;
        // var gantt_bar = this.$el.children('.task-gantt-bar-plan');
        // var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");
        // var offsetLeft = Math.round(gantt_bar.offset().left);

        var offsetLeft = event.target.offsetParent.offsetLeft;

        var NewBarDiff = offsetLeft - event.clientX;
        var Kdiff =  this.BarClickDiffX - NewBarDiff; //Koeficent corekciji dla poderzanija rastojanije meszu nachalom
        var DiffForMove = this.BarClickX - event.clientX; //raznica mez nazatijem i tekuchej poziciji mishi

        //Dvigajem tolko tekuchij blok
        if (this.BarRecord.id == event.target.offsetParent.record_id || this.BarRecord.id == event.target.record_id) {

            var gantt_bar = $(".task-gantt-bar-plan-" + this.BarRecord.id + "");
            // var offsetLeft = Math.round(gantt_bar.offset().left);

            var new_left = offsetLeft + Kdiff;
            var new_width = this.BarWidth + DiffForMove;

            var bar_info = this.GetGanttBarPlanPxTime();
            this.parent.hint_move_widget.show_hint(gantt_bar, bar_info);

            gantt_bar.css({"left": new_left + "px"});
            gantt_bar.css({"width": new_width + "px"});


            this.HideDeadline();

            // // //Deadline
            // var gantt_bardeadline_width = new_width;
            // var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');
            // gantt_bardeadline.css({'left': gantt_bardeadline_width + "px"});
            //
            // var deadline_width = parseInt(gantt_bardeadline.css('width'), 10);
            // var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');
            // var bar_deadline_slider_left = deadline_width + gantt_bardeadline_width;
            // bar_deadline_slider.css({"left": bar_deadline_slider_left + "px"});

        }
        else {
            this.BarChangeStartUp();
        }

    },


    BarMouseUp: function(event){


        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mousemove');
        this.parent.$el.undelegate('.task-gantt-timeline-data', 'mouseup');


        if (this.BarMovieValue){
            this.BarSave(this.BarRecord.id)
        }

        this.BarMovieValue = undefined;
        this.BarClickDiffX = undefined;
        this.BarClickX = undefined;
        this.BarClickDown = false;


        //Hint Widget
        this.parent.hint_move_widget.destroy();
        this.parent.hint_move_widget = undefined;

    },

// MOUSE MOVE GANTT BAR
    BarMouseMove: function(event){

        var OldOffsetLeft = event.target.offsetLeft;
        // var offsetWidth = event.target.offsetWidth;

        var DiffForMove = this.BarClickX - event.clientX; //raznica mez nazatijem i tekuchej poziciji mishi
        var NewOffsetLeft = OldOffsetLeft  - DiffForMove; //Velichina smechenija bloka.
        var NewBarClickDiffX = NewOffsetLeft - event.clientX; //tekucheje rastojanija mezdu nachalom blok i tekuchem pol mishki
        var Kdiff =  this.BarClickDiffX - NewBarClickDiffX; //Koeficent corekciji dla poderzanija rastojanije meszu nachalom
        //bloka i tekuchem polozenijem mishi.
        var NewOffsetLeftKdiff = NewOffsetLeft+Kdiff;


        if (this.BarRecord.id == event.target.record_id &&  this.BarClickDown == true ) {

            this.BarMovieValue = NewOffsetLeftKdiff;
            var left = NewOffsetLeftKdiff;
            // var old_left = OldOffsetLeft;
            // var wg = _.findWhere(this.gantt_timeline_data_widget, {record_id:this.BarRecord.id });
            // wg.change_position(this.BarMovieValue);
            //this.change_position_gantt(NewOffsetLeftKdiff, OldOffsetLeft);
            //var gantt_bar = this.$el.children('.task-gantt-bar-plan');

            //Bar
            var gantt_bar = this.$el.children('.task-gantt-bar-plan');

            var old_left = parseInt(gantt_bar.css('left'), 10);

            gantt_bar.css({"left": left + "px"});

            //Hint
            var bar_info = this.GetGanttBarPlanPxTime();
            this.parent.hint_move_widget.show_hint(gantt_bar, bar_info);


            //Deadline Deadline_Slider Hide

            this.HideDeadline();


            // //Deadline
            // var gantt_bardeadline = gantt_bar.children('.task-gantt-bar-deadline');
            // var deadline_width = parseInt(gantt_bardeadline.css('width'), 10);
            //
            //
            // //Deadline Slider
            // var bar_deadline_slider = gantt_bar.children('.task-gantt-deadline-slider');
            // var gantt_bardeadline_left = parseInt(gantt_bardeadline.css('left'), 10);
            //
            //
            // var bar_left = parseInt(gantt_bar.css('left'), 10);
            // var bar_width = parseInt(gantt_bar.css('width'), 10);
            //
            // if (this.deadline_status = 'before_stop'){
            //
            //     // bar_deadline_left = bar_width - (task_stop_pxscale - date_deadline_pxscale);
            //     // bar_deadline_width = task_stop_pxscale-date_deadline_pxscale;
            //
            //
            // }
            //
            // var new_deadline_width = deadline_width + (old_left - left);
            // gantt_bardeadline.css({'width' : new_deadline_width + "px"});
            //
            //
            // var bar_deadline_slider_left = deadline_width + gantt_bardeadline_left;
            // bar_deadline_slider.css({"left": bar_deadline_slider_left + "px"});


        }
        else {
            this.BarMouseUp();
        }

    },


//Save BAR

    BarSave: function(r_id){
        var data = {};
        // var gantt_bar = this.$el.children('.task-gantt-bar-plan');
        // var gantt_bar = $(".task-gantt-bar-plan-" + r_id + "");
        //var start_end = this.BarStartEnd(gantt_bar);

        var bar_info = this.GetGanttBarPlanPxTime();

        var model_fields_dict = this.parent.model_fields_dict;

        data[model_fields_dict["date_start"]] = bar_info.task_start;
        data[model_fields_dict["date_stop"]] = bar_info.task_end;


        this.parent.TimeToLeft = $('.task-gantt-timeline').scrollLeft();
        this.parent.ScrollToTop = $('.o_content').scrollTop();

        $.when( this.parent.dataset.write(r_id, data, {}), this.parent  ).then(function(ev, parent) {
             parent.do_search(parent.last_domains, parent.last_contexts, parent.last_group_bys, parent.options);
        });


    },



     GetGanttBarPlanPxTime: function (){

        var gantt_bar = this.$el.children('.task-gantt-bar-plan');

        var tleft = parseInt(gantt_bar.css('left'), 10);
        var twidth = parseInt(gantt_bar.css('width'), 10);

        var tright = tleft + twidth;
        var task_start = (tleft*this.parent.pxScaleUTC)+this.parent.firstDayScale;
        var task_end = (tright*this.parent.pxScaleUTC)+this.parent.firstDayScale;


        var new_task_start = new Date(0); // The 0 there is the key, which sets the date to the epoch setUTCSeconds(task_start);
        new_task_start.setTime(task_start);

        var new_task_end = new Date(0); // The 0 there is the key, which sets the date to the epoch setUTCSeconds(task_start);
        new_task_end.setTime(task_end);

        var deadline_time = false;

        var gantt_bar_deadline = this.$el.children('.task-gantt-bar-deadline');

        if (gantt_bar_deadline) {

            var deadline_left = parseInt(gantt_bar_deadline.css('left'), 10);
            var deadline_width = parseInt(gantt_bar_deadline.css('width'), 10);
            var deadline_px = deadline_left + deadline_width;
            deadline_time = (deadline_px*this.parent.pxScaleUTC)+this.parent.firstDayScale;

            var new_deadline_time = new Date(0); // The 0 there is the key, which sets the date to the epoch setUTCSeconds(task_start);
            new_deadline_time.setTime(deadline_time);


        }


        return {
            task_start: new_task_start,
            task_end:new_task_end,
            deadline_time : new_deadline_time

        };

     }



});

return GanttTimeLineData;

});