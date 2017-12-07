'use strict';

// document.oncontextmenu = function () {return false}

var _cal = (function (cal) {

    var layout;

    function Calendar () {
        this.methods = {}
        this.version = '0.1.8 beta version';
        this.prevSpecial = new Array();
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

    var layout = function (f,o,self) {
        var b, h, t, c, l, r, tooltip, d = document;
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

        /* div create */
        b = f.el.appendChild(d.createElement('div'));

        /* mouse event option */
        b.ondragstart = function () {return false}
        b.onselectstart = function () {return false}
        b.oncontextmenu = function () {return false}

        /* version alert */
        tooltip = d.createElement('span')
        tooltip.classList.add('tooltip');
        tooltip.innerText = self.version;
        b.appendChild(tooltip)
    
        b.classList.add('calendar-body');

        l = d.createElement('div');
        l.id = 'left-btn';

        r = d.createElement('div');
        r.id = 'right-btn';

        if(o.buttonCustomizer != undefined){
            l.innerHTML = o.buttonCustomizer.left
            r.innerHTML = o.buttonCustomizer.right
        }else{
            l.classList.add('calendar-btn-left');
            r.classList.add('calendar-btn-right');
        }

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

        // context menu
        var context = d.createElement('div');
        context.id = 'context';
        var menuName = [{name:'day-start', text:'시작'}, {name:'day-end', text:'끝'}]
        var menu = [];

        for (var m = 0 ; m < menuName.length ; m++) {
            menu.push(d.createElement('div'));
            menu[m].innerText = menuName[m].text
            menu[m].id = menuName[m].name
            context.appendChild(menu[m])
        }

        b.appendChild(context);

        return {
            body: b,
            head: h,
            heads: heads,
            row: row,
            col: col,
            span: span,
            title : [c, l, r],
            context : {ct: context , btn: menu}
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

        function setLoopLimit (prev, next) {
            var props = self.transformDate;

            var prevProps = function () {
                var these = {py : props.year, pm : props.month - 1};
                if( these.pm < 1 ){
                    these.py = props.year - 1;
                    these.pm =  12
                }
                return 32 - new Date(these.py, these.pm - 1, 32).getDate();
            }

            var nextProps = function () {
                var these = {ny : props.year, nm : props.month + 1};
                if( these.nm > 12 ){
                    these.ny = props.year + 1;
                    these.nm =  1
                }

                return 32 - new Date(these.ny, these.nm - 1, 32).getDate();
            }

            var lastday = 32 - new Date(props.year, props.month -1, 32).getDate();
            var startday = new Date(props.year, props.month -1, 1).getDay();
            
            // var loop = Math.floor((lastday - (7 - startday)) / 7) + 1;
            // var piece = (lastday - startday) % 7
            // if (piece != 0) { loop += 1; }

            return {
                prevlastday : prevProps(),
                nextlastday : nextProps(),
                lastday: lastday,
                startday: startday
            }
        }
        
        function clickActive (binder, o) {

            binder.addEventListener('click', function (e) {
                var attr = this.parentNode;
                var clist = e.target.parentNode.classList;

                /* If the unabledDay option is set  */
                var un = clist.value == undefined ? mergeValue(clist) : clist.value;

                if (un) {
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
                var f = format(date_obj, o.format);

                var day = document.getElementsByClassName('active')
                if(day.length != 0){
                    day[0].classList.remove('active')
                }
                binder.parentNode.classList.add('active')

                if (o.effectTwinkle != undefined && binder.parentNode.classList.value.indexOf('special-day') < 0) {
                    binder.classList.add('twinkle')
                }
        
                /* If the clickActive option is set  */
                if(o.clickActive != undefined){
                    if(typeof o.clickActive === 'function'){
                        o.clickActive(f);
                    }else{
                        onError('The clickActives type must be a "function".')
                    }
                }
                 
            })
        }

        function specialFilter (o) {
            var sObj = {};

            if(o.specialDay != undefined){
                for(var i in o.specialDay){
                    var day = i.split('-')
                    if(sObj[day[0]] == undefined){
                        sObj[day[0]] = [];
                    }
                    sObj[day[0]].push({day: day[1], name: o.specialDay[i]})
                }
            }
            return sObj;
        }

        function tagFilter (_e) {
            var _target = _e.target
            var _tag = _e.target.tagName;
            var newTarget = '';
        
            if(_tag.toLowerCase() === 'div'){
                newTarget = _target
            } else if (_tag.toLowerCase() === 'span') {
                newTarget = _target.parentNode
            }
            return newTarget;
        }

        function muntipleDay (o,l) {
            var start, checker, startNumber, endNumber;
            var history = {
                start : undefined,
                end: undefined
            };

            l.body.addEventListener('contextmenu', function (e) {
                var cm = tagFilter(e);

                var classValue = cm.classList.value == undefined ? mergeValue(cm.classList) : cm.classList.value;
                if(classValue) {
                    if(classValue.indexOf('calendar-day') > -1) {
                        l.context.ct.style.top = (cm.offsetTop + 36) + 'px';
                        l.context.ct.style.left = (cm.offsetLeft + 20) + 'px';
                        l.context.ct.classList.add('show')
                        checker = cm
                    }
                }
            })

            l.context.btn[0].addEventListener('click', function (e) {
                l.context.ct.classList.remove('show')

                if(history.start != undefined){
                    history.start.classList.remove('drag-head');
                    if(history.end != undefined) {
                        history.end.classList.remove('drag-tail');
                    }
                }
                checker.classList.add('drag-head');
                startNumber = checker.getAttribute('date-day');
                history.start = checker;
                start = true;
            })

            l.context.btn[1].addEventListener('click', function (e) {
                if (history.start == undefined) {
                    alert('시작점을 선택해주세요.')
                    return false;
                }else{
                    endNumber = checker.getAttribute('date-day');

                    if (parseInt(endNumber) < parseInt(startNumber)) {
                        alert('끝점이 시작점보다 작을 수 없습니다.')
                        return false;
                    }

                    if(history.end != undefined){
                        history.end.classList.remove('drag-tail');
                    }
                    checker.classList.add('drag-tail');
                    history.end = checker;

                    for(var i = startNumber; i <= endNumber; i++){
                        console.log(i)
                    }

                    l.context.ct.classList.remove('show')
                    start = false;
                }
            })
        }

        function hasClass (param) {
            var classValue = param.classList.value == undefined ? mergeValue(param.classList) : param.classList.value;

            if (classValue) {
                if (classValue.indexOf('special-day') > -1) {
                    self.prevSpecial.push(param)
                }
            }
        }
        

        /* for IE ... */
        function mergeValue (list) {
            var value = '';
            for(var i = 0; i < list.length; i++){
                value += list[i]+' '
            }
            return value;
        }

        var special = specialFilter(this);
        var el = element(this);
        var action = clickActive;
        var data = setLoopLimit
        var drag = muntipleDay;

        return {
            el: el,
            format: format,
            data: data,
            action: action,
            special : special,
            hasClass : hasClass,
            multiSelecter : drag
        }
    }

    // client 렌더링
    Calendar.prototype.render = function (option,func) {
        
        var self = this;
        var o = option;
        var $_nd = this.nowDate;
        var $_td = this.transformDate;
        var yy = func.format($_td , 'yyyy');
        var mm = func.format($_td , 'mm');
        var sed = func.data();  // start end data

        var attr = false;
        var includeMonth = false;
        var specialDay = []
        var startPoint = 0;
        var renderDay = 1;
        var prevRenderDay = sed.startday == 0 ?  sed.prevlastday - 7 : sed.prevlastday - sed.startday;
        var nextRenderDay = 1;
        var title = "<span class='title-y'>"+yy+"</span> <span class='title-m'>"+mm+"</span>";

        o.full = $_td.year+'/'+$_td.month+'/'+$_td.day
        
        layout.body.setAttribute('full-day', o.full)
    
        layout.title[0].innerHTML = title

        for(var _fs in func.special){
            if(_fs === mm){
                includeMonth = true;
                specialDay = func.special[_fs];
                break;
            }
        }

        /* Remove old tag from prevSpecial */
        self.prevSpecial.forEach(function (el) {
            /* IE is not include Element remove */
            if (el.childNodes[1]['remove'] == undefined) {
                console.dir('IE is "what the hell???"');
            } else {
                el.childNodes[1].remove()
            }
        })

        /* reset prevSpecial Object */
        self.prevSpecial = []

        for(var i = 0; i < layout.row.length; i++){
            for(var j = 0; j < layout.span[0].length; j++){

                /* before day unable option */
                if (o.unabledDay == true) {
                    if ($_td.year <= $_nd.year && ($_td.month <= $_nd.month && $_nd.month <= 12)) {  
                        if(renderDay >= $_nd.day && $_td.month == $_nd.month && $_td.year >= $_nd.year){
                            layout.col[i][j].classList.remove('unable')
                        }else{
                            layout.col[i][j].classList.add('unable') 
                        }
                    }else{
                        if($_td.year >= $_nd.year || ($_td.month <= $_nd.month && $_nd.month <= 12)) {
                            layout.col[i][j].classList.remove('unable') 
                        }
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
                            layout.col[i][j].classList.add('unable')
                        }
                    })
                }

                /* reset render */
                layout.span[i][j].innerText = ''
                layout.col[i][j].classList.remove('special-day')

                if(i == 0){
                    if(sed.startday <= j){
                        attr = true;
                        layout.span[i][j].innerText = renderDay;
                    } else {
                        prevRenderDay++
                        layout.col[i][j].classList.add('unable')
                        layout.span[i][j].innerText = prevRenderDay;
                    }
                }else if(i > 0){
                    if(sed.lastday >= renderDay){
                        layout.span[i][j].innerText = renderDay;
                    }else{
                        layout.col[i][j].classList.add('unable')
                        layout.span[i][j].innerText = nextRenderDay;
                        nextRenderDay++;
                        attr = false
                    }
                }

                /* today position option */
                if(renderDay === $_nd.day && $_td.month == $_nd.month && $_td.year == $_nd.year && attr == true){
                    layout.col[i][j].classList.add('active', 'today')
                }else{
                    layout.col[i][j].classList.remove('active', 'today')
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
                            layout.col[i][j].classList.add('special-day')
                            layout.col[i][j].appendChild(span)
                        }
                    }
                }

                /* Put tag information installed in prevSpecial */   
                func.hasClass(layout.col[i][j]) 
                
                if (attr == true) {  
                    layout.col[i][j].classList.remove('unable')
                    layout.col[i][j].setAttribute('date-year', $_td.year)
                    layout.col[i][j].setAttribute('date-month', $_td.month)
                    layout.col[i][j].setAttribute('date-day', renderDay)
                    renderDay++
                }else{
                    //removeAttribute
                    if(layout.col[i][j].attributes.length > 1){
                        layout.col[i][j].removeAttribute('date-year');
                        layout.col[i][j].removeAttribute('date-month');
                        layout.col[i][j].removeAttribute('date-day');
                    }
                }
            }
        }
        /** render end */
    }

    // setup Calandar
    Calendar.prototype.setup = function (option) {
        
        var self = this;
        this.setDate();

        propLuncher(option)
        
        var func = this.fn();
        layout = layout(func,option,this);

        func.multiSelecter(self,layout);

        this.methods = {
            b : this.btn(),
            setdate : this.setDate,
        }

        layout.title[1].addEventListener('click', function () {
            self.methods.b.prev(func);
        })

        layout.title[2].addEventListener('click', function () {
            self.methods.b.next(func);
        })

        this.render(option, func)   
    }

    return new Calendar();
}(this));

if(!window._cal){
    window.$c = window._cal = _cal
}