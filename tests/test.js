/// <reference path="../dist/element.d.ts"/>

element({
  tag: '.container',
  children: [{
    tag: '.row',
    events: {

    },
    children: [
      '.col-6 Hello World',
      '.col-6.text-right How are you?'
    ]
  }]
})