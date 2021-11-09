
function renderShoppingListOverviewRow(table, einkaufsliste){
  const shoppingListName = document.createElement("td");
  shoppingListName.textContent = einkaufsliste.name;
  const uncheckedItems = document.createElement("td");
  const uncheckedCount = einkaufsliste.einträge.filter(item => { return !item.abgehakt}).length
  uncheckedItems.textContent = uncheckedCount;

  const row = document.createElement("tr");
  row.classList.add("shoppingListInfo");
  row.appendChild(shoppingListName);
  row.appendChild(uncheckedItems);
  row.addEventListener("click",showList)
  row.name = einkaufsliste.name;

  table.appendChild(row);
}

function removeElements(elementSelector) {
  const results = document.querySelectorAll(elementSelector);
  for(const result of results) {
    result.remove();
  }
}

async function renderUebersichtEinkaufslisten() {
  
  const einkaufslisten = await getJSon("/einkaufslisten")
  const table = document.querySelector("#uebersicht-einkaufslisten table");
  removeElements("#uebersicht-einkaufslisten .shoppingListInfo")
  
  einkaufslisten.forEach(einkaufsliste => {
    renderShoppingListOverviewRow(table, einkaufsliste)
  });
}
async function showList(event){
  event.stopPropagation();
  const row = event.target.parentElement;
  const list = row.name;
  gotoPage("/einkaufsliste/l0/" + list);
}

async function showListAdd(event) {
  const button = event.target;
  button.setAttribute('hidden', '');
  document.forms["addList-form"].removeAttribute('hidden');
  
}

async function addList(event){
  const form = document.forms["addList-form"];
  const listName = form.elements["listName"].value;
  if(listName == ""){
    alert("Bitte geben Sie einen gültigen Namen für die Liste ein");  
  }
  else{
    
    const result = postJson({ name: listName }, "/einkaufslisten")
    if(!result){
      alert("Bitte geben Sie einen gültigen Namen ein")
      return;
    }
    form.setAttribute('hidden', '');
    form.reset();
    document.querySelector("#uebersicht-einkaufslisten button").removeAttribute('hidden');
    renderUebersichtEinkaufslisten();
  }  
}

async function login(event){

  const form = document.forms["login-form"];
  const username = form.elements["user"];
  const password = form.elements["password"];

  const user = {
    username: username,
    password: password
  }

  if(getLogin(user)){
    gotoPage("/")
    
  }
  else
  {
    alert("Ungültiges Passwort oder Benutzer")
    password.reset();
  }




}

async function getLogin(body){
  return postJson(body, "login")
}

async function register(event){
  event.preventDefault();

  const form = document.forms["register-form"];
  const username = form.elements["user"].value;
  const password1 = form.elements["password1"].value;
  const password2 = form.elements["password2"].value;
  if(password1 !== password2){
    alert("Passwörter stimmen nicht überein")
    return;
  }

  if(password1.length < 5){
    alert("Passwort zu kurz")
    return;
  }

  const user = {
    username: username,
    password: password1
  }

  const response = await postJson(user, "/register")
  if(response == false){
    alert("Fehler");
    password1.reset();
    password2.reset();
    return;
  }
  else{
    getLogin(user);
    gotoPage("/");
    form.reset();
  }
}


/*async function guard(params){
  const result = await fetch("/loginStatus");
  if(result.ok){
    const isLoggedInJson = await result.json();
    console.log("Guard", isLoggedInJson.isLoggedin);
    if(isLoggedInJson.isLoggedin != false){
      console.log("true-g")
      return false;
    }
    return true;
  }
  
  return true;
}*/

async function reverseGuard(params){
  const result = await fetch("/loginStatus");
  //console.log(params);
  if(result.ok){
    const isLoggedInJson = await result.json();
    //console.log("reverseGuard ", isLoggedInJson.isLoggedin);
    if(isLoggedInJson.isLoggedin === "true"){
      //console.log("true-r")
      return true;
    }
    gotoPage("/login");
   return false;
  }
}

async function guard(params){
  const result = await fetch("/loginStatus");
  if(result.ok){
    const isLoggedInJson = await result.json();
    //console.log("guard ", isLoggedInJson.isLoggedin);
    if(isLoggedInJson.isLoggedin === "true"){
      //console.log("true-g")
      gotoPage("/einkaufsliste/l");
      return false;
    
   
    }
  return true;
  }
}

let activeList;

async function getShoppingList(listName){
  if(listName){
      const shoppingList = await getJSon("/einkaufslisten/" + listName);
    if(shoppingList === []){ return null; }
    else{
      return shoppingList[0];
    }
  }
  return null;
}

