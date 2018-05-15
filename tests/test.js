/// <reference path="../dist/element.d.ts"/>

element({
  element: '.container',
  children: [{
    element: '.row',
    children: [
      '.col-6 Hello World',
      '.col-6.text-right How are you'
    ]
  }]
})