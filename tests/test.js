/// <reference path="../dist/element.d.ts"/>

element({
  element: '.container',
  children: [{
    element: '.row',
    events: {
      children: {
        click() {
          element({ element: 'div hello' }, '.container')
        }
      }
    },
    children: [
      '.col-6 Hello World',
      '.col-6.text-right How are you?'
    ]
  }]
})

setTimeout(() => {
  element('.row hi', '.container')
  // element({
  //   element: '.row',
  //   children: '.col-12 This is pretty cool...'
  // }, '.container')
}, 3000)