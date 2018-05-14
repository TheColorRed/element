function element(el: Elemental.Element, location?: string | HTMLElement) {
  let elem = new Elemental.Element(el)
  document.addEventListener('DOMContentLoaded', () => {
    elem.render(location)
  })
  return elem
}

namespace Elemental {
  export class Element {
    public element: string = ''
    public text: string = ''
    public children: (Element | string)[] = []
    public events!: { [key: string]: any }
    public childEvents!: { [key: string]: any }

    public constructor(el: Elemental.Element) {
      this.element = el.element
      this.children = el.children || []
    }

    public render(location?: string | HTMLElement) {
      let loc = document.body
      if (location && typeof location == 'string') loc = document.querySelector(location) as HTMLElement
      else if (location && location instanceof HTMLElement) loc = location as HTMLElement
      if (!loc) return
      // loc.innerHTML = ''
      loc.appendChild(this.makeElement(this))
    }

    private makeElement<T extends HTMLElement>(elm: Element | string): T {
      let info = this.parseQuerySelector(typeof elm == 'string' ? elm : elm.element)
      let el = document.createElement(info.element)
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      info.properties.forEach(p => el.setAttribute(p, p))
      if (typeof elm == 'string') {
        info.text.length > 0 && el.appendChild(document.createTextNode(info.text))
      } else {
        let text = info.text.length > 0 ? info.text : elm.text && elm.text.length > 0 ? elm.text : ''
        text.length > 0 && el.appendChild(document.createTextNode(text))
        if (elm.events) {
          for (let evtName in elm.events) {
            let event = elm.events[evtName]
            el.addEventListener(evtName, event.bind(el))
          }
        }
        elm && Array.isArray(elm.children) && elm.children.forEach(child => {
          el.appendChild(this.makeElement(child))
        })
        if (elm.childEvents) {
          for (let evtName in elm.childEvents) {
            let event = elm.childEvents[evtName]
            Array.from(el.children).forEach(child => child.addEventListener(evtName, event.bind(child)))
          }
        }
      }
      return el as T
    }

    private parseQuerySelector(selector: string) {
      let obj: { classList: string[], text: string, id: string, element: string, properties: string[], attributes: { key: string, value: string }[] } = {
        classList: [],
        id: '',
        element: 'div',
        attributes: [],
        properties: [],
        text: ''
      }
      obj.id = (selector.match(/#[a-z-_0-9]+/) || [''])[0].replace('#', '')
      obj.classList = (selector.match(/\.[a-z-_0-9]+/g) || []).map(v => v.replace('.', ''))
      obj.element = selector.toLowerCase().split(/[^a-z0-9]/, 2)[0] || 'div'
      obj.attributes = (selector.match(/\[.+?\]/g) || []).reduce<{ key: string, value: string }[]>((r, v) => {
        let [key, value] = v.split('=')
        key = !key ? '' : key
        value = !value ? '' : value
        return r.concat({
          key: key.replace(/^\[|\]$/g, ''),
          value:
            // Remove the brackets
            value.replace(/\]$/g, '')
              // Remove the first quote or apostrophe at the beginning of the string only
              .replace(/^('|")/, '')
              // Remove the last quote or apostrophe at the end of the string only
              .replace(/('|")$/, '')
        })
      }, [])
      obj.properties = (selector.match(/:\D+/g) || []).reduce<string[]>((r, v) => r.concat(v.replace(/^:/, '')), [])
      obj.text = selector.includes(' ') ? selector.substr(selector.indexOf(' ') + 1) : ''
      return obj
    }
  }
}