namespace Elemental {
  export class Elemental {
    public static DOM_LOADED: boolean = false
    public static ELEMENTS: { el: Element, loc?: string | HTMLElement }[] = []
  }

  document.addEventListener('DOMContentLoaded', () => {
    Elemental.ELEMENTS.forEach(el => el.el.render(el.loc))
    Elemental.DOM_LOADED = true
  })
}