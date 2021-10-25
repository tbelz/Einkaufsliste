function renderShoppingListOverviewRow(table, einkaufsliste){
  const shoppingListName = document.createElement("td");
  shoppingListName.textContent = einkaufsliste.name;
  const uncheckedItems = document.createElement("td");
  const uncheckedCount = einkaufsliste.einträge.filter(item => { return item.abgehakt}).length
  uncheckedItems.textContent = uncheckedCount;

  const row = document.createElement("tr");
  row.classList.add("shoppingListInfo");
  row.appendChild(shoppingListName);
  row.appendChild(uncheckedItems);

  table.appendChild(row);
}

function removeElements(elementSelector) {
  const results = document.querySelectorAll(elementSelector);
  for(const result of results) {
    result.remove();
  }
}

async function renderUebersichtEinkaufslisten() {
  console.log("Rerender overview")
  
  const einkaufslisten = await getJSon("/einkaufslisten")
  console.log(einkaufslisten);
  const table = document.querySelector("#uebersicht-einkaufslisten table");
  removeElements("#benchmarks-overview .shoppingListInfo")

  einkaufslisten.forEach(einkaufsliste => {
    renderShoppingListOverviewRow(table, einkaufsliste)
  });
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
  const form = document.forms["login-form"];
  const username = form.elements["user"];
  const password1 = form.elements["password1"];
  const password2 = form.elements["password2"];

  if(password1 !== password2){
    alert("Passwörter stimmen nicht überein")
    return false;
  }

  const user = {
    username: username,
    password: password1
  }
  const response = postJson(user, "/login")

  if(parse(response).hasOwnProperty("error")){
    alert("Fehler: " + response.error);
    password1.reset();
    password2.reset();
    return;
  }
  getLogin(user);
  gotoPage("/");

}
/*
async function getJSon(path){
  const result = await fetch("/einkaufslisten");
  if(result.status >= 200 && result.status < 300){
    console.log(await result.json())
    const json = 
    console.log("1");
    console.log(json);
    return json;
  } else {
    alert("Anfrage fehlerhaft.");
  }
}
*/

async function getJSon(path) {
  const result = await fetch(path);

  if (!result.ok) {
    alert("Fehler beim Abruf der Benchmarks")
    return [];
  }
  console.log(result);
  const benchmarks = await result.json();
  console.log(result);
  return benchmarks;
}


async function postJson(obj, path) {
  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(obj)
  });
  
   // oder result.ok
   if(result.status >= 200 && result.status < 300) {
    return parse(res.json())
  } else {
    return false;
  }
}

function guard(params){
  if(!document.cookie.indexOf('token=')){
    gotoPage("/login")
    return false;
  }
  return true;
}

function reverseGuard(params){
  if(document.cookie.indexOf('token=')){
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", function() {
  const uebersichtEinkaufslisten = document.querySelector("#uebersicht-einkaufslisten");
  uebersichtEinkaufslisten.addEventListener("navigation", renderUebersichtEinkaufslisten());

  // trigger the initial page navigation after routes are registered
  // reads the url an navigates to the given page

  console.log("1");
  registerRoute("/", "uebersicht-einkaufslisten", guard);
  registerRoute("/einkaufslisten", "uebersicht-einkaufslisten", guard);
  registerRoute("/login", "login", reverseGuard);
  registerRoute("/register", "register", reverseGuard);

  doInitialNavigation();
});