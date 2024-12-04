const path = require('path');
const fs = require('fs')
const dataDir = path.resolve(`${process.cwd()}${path.sep}src`); // Le chemin de départ de tout les fichiers 
const templateDir = path.resolve(`${dataDir}${path.sep}views`); // Le chemin des fichiers ejs pour le rendu ( views )
const usersPath = path.resolve(`${dataDir}${path.sep}datas/users.json`)

module.exports = () => {

    // Définir une fonction de rendu plus optimisé que celle d'origine
    const renderTemplate = (req, res, template, data = {}) => {

      // Paramètres passés par défaut au front
      const baseData = {
          path: req.path,
          user: (req.session && req.session.user) ? req.session.user : {},
          error: null
      };
  
      // Rendu
      res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
  };

  const isAuth = (req) => {
    return req.session && req.session.user;
  }




    // Renvoyer les fonctions pour le require
      return {
        renderTemplate,
        isAuth
      }
}