async function renderShoppingList(params){
  const shoppingListName = params.detail.params.liste;
  //console.log("renderShoppingList:", shoppingListName);
  const shoppingList = await getShoppingList(shoppingListName);
  if(shoppingList){
    const table = document.querySelector(".tabelle");
    removeElements("#shoppingList .itemInfo")
    activeList = shoppingListName;
    shoppingList.einträge.forEach(item => {
    renderShoppingListRow(table, item)
    });
  }
}

function renderShoppingListRow(table, item){
  const itemName = document.createElement("td");
  const itemAmount = document.createElement("td");
  const itemUnit = document.createElement("td");
  const itemChecked = document.createElement("td");
  const itemDelete = document.createElement("td");
  let checkbox = document.createElement('input');
  checkbox.type = "checkbox";
  checkbox.className = "change";
  checkbox.checked = item.abgehakt;
  let deleteButton = document.createElement('button');
  deleteButton.className = "delete";
  deleteButton.innerHTML = `<i class="fa fa-trash">`;

  itemChecked.appendChild(checkbox);
  itemName.textContent = item.art;
  itemAmount.textContent = item.anzahl;
  itemUnit.textContent = item.einheit;
  itemDelete.appendChild(deleteButton);

  const row = document.createElement("tr");
  row.classList.add("itemInfo");
  row.appendChild(itemName)
  row.appendChild(itemAmount)
  row.appendChild(itemUnit)
  row.appendChild(itemChecked)
  row.appendChild(itemDelete)
  row.item = item;

  table.appendChild(row);
}

function openAddItem(){
  if(activeList == undefined) {
    gotoPage("/einkaufsliste/üebersicht")
  }
  else {
  gotoPage("/einkaufsliste/hinzufügen/" + activeList)
  }
}

 async function loadItemAdd(params){
  const listName = params.detail.params.liste;
  if(listName == undefined){
    gotoPage("/");
  }
  else{
    const list = await getShoppingList(listName);
    if(list){
      activeList = listName;
    }
  }
}


function backToList() {
  if(activeList == undefined) {
    gotoPage("/einkaufsliste/üebersicht")
  }
  else {
    gotoPage("/einkaufsliste/l0/" + activeList)
  }
}



async function listItemHandling(event){
  const row = event.target.parentElement.parentElement;
  if(event.target.className == 'delete'){
    const result = await deleteJson("/einkaufsliste/"+ activeList + "/" + row.item.art)
    if(result){
      row.parentElement.removeChild(row);
    }
  }
  else{
    if(event.target.className == 'change'){
      updateItemChecked(row.item, event.target.checked)
    }
    
  }
}

async function updateItemChecked(item, checked){
  item.abgehakt = checked;
  const result = await putJson(item,'/einkaufsliste/' + activeList + "/" +  item.art)
}

function deleteActiveList(){
  if(deleteJson("/einkaufslisten/" + activeList)){
    gotoPage("/");
  }
}


async function addItem(event){
  const elements = document.forms["addItem-form"].elements;
  const art = elements["name"].value;
  const menge = elements["menge"].value;
  const einheit = elements["einheit"].value;
  
  if(menge == "" || art == "") {
    alert("Bitte vervollständigen sie ihre Eingabe")
    return;
  }
  const item = { art: art, anzahl: menge, einheit: einheit }
  const result = await postJson(item,'/einkaufslisten/' + activeList + '/items')
  if(result){
    document.forms["addItem-form"].reset();
  }
  else{
    alert("Fehler beim hinzufügen")
  }

}


document.addEventListener("DOMContentLoaded", function() {
  const uebersichtEinkaufslisten = document.querySelector("#uebersicht-einkaufslisten");
  uebersichtEinkaufslisten.addEventListener("navigation", renderUebersichtEinkaufslisten);

  const shoppingListItemOverwiev =  document.querySelector('#shoppingList');
  shoppingListItemOverwiev.addEventListener("click", listItemHandling)
  shoppingListItemOverwiev.addEventListener("navigation", renderShoppingList)

  const shoppingListItemAdd = document.querySelector('#addItem');
  shoppingListItemAdd.addEventListener("navigation", loadItemAdd)

  // trigger the initial page navigation after routes are registered
  // reads the url an navigates to the given page

  registerRoute("/", "uebersicht-einkaufslisten",reverseGuard)
  registerRoute("/einkaufsliste/üebersicht", "uebersicht-einkaufslisten", reverseGuard);
  registerRoute("/login", "login");
  registerRoute("/register", "register");
  registerRoute("/einkaufsliste/l0/:liste", "shoppingList", reverseGuard);
  registerRoute("/einkaufsliste/hinzufügen/:liste", "addItem", reverseGuard);
  
  doInitialNavigation();
});