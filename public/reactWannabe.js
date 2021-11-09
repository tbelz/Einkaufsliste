/**
 * Small "Framework" to generate Stuff
 * @author Cascade
 * Will get extended, probably, depends i guess
 */
/**
 *
 * @param itemList List of Items that should be displayed
 * @param excludeList List of Keys wich should be hidden
 * @returns {HTMLTableElement} Returns a table with delete and edit buttons
 */
 const createTable = (itemList, excludeList) => {
    removeElements('#itemList .list-content')
    removeElements('#itemList .list-header')
    const table = document.createElement('table')
    table.appendChild(createRow(itemList[0], excludeList, true))
    itemList.map(item => {
      table.appendChild(createRow(item, excludeList, false))
    })
    return table
  }
  /**
   *
   * @param item The item from the List
   * @param excludeList List of Keys wich should be hidden
   * @param isHeader Boolean if the Row is a Header or not
   * @returns {HTMLTableRowElement} Returns the Row Element
   */
  const createRow = (item, excludeList, isHeader) => {
    const row = document.createElement( 'tr')
    row.classList.add((isHeader) ? 'list-header' : 'list-content')
    for (const key in item)
      if(!excludeList.includes(key)) {
        const cell = document.createElement((isHeader) ? 'th' : 'td')
        cell.textContent = (isHeader) ? key : item[key]
        row.appendChild(cell)
      }
    const deleteButton = createButton(item.id, undefined, 'fa fa-trash', handleTemplateButtonReaction, item)
    const editButton = createButton(item.id, undefined, 'fa fa-wrench', handleTemplateButtonReaction, item)
    !isHeader && row.appendChild(deleteButton)
    !isHeader && row.appendChild(editButton)
    return row
  }
  /**
   *
   * @param buttonId Button ID to track what button is used
   * @param buttonName Name of the Button
   * @param buttonIcon Icon in 'fa fa-icon' syntax
   * @param buttonFunction Function that is linked with the button. Uses the buttonID as selector
   * @param buttonElement Element that is connected to the button
   * * @returns {HTMLDivElement} Returns the Button
   */
  const createButton = (buttonId, buttonName, buttonIcon, buttonFunction, buttonElement) => {
    const button = document.createElement('div')
    const icon = document.createElement('i')
    icon.className = buttonIcon
    button.id = buttonId
    button.name = (buttonName) ? buttonName : buttonId
    button.className = `button-${(buttonName) ? buttonName : buttonId}`
    icon.addEventListener('click', e => buttonFunction((buttonElement) ? buttonElement : buttonId))
    button.appendChild(icon)
  
    return button
  }
  /**
   * Template Button Handler that shows the pressed item/button in console
   * @param parameter The Item or Button id
   */
  const handleTemplateButtonReaction = (parameter) => {
    console.log('clicked', parameter)
  }
  /**
   *
   * @param itemList List of Items that should be turned into a Grid
   * @returns {HTMLDivElement} Returns a grid of elements
   */
  const createGrid = (itemList) => {
    removeElements('#itemGrid .grid-container')
    removeElements('#itemGrid .grid-item')
    const grid = document.createElement('div')
    grid.className = 'grid-container'
    itemList.map(item => {
      const gridItem = document.createElement('div')
      gridItem.className = 'grid-item'
      gridItem.textContent = item.name
      grid.appendChild(gridItem)
  
    })
    return grid
  }
  /**
   *
   * @param item Item that should get a form
   * @param excludeList Keys that are excluded from display
   * @returns {HTMLFormElement} Returns the Form with every key
   */
  const createForm = (item, excludeList) => {
    const form = document.createElement('form')
    form.className = 'form-container'
    for (const key in item)
      if(!excludeList.includes(key)) {
        const label = document.createElement('label')
        label.textContent = key
        const input = document.createElement('input')
        input.id = key
        input.placeholder = item[key]
        input.type = 'text'
        label.appendChild(document.createElement('br'))
        label.appendChild(input)
        label.appendChild(document.createElement('br'))
        form.appendChild(label)
      }
    const divButton = document.createElement('div')
    divButton.id = 'form-button'
    divButton.className = 'form-button'
    divButton.textContent = 'CLICK ME'
    divButton.addEventListener('click', e => handleFormSubmitTemplate(item, excludeList))
    form.appendChild(divButton)
    return form
  }
  /**
   * Template Function to show how u get the form values
   * @param element The element the Form belongs too
   * @param excludeList Keys that should not be changed ( f.e. IDs and stuff)
   */
  const handleFormSubmitTemplate = (element, excludeList) => {
    let item = {}
    for(const key in element)
      if (!excludeList.includes(key))
        item[key] = document.getElementById(key).value
    console.log('form submittet', element, item)
  }