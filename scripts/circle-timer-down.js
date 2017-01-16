"use strict";

;(function (root, factory) {
    if (typeof define === 'function' && define.amd) define([], factory)
    else if (typeof exports === 'object') module.exports = factory()
    else root.CircleTimerDown = factory()
}(this, function () {
    Object.prototype.extend = function(object) {
        for (var i in object) {
            if (object.hasOwnProperty(i)) {
                if (typeof this[i] == "object" && this.hasOwnProperty(i) && this[i] != null) {
                    this[i].extend(object[i]);
                } else {
                    this[i] = object[i];
                }
            }
        }
        return this;
    };

    Object.defineProperty(Date.prototype, 'dateParsing', {
        value: function() {
            function pad(n) {
                return (n < 10 ? '0' : '') + n;
            }

            return this.getFullYear() + "/" +
                pad(this.getMonth() + 1) + "/" +
                pad(this.getDate()) + " " +
                pad(this.getHours()) + ":" +
                pad(this.getMinutes()) + ":" +
                pad(this.getSeconds());
        }
    });


    function CircleTimerDown(options) {
        var defaultOptions = {
            startDate: '2017/01/01 00:00:00',
            nowDate: new Date().dateParsing(),
            endDate: '2018/01/01 00:00:00',
            labelDay: 'Day',
            labelHours: 'Hours',
            labelMinutes: 'Minutes',
            labelSeconds: 'Seconds'
        }
        this.options = defaultOptions.extend(options);
        this.init();
    }

    CircleTimerDown.prototype.parseTime = function () {
        var startDate = new Date(this.options.startDate);
        var endDate = new Date(this.options.endDate);
        var nowDate = new Date(this.options.nowDate)
        var newTotalSecsLeft, daysLeft, daysAll;

        newTotalSecsLeft = endDate.getTime() - nowDate.getTime(); // Millisecs
        daysLeft = nowDate.getTime() - startDate.getTime();
        daysAll = endDate.getTime() - startDate.getTime();
        
        newTotalSecsLeft = Math.ceil(newTotalSecsLeft / 1000); // Secs
        daysLeft = Math.ceil((daysLeft / 1000 / 60 / 60 / 24)); // Days
        daysAll = Math.ceil((daysAll / 1000 / 60 / 60 / 24)); // Days
        this.totalSecsLeft = newTotalSecsLeft;
        this.offset = {
            seconds     : this.totalSecsLeft % 60,
            minutes     : Math.floor(this.totalSecsLeft / 60) % 60,
            hours       : Math.floor(this.totalSecsLeft / 60 / 60) % 24,
            days        : Math.floor(this.totalSecsLeft / 60 / 60 / 24),
            daysLeft    : daysLeft,
            daysAll     : daysAll
        };
        if (nowDate >= endDate) this.stop();
    }

    CircleTimerDown.prototype.render = function () {
        var mainBlock = document.querySelector('.circle-timer');
        var ul = document.createElement('ul');
        for (var i = 0; i < 4; i++) {
            var li = document.createElement('li');
            var p = document.createElement('p');
            var span = document.createElement('span');
            p.appendChild(span);
            if (i === 0) {
                p.innerHTML += this.options.labelDay;
                li.id = 'days';
            } else if (i === 1) {
                li.id = 'hours';
                p.innerHTML += this.options.labelHours;
            } else if (i === 2) {
                li.id = 'minutes';
                p.innerHTML += this.options.labelMinutes;
            } else if (i === 3) {
                li.id = 'seconds';
                p.innerHTML += this.options.labelSeconds;
            }

            li.appendChild(p);
            li.innerHTML += '<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">' +
                                '<g>' +
                                    '<circle class="circle_main" r="50" cy="60" cx="60" fill="none"/>' +
                                    '<circle id="circle" class="circle_animation" r="50" cy="60" cx="60" fill="none"/>' +
                                '</g>' +
                            '</svg>';
            li.className = 'chart';
            ul.appendChild(li);
            ul.className = 'timer';
        }
        mainBlock.appendChild(ul);
    }

    CircleTimerDown.prototype.checkTime = function () {
        const HOURS = 24;
        const MINUTES = 60;
        const SECONDS = 60;

        var initialOffset = 314;
        var days = this.offset.daysAll; //not must be null
        var iDays = days - this.offset.days;
        var iHours = HOURS - this.offset.hours;
        var iMinutes = MINUTES - this.offset.minutes;
        var iSeconds = SECONDS - this.offset.seconds;

        this.runTimer = function () {
            document.querySelector('#days span').innerHTML = this.offset.days + '';
            document.querySelector('#hours span').innerHTML = this.offset.hours + '';
            document.querySelector('#minutes span').innerHTML = this.offset.minutes + '';
            document.querySelector('#seconds span').innerHTML = this.offset.seconds + '';

            document.querySelector('#days .circle_animation').style.strokeDashoffset = initialOffset - (iDays * (initialOffset / days));
            document.querySelector('#hours .circle_animation').style.strokeDashoffset = initialOffset - (iHours * (initialOffset / HOURS));
            document.querySelector('#minutes .circle_animation').style.strokeDashoffset = initialOffset - (iMinutes * (initialOffset / MINUTES));
            document.querySelector('#seconds .circle_animation').style.strokeDashoffset = initialOffset - (iSeconds * (initialOffset / SECONDS));

            if (this.offset.days > 0 && this.offset.hours === 0
                && this.offset.minutes === 0 && this.offset.seconds === 0) {
                this.offset.minutes = MINUTES-1;
                this.offset.hours = HOURS-1;
                this.offset.seconds = SECONDS;
                this.offset.days--;
                iSeconds = 0;
                iHours = 0;
                iMinutes = 0;
                iDays++;
                iHours++;
                iMinutes++;
            } else if (this.offset.hours > 0 && this.offset.minutes === 0 && this.offset.seconds === 0) {
                this.offset.minutes = MINUTES-1;
                this.offset.seconds = SECONDS;
                this.offset.hours--;
                iSeconds = 0;
                iMinutes = 0;
                iMinutes++;
                iHours++;
            } else if (this.offset.minutes > 0 && this.offset.seconds === 0) {
                this.offset.minutes--;
                this.offset.seconds = SECONDS;
                iSeconds = 0;
                iMinutes++;
            } else if (this.offset.days === 0 &&
                this.offset.hours === 0 &&
                this.offset.minutes === 0 &&
                this.offset.seconds === 0) {
                clearInterval(this.interval);
                return;
            }

            this.offset.seconds--;
            iSeconds++;
        };

        this.runTimer();
    }

    CircleTimerDown.prototype.start = function () {
        this.checkTime();

        this.interval = setInterval(function () {
            this.runTimer();
        }.bind(this), 1000);
    }

    CircleTimerDown.prototype.stop = function () {
        for (var key in this.offset) {
            if (key === 'daysLeft') break;
            this.offset[key] = 0;
        }
        this.checkTime();
    }

    CircleTimerDown.prototype.init = function () {
        this.render();
        this.parseTime();
        this.start();
    }

    return CircleTimerDown;
}));
