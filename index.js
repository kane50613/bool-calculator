const $ = mdui.$
let vars = []

$('#add-variable').get(0).addEventListener('click', () => {
    mdui.prompt(
        '新增變數',
        (value) => {
            value = value?.replace(/ /g, '') ?? ''
            if(value.length === 0)
                return mdui.alert('輸入變數的名字!')

            if(!/^[a-zA-Z0-9-_]+$/.test(value))
                return mdui.alert('只能使用英數的名字!')

            if(vars.includes(value))
                return mdui.alert('該變數已經存在了!')

            vars.push(value)
            updateTable()
        }
    )
})

$('#remove-variable').get(0).addEventListener('click', () => {
    let vars_text = vars.map(x => `<li id="remove-var--${x}" class="mdui-list-item mdui-ripple"><div class="mdui-list-item-content">${x}</div><i class="mdui-icon material-icons">&#xe5cd;</i></li>`)
    mdui.dialog({
        title: '移除變數',
        content: `<ul class="mdui-list">${vars_text.length === 0 ? '還沒有新增任何變數' : vars_text}</ul>`,
        buttons: [
            { text: '關閉' }
        ],
        onOpened: () => {
            for(let _var of vars)
                $(`#remove-var--${_var}`).get(0).addEventListener('click', () => {
                    vars.splice(vars.indexOf(_var), 1)
                    $(`#remove-var--${_var}`).get(0).remove()
                    updateTable()
                })
        }
    })
})

$('#calc').get(0).addEventListener('keyup', () => {
    console.log(update())
})

function updateTable() {
    let table = $('#result').get(0)
    table.innerHTML = ''

    if(vars.length === 0)
        return

    let tr = document.createElement('tr')
    for(let _var of vars) {
        let th = document.createElement('th')
        th.innerText = _var

        tr.appendChild(th)
    }

    tr.innerHTML += `<th>結果</th>`
    table.appendChild(tr)
}

function update() {
    let result = {}, results = []
    let for_list = vars.reduce((v, x) =>
        v += `for(let i_${x} = 0; i_${x} <= 1; i_${x}++) {result['${x}'] = i_${x};if(Object.keys(result).length === vars.length && !results.find(x => JSON.stringify(x) === JSON.stringify(result))) results.push(Object.assign({}, result));`, '')
    for(let _ of vars)
    for_list += '}'
    eval(for_list)
    results = results.sort((a, b) => Object.values(a).reduce((v, x) => v + x, 0) - Object.values(b).reduce((v, x) => v + x, 0))
    return results
}