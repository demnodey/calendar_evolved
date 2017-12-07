function dragDay (o,l) {
    l.body.addEventListener('mousedown', function (e) {
        playMove(l.body,e)
    })

    l.body.addEventListener('mouseup', function (e) {
        stopMove(l.body,e)
    })
}

function playMove (l,e) {
    l.addEventListener('mousemove', dragMethod)
    if(e.type === 'mousedown') {
        var result = tagFilter(e)
        result.classList.add('drag-head')
    }
}

function stopMove (l,e) {
    l.removeEventListener('mousemove', dragMethod)
    if(e.type === 'mouseup') {
        var result = tagFilter(e)
        result.classList.add('drag-tail')
    }
}

function dragMethod (res) {
    var result = tagFilter(res)

    if (result.className.indexOf('calendar-day') > -1) {
        //var number = res.target.childNodes[0].innerText;
        result.classList.add('drag-body')
    }
}

function tagFilter (_e) {
    var _target = _e.target
    var _tag = _e.target.tagName;
    var newTarget = '';

    if(_tag === 'DIV'){
        newTarget = _target
    } else if (_tag === 'SPAN') {
        newTarget = _target.parentNode
    }
    return newTarget;
}

// material button ripple effect
function materialRipple (e) {
    var target = e.target;

    if (target.tagName.toLowerCase() !== 'button') return false;
    var rect = target.getBoundingClientRect();
    console.log(rect)
    var ripple = target.querySelector('.ripple');
    if(!ripple){
        ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.height = ripple.style.width = Math.max(rect.width , rect.height) + "px";
        target.appendChild(ripple);
    }
    ripple.classList.remove('show');
    var top = e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop;
    var left = e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft;
    
    ripple.style.top = top + 'px';
    ripple.style.left = left + 'px';
    ripple.classList.add('show');

    return false
}