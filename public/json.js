async function getJSon(path) {
    const result = await fetch(path);
    console.log("paht: ", path)
    if (!result.ok) {
      alert("Fehler beim Abruf der Einkaufslisten")
      return [];
    }
    const einkaufslisten = await result.json();
    return einkaufslisten;
  }
  
  
  async function postJson(obj, path) {
    console.log(obj, path)
    const result = await fetch(path, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(obj)
    });
    
     // oder result.ok
     if(result.status >= 200 && result.status < 300) {
      return result.json();
    } else {
      return false;
    }
  }
  
  async function putJson(obj, path){
    const result = await fetch(path, {
      method: "PUT",
      body: JSON.stringify(obj),
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    if (result.ok) {
      return true;
    }
    return false;
  }

  async function deleteJson(path){
    const result = await fetch(path, {
        method: "DELETE",
        headers: {
            'Content-type': 'application/json'
        }
      });
      if (result.ok) {
        return true;
      }
      return false;
  }