const HASH_PASSWORD = true
const TENANT_CODE = 'DLCIF'

var _$ = target => document.querySelector(target)

var app = {

  employeeCode: '',
  contractId: '',

  init: () => {
    location.search.substr(1, location.search.length).split('&').forEach(p => {
      let [k, v] = p.split('=')
      this[k] = v
    })
    _$('.employee').value = this.employeeCode
    let dat = JSON.parse(sessionStorage.getItem('data'))
    if (dat) {
      app.render(dat)
      _$('body').classList.add('loggedin')
    }
  },

  togglePasswordVisible: () => {
    let pwd = _$('.password')
    pwd.type = (pwd.type === 'text' ? 'password' : 'text')
  },

  login: () => {
    let pwd = _$('.password').value
    if (pwd === '' || pwd === null) {
      _$('#dlg_login').classList.add('show')
      return
    }
    _$('#loading').classList.add('show')
    let xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        let res = JSON.parse(xhr.response)
        console.log(res)
        if (xhr.status === 200) {
          sessionStorage.setItem('data', JSON.stringify(res.detailInfo))
          app.render(res.detailInfo)
          _$('body').classList.add('loggedin')
        } else if (xhr.status === 401) {
          _$('#dlg_login').classList.add('show')
        } else if (xhr.status === 404) {
          _$('#dlg_contract_id').classList.add('show')
          _$('#dlg_device').classList.add('show')
        } else {
          console.log('fail', xhr, res)
        }
        _$('#loading').classList.remove('show')
      }
    }
    // xhr.requestType = 'json'
    xhr.open('POST', 'login.json', false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({
      tenant_code: TENANT_CODE,
      contract_id: app.contractId,
      employee_code: app.employeeCode,
      password: (HASH_PASSWORD ? sha256.hex(pwd) : pwd)
    }))
  },

  render: dat => {
    _$('.property').innerHTML = dat.propertyName
    _$('.building').innerHTML = dat.buildingName
    _$('.room')    .innerHTML = dat.roomName
    _$('.devices') .innerHTML = dat.devices.reduce((h, d) => h
      + '<div class="card" onclick="this.classList.toggle(\'checked\')">'
      + `<div class="lv-number">${d.lvNumber}</div>`
      + `<div class="item-name">${d.itemName}</div>`
      + `<div class="serial-number">${d.serialNumber}</div>`
      + '</div>'
    , '')
  },

  confirm: () => {
    _$('#loading').classList.add('show')
    var xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          _$('#dlg_success').classList.add('show')
        } else {
          console.log('fail', res)
        }
        _$('#loading').classList.remove('show')
      }
    }
    xhr.open('POST', 'confirm.json', false)
    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.send(JSON.stringify({ contract_id: app.contractId }))
  },

  close: () => {
    sessionStorage.clear()
    window.close()
  }
}

window.onload = app.init()
