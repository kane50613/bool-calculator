const $ = mdui.$
const charFrom = 65
const input = $('#calc').get(0)
let vars = []

$('#add-variable').get(0).addEventListener('click', () => {
    if(vars.length >= 26)
        return mdui.alert('超過A到Z的範圍了 :(')
    vars.push(String.fromCharCode(charFrom + vars.length))
    let button = document.createElement('button')
    button.classList.add('variable')
    button.innerText = vars[vars.length - 1]
    button.addEventListener('click', () => {
        input.value += button.innerText
        update()
    })
    $('#vars').get(0).appendChild(button)
    update()
    // mdui.prompt(
    //     '新增變數',
    //     (value) => {
    //         value = value?.replace(/ /g, '') ?? ''
    //         if(value.length === 0)
    //             return mdui.alert('輸入變數的名字!')
    //
    //         if(!/^[a-zA-Z0-9-_]+$/.test(value))
    //             return mdui.alert('只能使用英數的名字!')
    //
    //         if(vars.includes(value))
    //             return mdui.alert('該變數已經存在了!')
    //
    //         vars.push(value)
    //         updateTable()
    //     },
    //     () => {},
    //     { confirmOnEnter: true }
    // )
})

$('#remove-variable').get(0).addEventListener('click', () => {
    if(vars.length === 0)
        return
    vars.splice(vars.length - 1, 1)
    update()
    // let vars_text = vars.map(x => `<li id="remove-var--${x}" class="mdui-list-item mdui-ripple"><div class="mdui-list-item-content">${x}</div><i class="mdui-icon material-icons">&#xe5cd;</i></li>`)
    // mdui.dialog({
    //     title: '移除變數',
    //     content: `<ul class="mdui-list">${vars_text.length === 0 ? '還沒有新增任何變數' : vars_text}</ul>`,
    //     buttons: [
    //         { text: '關閉' }
    //     ],
    //     onOpened: () => {
    //         for(let _var of vars)
    //             $(`#remove-var--${_var}`).get(0).addEventListener('click', () => {
    //                 vars.splice(vars.indexOf(_var), 1)
    //                 $(`#remove-var--${_var}`).get(0).remove()
    //                 updateTable()
    //             })
    //     }
    // })
})

input.addEventListener('keyup', update)

function updateTable() {
    if(input.value.trim().length === 0)
        return

    let table = $('#result').get(0)
    table.innerHTML = ''

    if(getUsedVars().length === 0) {
        $('#result-title').get(0).innerText = `結果`
        try {
            table.innerHTML = `<span class="block code--block">${calculate()}</span>`
        } catch (e) {
            table.innerHTML = `<span class="block error--block">${e.message}</span>`
        }
        return
    }

    let tr = document.createElement('tr')
    for(let _var of getUsedVars()) {
        let th = document.createElement('th')
        th.innerText = _var

        tr.appendChild(th)
    }

    tr.innerHTML += `<th>結果</th>`
    table.appendChild(tr)

    let results = updateList(),
        passed = 0

    for(let result of results) {
        let tr = document.createElement('tr'), calcResult
        try {
            calcResult = calculate(result)
        } catch (e) {
            $('#result-title').get(0).innerText = '結果'
            table.innerHTML = `<span class="block error--block">${e.message}</span>`
            break
        }

        for(let _var of Object.keys(result)) {
            let td = document.createElement('td')
            td.innerText = result[_var]
            tr.appendChild(td)
        }

        let td = document.createElement('td')
        td.innerHTML = calcResult ?
            `<i class="mdui-icon material-icons text--green">&#xe5ca;</i>` :
            `<i class="mdui-icon material-icons text--red">&#xe14c;</i>`

        if(calcResult)
            passed++

        tr.appendChild(td)
        table.appendChild(tr)
    }

    $('#result-title').get(0).innerText = `結果 (${passed} / ${results.length - passed} / ${results.length})`
}

function updateList() {
    let result = {}, results = []
    let for_list = getUsedVars().reduce((v, x) =>
        v += `for(let i_${x} = 0; i_${x} <= 1; i_${x}++) {result['${x}'] = i_${x};if(Object.keys(result).length === getUsedVars().length && !results.find(x => JSON.stringify(x) === JSON.stringify(result))) results.push(Object.assign({}, result));`, '')
    for(let _ of getUsedVars())
    for_list += '}'
    eval(for_list)
    results = results.sort((a, b) => Object.values(a).reduce((v, x) => v + x, 0) - Object.values(b).reduce((v, x) => v + x, 0))
    return results
}

function updateUsed() {
    for(let _var of $('#vars').get(0).childNodes) {
        if(getUsedVars().includes(_var.innerText) && !_var.classList.contains('used'))
            return _var.classList.add('used')
        if(!getUsedVars().includes(_var.innerText) && _var.classList.contains('used'))
            _var.classList.remove('used')
    }
}

function update() {
    input.value = input.value.toUpperCase()
    updateTable()
    updateUsed()
}

function calculate(_vars = {}) {
    for(let _var in _vars)
        window[_var] = _vars[_var]
    return eval(input.value)
}

function getUsedVars() {
    return vars.filter(x => input.value.includes(x))
}