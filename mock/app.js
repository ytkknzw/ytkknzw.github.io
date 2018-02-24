
document.querySelectorAll('.menu-group-title').forEach(el => {
  el.addEventListener('click', () => {
    console.log('el', el, 'el.nextElementSibling', el.nextElementSibling)
    el.nextElementSibling.classList.toggle('open')
  })
})

var itemIndex = -1
var menuItems = document.querySelectorAll('.menu-item')
menuItems.forEach((el, index) => {
  el.addEventListener('click', () => {
    if (itemIndex > -1) menuItems[itemIndex].classList.remove('open')
    el.classList.add('open')
    itemIndex = index
  })
})

document.querySelector('.app-humberger').addEventListener('click', () => {
  document.querySelector('.app-menu').classList.toggle('hide')
})