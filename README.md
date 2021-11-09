# Projekt Template

Zum Installieren der Abhängigkeiten einmalig `npm install` ausführen.

Danach kann das Projekt mit `npm start` gestartet werden. Es wird automatisch neugestartet sobald eine Datei gespeichert wird.

Die Anwendung ist dann auf [http://localhost:3000](http://localhost:3000) verfügbar


# Routen

## Registrieren ✔️
HTTP-Verb: POST
Pfad: /register
Header:
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 201: User created.
- 400: User already exits.
- 400: No or invalid argument for user or password.


## Einloggen ✔️
HTTP-Verb: GET
Pfad: /login
Header:
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: Authorized
- 400: No or invalid argument for user or password.
- 401: User does not exist.

## Liste erstellen ✔️
HTTP-Verb: POST 
Pfad: /einkaufsliste
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: List created
- 400: Please insert a name for your list
- 400: Name Invalid
- 401: Unauthorized

## Listen (für einen User) abrufen
HTTP-Verb: GET
Pfad: /einkaufsliste
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: Lists found
- 401: Unauthorized
- 404: No Lists found

## Liste abrufen
HTTB-Verb: GET
Pfad: /einkaufsliste/<name>
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200
- 401: Unauthorized
- 404: List not found


## Items erstellen
Hinzufügen:
HTTP-Verb: POST
Pfad: /einkaufsliste/<name>
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: Item added
- 400: Invalid argument
- 401: Authentication is required
- 403: Item already exists
- 404: List not Found

## Items aktualisieren:
HTTP-Verb: PUT
Pfad: /einkaufsliste/<name>/<nameItem>
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
Status Codes:
- 200: Item updated
- 400: Invalid argument
- 401: Authentication is required
- 403: Item already exists
- 404: List/Item not Found

## Items Löschen:
HTTP-Verb: DELETE
Pfad: /einkaufsliste/<name>/<nameItem>
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: Item deleted
- 401: Authentication is required
- 404: List/Item not Found

## Liste löschen
HTTP-Verb: DELETE
Pfad: /einkaufsliste/<name>
Header:
    Cookie: token
    Content-Type: application/json
    Accept: application/json
Status Codes:
- 200: List deleted
- 401: Authentication is required
- 404: List not found





