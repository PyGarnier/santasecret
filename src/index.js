// Importer les modules
const express = require('express');
const ejs = require('ejs');
const session = require('express-session')
const path = require('path');
const config = require('./configs/config.json'); // Importer le fichiers de configuration

const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore({
  host: 'gp243685-002.eu.clouddb.ovh.net', // Remplace par ton hôte MySQL
  port: 35936, // Port MySQL par défaut
  user: 'atnadmin', // Nom d'utilisateur de ta base de données MySQL
  password: 'aTnaAdmin123', // Mot de passe de ta base de données MySQL
  createDatabaseTable: true,
  database: 'atna', // Nom de ta base de données
  schema: {
		tableName: 'str-session',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
});
module.exports.sessionStore  = sessionStore


const dataDir = path.resolve(`${process.cwd()}${path.sep}src`); // Le chemin de départ de tout les fichiers 
const templateDir = path.resolve(`${dataDir}${path.sep}views`); // Le chemin des fichiers ejs pour le rendu ( views )


// Définir les chemins
const { renderTemplate, isAuth } = require('./configs/utils')(); // Importer le fichiers avec les fonctions utiles à l'app

const app = express() // Créer le serveur web express stocké dans l'objet app
app.engine("html", ejs.renderFile); // Définir le mode de rendu sur ejs
app.set("view engine", "html");
app.use("/", express.static(path.resolve(`${dataDir}${path.sep}public`)));


const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded())
app.use(bodyParser.json())

// Configuration des sessions
app.use(session({
    key: 'secrItSanta_session',
    secret: "#####{#{~{#|#{[`[{|[`[#{|#|`3657865324765663463546435346353653635636345345636363R23T43T34HFM34+876536789",
    resave: false,  // Ne pas réenregistrer une session qui n'a pas été modifiée
    saveUninitialized: true,  // Ne pas créer de session tant qu'elle n'est pas modifiée
    cookie: {
      maxAge: 1 * 1000 * 60 * 90, // 90 minutes
      secure: false, // Utiliser true en production avec HTTPS
      httpOnly: true,
      sameSite: 'lax'
    },
    store: sessionStore
  }));


// Page principale : "/" --- Rendu : home.ejs
app.get('/', (req, res) => {
  if (!isAuth(req)) {
      return renderTemplate(req, res, "login.ejs", { error: null });
  }
  return renderTemplate(req, res, "home.ejs");
});

// Authentification
const loginRouter = require('./routes/login')
app.use('/auth', loginRouter)



// Admin
const adminRouter = require('./routes/admin')
app.use('/admin', adminRouter)

// Tirage
const tirageRouter = require('./routes/tirage')
app.use('/tirage', tirageRouter)



app.listen(config.PORT, () => { // Mettre en ligne l'app sur le port défini dans le fichier config
    console.log(`Application en ligne : ${config.DOMAINE}`)
})