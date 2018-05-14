function element(el: Elemental.ElementalElement | string, location?: string | HTMLElement) {
  let elem = new Elemental.Element(el)
  if (!Elemental.Elemental.DOM_LOADED) {
    Elemental.Elemental.ELEMENTS.push({ el: elem, loc: location })
  } else {
    elem.render(location)
  }
  return elem
}