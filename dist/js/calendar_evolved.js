'use strict';

// document.oncontextmenu = function () {return false}

var _cal = (function (cal) {

    var layout_complate;

    function Calendar () {
        this.methods = {}
    }

    // 내부 데이터 활용
    var propLuncher = function (para){
        var _para = para;
        if(typeof _para == 'object' && _para != undefined) {
            for(var i  in _para){
                if(_cal[i] == undefined){
                    _cal[i] = _para[i];
                } else {
                    onError('"'+_cal[i]+'" is aleady exist in props value')
                    break;
                }
            }
        }
    }

    var layout = function (f,o) {
        var b, h, t, c, l, r, d = document;
        var row = [], col = [] , span = [], heads = [];
        var weekendSimple = ['Sun', 'Mon', 'The', 'Wen', 'Thu', 'Fri', 'Set'];

        /* week simple name option */
        if(o.weekendSimple != undefined) {
            if(o.weekendSimple.length < 7){
                onError('Lack a number in weekendSimple to index length.')
            }else{
                weekendSimple = o.weekendSimple;
            }
        }
        
        // div create
        b = f.el.appendChild(d.createElement('div'));

        b.ondragstart = function () {return false}
        b.onselectstart = function () {return false}
        // body.oncontextmenu = function () {return false}
    
        b.classList.add('calendar-body');

        l = d.createElement('div');
        l.classList.add('calendar-btn-left');

        r = d.createElement('div');
        r.classList.add('calendar-btn-right');

        c = d.createElement('div');
        c.classList.add('calendar');

        t = d.createElement('div');
        t.classList.add('calendar-title');

        t.appendChild(l)
        t.appendChild(c)
        t.appendChild(r)

        b.appendChild(t)

        h = d.createElement('div');
        h.classList.add('calendar-head');
        b.appendChild(h)

        for (var w = 0; w < 7; w++){
            heads.push(d.createElement('div'));
            heads[w].classList.add('calendar-week');
            heads[w].innerText = weekendSimple[w];
            h.appendChild(heads[w]) 
        }

        // dom 생성
        for (var i = 0; i < 6; i++) {
            col[i] = [];
            span[i] = [];

            row.push(d.createElement('div'))
            b.appendChild(row[i]);
            row[i].classList.add('calendar-row')
            for (var j = 0; j < 7; j++) {
                col[i].push(d.createElement('div'));
                row[i].appendChild(col[i][j])
                col[i][j].classList.add('calendar-day')
        
                span[i].push(d.createElement('span'));
                col[i][j].appendChild(span[i][j])
                
                f.action(span[i][j],o);   
            }
        }

        return {
            body: b,
            head: h,
            heads: heads,
            row: row,
            col: col,
            span: span,
            title : [c, l, r]
        }
    }

    // Error
    var onError = function (err){
        console.error(new Error(err))
    }

    Calendar.prototype.setDate = function (set) {
        var _set = set == undefined ? Date.now() : set;
        var d = new Date();
        var _d = new Date(_set);

        this.nowDate = {
            millie: Date.now(),
            year: d.getFullYear(),
            month: d.getMonth() + 1,
            day: d.getDate(),
            week: d.getDay(),
        }

        this.transformDate = {
            year: _d.getFullYear(),
            month: _d.getMonth() + 1,
            day: _d.getDate(),
            week: _d.getDay()
        }
    }

    Calendar.prototype.btn = function (s) {
        var self = this;
        var _selec = s;

        var next = function (func) {
            var y = self.transformDate.year
            var m = self.transformDate.month + 1
            if(m > 12) {
                m = 1;
                y++
            }

            self.setDate(y +'/'+ m +'/'+ 1);
            self.fn(self).data()
            self.render(self, func)
        }

        var prev = function (func) {
            var y = self.transformDate.year
            var m = self.transformDate.month - 1
            if(m < 1) {
                m = 12;
                y--
            }
            self.setDate(y +'/'+ m +'/'+ 1);
            self.fn(self).data()
            self.render(self, func)
        }

        return {
            next: next,
            prev: prev
        }
    }

    // 내부 함수 기능
    Calendar.prototype.fn = function () {
        var self = this;

        function element(o) {
            var el, reg = /^[#|.]\w+$/;
            if(typeof o != Object){
                if (!reg.test(o.el)) {
                    onError('You write wrong Selector \n Include id or class css selector in "el" option.')
                    if(!o.el){
                        onError('You didn`t write Selector in option Object.')
                    }
                } else {
                    el = document.querySelector(o.el);
                    return el;
                } 
            } 
        }

        function format (date , form) {
            var perfect_date; 
            perfect_date = date.year+"/"+date.month+"/"+date.day;
            if(form != undefined){
                perfect_date = form.replace(/(yyyy|yy|mm|m|dd|d)/gi , function (n) {
                    switch(n){
                        case 'yyyy' : return date.year;
                        case 'yy' : return (date.year % 1000);
                        case 'mm' : return date.month > 9 ? date.month : '0' + date.month;
                        case 'm' : return date.month;
                        case 'dd' : return date.day > 9 ? date.day : '0' + date.day;
                        case 'd' : return date.day;
                        default: return n;
                    }
                });
            }
            return perfect_date;
        }

        function setLoopLimit () {
            var props = self.transformDate;
            var lastday = 32 - new Date(props.year, props.month -1, 32).getDate();
            var startday = new Date(props.year, props.month -1, 1).getDay();
            // var loop = Math.floor((lastday - (7 - startday)) / 7) + 1;
            // var piece = (lastday - startday) % 7
            // if (piece != 0) { loop += 1; }
            return {
                lastday: lastday,
                startday: startday
            }
        }
        
        function dayAction (binder, op) {
            binder.addEventListener('click', function (e) {
                var attr = this.parentNode;

                /* If the unabledDay option is set  */
                if(op.unabledDay || op.unabledWeek) {
                    var un = e.target.parentNode.classList.value;
                    if(un.indexOf('unable') > -1){
                        return false
                    }
                }

                /* Get the currently clicked date properties and create a new object */
                var date_obj = {
                    year: self.transformDate.year,
                    month: self.transformDate.month,
                    day: parseInt(attr.getAttribute('date-day'))
                }

                /* Format the selected date according to the determined options. */
                var f = format(date_obj, op.format);

                var day = document.getElementsByClassName('active')
                if(day.length != 0){
                    day[0].classList.remove('active')
                }
                binder.parentNode.classList.add('active')
        
                /* If the dayAction option is set  */
                if(op.dayAction != undefined){
                    if(typeof op.dayAction === 'function'){
                        op.dayAction(f);
                    }else{
                        onError('The dayActions type must be a "function".')
                    }
                }
                 
            })
        }

        function specialFilter (op) {
            var sObj = {};

            if(op.specialDay != undefined){
                for(var i in op.specialDay){
                    var day = i.split('-')
                    if(sObj[day[0]] == undefined){
                        sObj[day[0]] = [];
                    }
                    sObj[day[0]].push({day: day[1], name: op.specialDay[i]})
                }
            }
            return sObj;
        }

        function hasClass (param) {
            var classValue = param.classList.value;

            if (classValue) {
                if (classValue.indexOf('special-day') > -1) {
                    self.prevSpecial.push(param)
                }
            }
        }

        var special = specialFilter(this);
        var el = element(this);
        var action = dayAction;
        var data = setLoopLimit

        return {
            el: el,
            format: format,
            data: data,
            action: action,
            special : special,
            hasClass : hasClass
        }
    }

    // client 렌더링
    Calendar.prototype.render = function (option,func) {
        
        var self = this;
        var o = option;
        var $_nd = this.nowDate;
        var $_td = this.transformDate;
        var mm = func.format($_td , 'mm');

        var attr = false;
        var includeMonth = false;
        var specialDay = []
        var startPoint = 0;
        var renderDay = 1;

        o.full = $_td.year+'/'+$_td.month+'/'+$_td.day
        
        layout_complate.body.setAttribute('full-day', o.full)

        layout_complate.title[0].innerHTML = "<span class='title-y'>"+func.format($_td , 'yyyy')+"</span> <span class='title-m'>"+mm+"</span>";        

        for(var _fs in func.special){
            if(_fs === mm){
                includeMonth = true;
                specialDay = func.special[_fs];
                break;
            }
        }

        /* Remove old tag from prevSpecial */
        self.prevSpecial.forEach(function (el) {
            el.childNodes[1].remove();
        })

        /* reset prevSpecial Object */
        self.prevSpecial = []

        for(var i = 0; i < layout_complate.row.length; i++){
            for(var j = 0; j < layout_complate.span[0].length; j++){

                /* today position option */
                if(renderDay === $_nd.day && $_td.month == $_nd.month && $_td.year == $_nd.year){
                    layout_complate.col[i][j].classList.add('active', 'today')
                }else{
                    layout_complate.col[i][j].classList.remove('active', 'today')
                }

                /* before day unable option */
                if (o.unabledDay == true) {
                    if (renderDay < $_nd.day && $_td.month <= $_nd.month && $_td.year <= $_nd.year) {  
                        layout_complate.col[i][j].classList.add('unable')
                    }else{
                        layout_complate.col[i][j].classList.remove('unable')
                    }
                }

                /* chois day of week unable option */
                if (o.unabledWeek != undefined) { 
                    o.unabledWeek.forEach(function (el) {
                        if(el > 6){ 
                            onError('The unableWeek index is the limit of the 6.'); 
                            return false;
                        }
                        if(el == j){
                            layout_complate.col[i][j].classList.add('unable')
                        }
                    })
                }

                /* reset render */
                layout_complate.span[i][j].innerText = ''
                layout_complate.col[i][j].classList.remove('special-day')

                if(func.data().startday == 0) {
                    startPoint = 1;
                }
                
                if(i == startPoint){
                    if(func.data().startday <= j){
                        attr = true;
                        layout_complate.span[i][j].innerText = renderDay;
                    }
                }else if(i > startPoint){
                    if(func.data().lastday >= renderDay){
                        layout_complate.span[i][j].innerText = renderDay;
                    }else{  
                        attr = false
                    }
                }

                /* special-day render */
                if (specialDay.length != 0 && attr == true) {
                    for(var s = 0; s < specialDay.length; s++){
                        var span = document.createElement('div');
                        span.classList.add('special-name');
                        if (parseInt(specialDay[s].day) == renderDay) {
                            var span = document.createElement('div');
                            span.classList.add('special-name');
                            span.innerText = specialDay[s].name
                            layout_complate.col[i][j].classList.add('special-day')
                            layout_complate.col[i][j].appendChild(span)
                        }
                    }
                }

                /* Put tag information installed in prevSpecial */   
                func.hasClass(layout_complate.col[i][j]) 
                
                if (attr == true) {  
                    layout_complate.col[i][j].setAttribute('date-year', $_td.year)
                    layout_complate.col[i][j].setAttribute('date-month', $_td.month)
                    layout_complate.col[i][j].setAttribute('date-day', renderDay)
                    renderDay++
                }

                // layout_complate.span[i][j].remove()
            }
        }
        /** render end */
    }

    // setup Calandar
    Calendar.prototype.setup = function (option) {
        
        var self = this;
        this.setDate();

        option.prevSpecial = new Array();
        propLuncher(option)
        
        var func = this.fn();
        layout_complate = layout(func,option);

        this.methods = {
            b : this.btn(),
            setdate : this.setDate
        }

        layout_complate.title[1].addEventListener('click', function () {
            self.methods.b.prev(func);
        })

        layout_complate.title[2].addEventListener('click', function () {
            self.methods.b.next(func);
        })

        this.render(option, func)   
    }

    return new Calendar();
}(this));

if(!window._cal){
    window.$c = window._cal = _cal
}