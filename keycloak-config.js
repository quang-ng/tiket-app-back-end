var session = require('express-session');
var Keycloak = require('keycloak-connect');
// var app = require('./app');

let _keycloak;

var keycloakConfig = {
    clientId: 'tiket-app',
    bearerOnly: true,
    serverUrl: 'http://localhost:8080/auth',
    realm: 'Demo-Realm',
    credentials: {
        secret: 'eb30190c-6480-48d9-8133-95bc9b639ddc'
    }
};

function initKeycloak() {
    if (_keycloak) {
        console.warn("Trying to init Keycloak again!");
        return _keycloak;
    } 
    else {
        console.log("Initializing Keycloak...");
        var memoryStore = new session.MemoryStore();
        console.log("keycloakConfig: ",keycloakConfig)
        _keycloak = new Keycloak({ store: memoryStore }, keycloakConfig);
        return _keycloak;
    }
}

function getKeycloak() {
    if (!_keycloak){
        console.error('Keycloak has not been initialized. Please called init first.');
    } 
    return _keycloak;
}

module.exports = {
    initKeycloak,
    getKeycloak
};