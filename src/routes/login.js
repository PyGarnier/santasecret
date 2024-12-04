const express = require('express');
const router = express.Router();
const { renderTemplate } = require('../configs/utils')();
const path = require('path')
const usersPath = path.join(__dirname, '../datas/users.json');
const fs = require('fs');
const loadUsers = () => {
    delete require.cache[require.resolve(usersPath)];
    return require(usersPath);
};

const users = loadUsers();

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
        return renderTemplate(req, res, "login.ejs", { error: "Tous les champs sont obligatoires." });
    }

    // Recherche de l'utilisateur
    const utilisateur = users.find(u => u.mail === email);
    if (!utilisateur) {
        return renderTemplate(req, res, "login.ejs", { error: "Utilisateur inexistant." });
    }

    // Vérification du mot de passe
    if (password !== utilisateur.password) {
        return renderTemplate(req, res, "login.ejs", { error: "Mot de passe incorrect." });
    }

    // Création de la session utilisateur
    req.session.user = {
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        mail: utilisateur.mail,
        admin: utilisateur.admin,
    };

    // Redirection vers la page d'accueil
    return res.redirect('/');
});

// Route pour la déconnexion
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Erreur lors de la déconnexion.");
        }
        res.redirect('/');
    });
});

module.exports = router;