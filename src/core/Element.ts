namespace Elemental {

  interface QueryObject {
    classList: string[]
    text: string
    id: string
    element: string
    properties: string[]
    attributes: { key: string, value: string }[]
  }

  // export type JSEvents = 'change' | 'click' | 'mouseover'

  export type JSEvents = {
    change?(): void
    click?(): void
    mouseover?(): void
    mouseout?(): void
    keydown?(): void
    load?(): void
  }

  export type ElementalEventsTypes = {
    [key in keyof JSEvents]: () => void
    // }

    // export interface ElementalEvents {
    // [key : string]: () => any
    /**
     * An event that gets triggered when the current object has been rendered.
     *
     * @memberof EventObject
     */
    // rendered: () => void
    /**
     * An object of events that will be added to the current element's children.
     *
     * @type {{
     *       [key: string]: any
     *       rendered?(): void
     *     }}
     * @memberof EventObject
     */
    // children ?: {
    // [key in keyof JSEvents]: () => void
    //   // [key: string]: any
    //   /**
    //    * An event that gets added to all children of the current element that gets triggered when the element gets rendered.
    //    *
    //    */
    //   rendered ? (): void
    // }
  }

  export interface ElementalElement {
    /**
     * This is the element that will be created.
     *
     * * It is defined using a shorthand selector such as ".red#white[data-color=blue]".
     * * Using child selectors are invalid such as ".red > .white" and ".red .white".
     * * Anything after the first space will be converted to text content.
     *
     * @type {string}
     * @memberof ElementalElement
     */
    tag: string
    /**
     * This is the text content of the element and overrides the selector text content.
     *
     * @type {string}
     * @memberof ElementalElement
     */
    txt?: string
    /**
     * This is the children of the current element.
     *
     * * An array of either elements or string selectors will create multiple elements within the current element.
     * * A single element will will create one element within the current element.
     * * A string will create a single element within the current element.
     *
     * @type {((ElementalElement | string)[] | ElementalElement | string)}
     * @memberof ElementalElement
     */
    children?: (ElementalElement | string)[] | ElementalElement | string
    /**
     * These are the events for the current element.
     *
     * * A list of functions will automatically execute `addEventListener(propName)` on the current element.
     * * The `children` property in this object is reserved for adding all the contained events on the current element's children.
     *
     * @type {ElementalEvents}
     * @memberof ElementalElement
     */
    events?: ElementalEventsTypes
  }

  export interface RootElementalElement extends ElementalElement {
    parent?: string | HTMLElement | Element
  }

  export class Element {

    private _rootElement?: HTMLElement
    public get rootElement() { return this._rootElement }

    public constructor(private el: RootElementalElement | string) { }

    public render(location?: string | HTMLElement | Element) {
      let loc = document.body
      if (location && typeof location == 'string') loc = document.querySelector(location) as HTMLElement
      else if (location instanceof Element) loc = location.rootElement as HTMLElement
      else if (location && location instanceof HTMLElement) loc = location as HTMLElement
      if (!loc) return
      this._rootElement = this.makeElement(this.el, loc)
    }

    private makeElement<T extends HTMLElement>(elem: ElementalElement | string, parent: HTMLElement): T {
      let info = this.parseQuerySelector(typeof elem == 'string' ? elem : elem.tag || '')
      let el = document.createElement(info.element)
      // Add the classes, attributes and the id to the element
      info.id.length > 0 && (el.id = info.id)
      info.classList.length > 0 && el.classList.add(...info.classList)
      info.attributes.forEach(a => a.key ? el.setAttribute(a.key, a.value) : el.setAttribute(a.value, a.value))
      info.properties.forEach(p => el.setAttribute(p, p))
      parent.appendChild(el)

      // If the element is a string create the element
      if (typeof elem == 'string') {
        info.text.length > 0 && el.appendChild(document.createTextNode(info.text))
      }
      // If the element isn't a string create from the object
      else {
        let text = elem.txt && elem.txt.length > 0 ? elem.txt : info.text.length > 0 ? info.text : ''
        text.length > 0 && el.appendChild(document.createTextNode(text))
        // Adds the events to the current element
        this.addEvents(elem, el)
        // Create the child elements
        if (elem && Array.isArray(elem.children)) {
          // The children elements are an array of items
          // Loop through them and add them
          elem.children.forEach(child => this.makeElement(child, el))
        } else if (elem && ['object', 'string'].includes(typeof elem.children)) {
          // The children elements is a single element either of an object or string
          this.makeElement(elem.children as ElementalElement, el)
        }
        // Adds the same event to all the child elements
        this.addChildEvents(elem, el)
      }
      return el as T
    }

    private addEvents(elem: ElementalElement, el: HTMLElement) {
      if (elem.events) {
        if (typeof elem.events.created == 'function') elem.events.created()
        for (let evtName in elem.events) {
          let event = elem.events[evtName]
          // If the event is not a function go to next item
          if (typeof event != 'function') continue
          el.addEventListener(evtName, event.bind(el))
        }
        el.dispatchEvent(new Event('rendered'))
      }
    }

    private addChildEvents(elm: ElementalElement, el: HTMLElement) {
      // Add the events to the child elements
      if (elm.events && elm.events.children) {
        let children = Array.from(el.children)
        // Add the rest of the events on the children
        for (let evtName in elm.events.children) {
          let event = elm.events.children[evtName]
          children.forEach(child => child.addEventListener(evtName, event.bind(child)))
        }
        children.forEach(child => child.dispatchEvent(new Event('rendered')))
      }
    }


    private parseQuerySelector(selector: string) {
      let obj: QueryObject = {
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