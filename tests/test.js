/// <reference path="../dist/element.d.ts"/>

element({
  tag: '.container',
  children: [{
    tag: '.row',
    children: [
      '.col-6 Hello World',
      '.col-6.text-right How are you?'
    ]
  }]
})