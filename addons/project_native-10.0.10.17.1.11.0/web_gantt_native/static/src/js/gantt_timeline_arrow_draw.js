odoo.define('web_gantt_native.TimeLineArrowDraw', function (require) {
"use strict";

    function drawFS (myCanvas ,from_obj, to_obj) {

        //Draw Arrow Finish to Start
        if (to_obj.y > from_obj.y ) { //Y = FINISH > START

                if ((to_obj.task_start_pxscale - from_obj.task_stop_pxscale) <= 25) { //X = START < FINISH

                    myCanvas.drawPath({
                        strokeStyle: '#000',
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y - 2

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y - 2,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y - 2

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_start_pxscale - 10, y1: to_obj.y - 2,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_start_pxscale - from_obj.task_stop_pxscale) > 25) { //X = TO > FROM

                    myCanvas.drawPath({
                        strokeStyle: '#000',
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 5,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }
                    });
                }


        } else {



                if ((to_obj.task_start_pxscale - from_obj.task_stop_pxscale) <= 25) {

                    myCanvas.drawPath({
                        strokeStyle: '#000',
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 25

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 25,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 25

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_start_pxscale - 10, y1: to_obj.y + 25,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_start_pxscale - from_obj.task_stop_pxscale) > 25) {

                    myCanvas.drawPath({
                        strokeStyle: '#000',
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 5,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }

                    });
                }

            }

            return myCanvas;

    }


    function drawSS (myCanvas ,from_obj, to_obj) {

        //Draw Arrow Finish to Start
        var color_ss = '#135d88';

        if (to_obj.y > from_obj.y ) {

                if ((to_obj.task_start_pxscale - from_obj.task_start_pxscale) <= 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y - 2

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y - 2,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y - 2

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_start_pxscale - 10, y1: to_obj.y - 2,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_start_pxscale - from_obj.task_start_pxscale) > 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y + 5,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }
                    });
                }


        } else {



                if ((to_obj.task_start_pxscale - from_obj.task_start_pxscale) <= 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 25

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y + 25,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 25

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_start_pxscale - 10, y1: to_obj.y + 25,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_start_pxscale - from_obj.task_start_pxscale) > 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y + 5,
                            x2: to_obj.task_start_pxscale - 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }

                    });
                }

            }

            return myCanvas;

    }

    function drawFF (myCanvas ,from_obj, to_obj) {

        //Draw Arrow Finish to Start
        var color_ss = '#13883d';

        if (to_obj.y > from_obj.y ) { // Y = TO > FROM

                if ((to_obj.task_stop_pxscale - from_obj.task_stop_pxscale) >= -25) { // X = TO >= FROM

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y - 2

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y - 2,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y - 2

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_stop_pxscale + 10, y1: to_obj.y - 2,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_stop_pxscale - from_obj.task_stop_pxscale) < -25) { // X = TO - FROM < 5

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 5,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }
                    });
                }


        } else {



                if ((to_obj.task_stop_pxscale - from_obj.task_stop_pxscale) >= -25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 25

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 25,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 25

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_stop_pxscale + 10, y1: to_obj.y + 25,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                }

                if ((to_obj.task_stop_pxscale - from_obj.task_stop_pxscale) < -25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: from_obj.y + 15,
                            x2: from_obj.task_stop_pxscale + 10, y2: to_obj.y + 5

                        },

                        p2: {
                            type: 'line',
                            x1: from_obj.task_stop_pxscale + 10, y1: to_obj.y + 5,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        }

                    });
                }

            }

            return myCanvas;

    }


    function drawSF (myCanvas ,from_obj, to_obj) {

        var color_ss = '#884e00';

        //Draw Arrow Finish to Start
        if (to_obj.y > from_obj.y ) {

                // if ((to_obj.task_stop_pxscale - from_obj.task_start_pxscale) <= 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y - 2

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y - 2,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y - 2

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_stop_pxscale + 10, y1: to_obj.y - 2,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                // }

                // if ((to_obj.task_stop_pxscale - from_obj.task_start_pxscale) > 25) {
                //
                //     myCanvas.drawPath({
                //         strokeStyle: color_ss,
                //         strokeWidth: 0.8,
                //
                //         p1: {
                //             type: 'line',
                //             x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 10,
                //             x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 10
                //
                //         },
                //
                //         p2: {
                //             type: 'line',
                //             x1: from_obj.task_stop_pxscale - 10, y1: to_obj.y + 10,
                //             x2: to_obj.task_start_pxscale + 10, y2: to_obj.y + 10,
                //             endArrow: true,
                //             arrowRadius: 5,
                //             arrowAngle: 45
                //         }
                //     });
                // }


        } else {



                // if ((to_obj.task_stop_pxscale - from_obj.task_start_pxscale) <= 25) {

                    myCanvas.drawPath({
                        strokeStyle: color_ss,
                        strokeWidth: 0.8,

                        p1: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 15,
                            x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 25

                        },
                        p2: {
                            type: 'line',
                            x1: from_obj.task_start_pxscale - 10, y1: to_obj.y + 25,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 25

                        },

                        p3: {
                            type: 'line',
                            x1: to_obj.task_stop_pxscale + 10, y1: to_obj.y + 25,
                            x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 5,
                            endArrow: true,
                            arrowRadius: 5,
                            arrowAngle: 45
                        },

                    });

                // }

                // if ((to_obj.task_stop_pxscale - from_obj.task_start_pxscale) > 25) {
                //
                //     myCanvas.drawPath({
                //         strokeStyle: color_ss,
                //         strokeWidth: 0.8,
                //
                //         p1: {
                //             type: 'line',
                //             x1: from_obj.task_start_pxscale - 10, y1: from_obj.y + 10,
                //             x2: from_obj.task_start_pxscale - 10, y2: to_obj.y + 10
                //
                //         },
                //
                //         p2: {
                //             type: 'line',
                //             x1: from_obj.task_start_pxscale - 10, y1: to_obj.y + 10,
                //             x2: to_obj.task_stop_pxscale + 10, y2: to_obj.y + 10,
                //             endArrow: true,
                //             arrowRadius: 5,
                //             arrowAngle: 45
                //         }
                //
                //     });
                // }

            }

            return myCanvas;

    }



return {
    drawFS: drawFS,
    drawSS: drawSS,
    drawFF: drawFF,
    drawSF: drawSF,

};

});