const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const usersPath = path.join(__dirname, '../datas/users.json');
const { renderTemplate, isAuth } = require('../configs/utils')();

// Fonction pour charger les utilisateurs sans cache
const loadUsers = () => {
    delete require.cache[require.resolve(usersPath)];
    return require(usersPath);
};

// Route principale du tirage
router.get('/', (req, res) => {
    if (!isAuth(req)) return res.redirect('/');

    const users = loadUsers();

    const currentUser = users.find(u => u.mail === req.session.user.mail);
    if (!currentUser) return res.redirect('/auth/logout');

    req.session.user = currentUser;

    return renderTemplate(req, res, 'tirage.ejs', { users, user: req.session.user });
});

// Route pour effectuer un tirage
router.post('/draw', (req, res) => {
    if (!isAuth(req)) return res.status(403).json({ error: "Non autorisé" });

    const users = loadUsers();

    const currentUserIndex = users.findIndex(u => u.mail === req.session.user.mail);
    if (currentUserIndex === -1) return res.status(404).json({ error: "Utilisateur introuvable" });

    const currentUser = users[currentUserIndex];

    if (currentUser.tirage) {
        return res.status(400).json({ error: "Vous avez déjà effectué un tirage" });
    }

    const winner = users.find(u => u.mail === req.body.winnerMail && !u.tiree);
    if (!winner) return res.status(400).json({ error: "Utilisateur non valide ou déjà tiré" });

    // Marquer l'utilisateur tiré
    winner.tiree = true;

    // Enregistrer le tirage pour l'utilisateur actuel
    currentUser.tirage = {
        nom: winner.nom,
        prenom: winner.prenom,
        mail: winner.mail,
    };

    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));

    req.session.user = currentUser;

    return res.status(200).json({ success: true });
});

module.exports = router;