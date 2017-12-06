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