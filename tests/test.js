/// <reference path="../dist/element.d.ts"/>

element({
  element: '.a.b.c[data-id=monkey]#silly',
  children: [{
    element: '.red.white.blue boobs',
    childEvents: {
      click(e) {
        alert(e.currentTarget.innerText)
      }
    },
    children: [{
      element: 'span.hello',
      text: 'Red white and blue',
      events: {
        click() { console.log('poopy') }
      }
    }, {
      element: 'span.hello',
      text: 'Mr. Deeds'
    }]
  }, {
    element: '.cat.dog.bird',
    childEvents: {
      mouseover(e) { e.currentTarget.style.background = 'red' },
      mouseout(e) { e.currentTarget.style.background = 'initial' }
    },
    children: [
      '.one One is the loneliest number',
      { element: '.two', text: 'Two is just as bad as one' },
      '.three Three just sucks'
    ]
  }]
})

element({
  element: 'pig.horse'
}, '.two')