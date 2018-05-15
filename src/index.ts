function element(el: Elemental.RootElementalElement | string, location?: string | HTMLElement) {
  let elem = new Elemental.Element(el)
  let parent = (<Elemental.RootElementalElement>el).parent
  if (!Elemental.Elemental.DOM_LOADED) {
    Elemental.Elemental.ELEMENTS.push({ el: elem, loc: parent || location })
  } else {
    elem.render(parent || location)
  }
  return elem
}