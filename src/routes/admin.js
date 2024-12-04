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

// Route principale du menu admin
router.get('/', (req, res) => {
    if (!isAuth(req) || !req.session.user?.admin) return res.redirect('/');

    const users = loadUsers(); // Recharger les utilisateurs sans cache
    return renderTemplate(req, res, 'admin.ejs', { users });
});

// Ajouter un utilisateur
router.post('/add-user', (req, res) => {
    const users = loadUsers(); // Recharger les utilisateurs sans cache

    const { nom, prenom, mail, password, admin } = req.body;
    if (users.find(u => u.mail === mail)) {
        return res.status(400).json({ error: 'Utilisateur existant.' });
    }

    users.push({ nom, prenom, mail, password, admin: admin === true, tiree: false, tirage: null });
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(201).json({ success: true });
});

// Modifier un utilisateur
router.patch('/edit-user', (req, res) => {
    const users = loadUsers(); // Recharger les utilisateurs sans cache

    const { mail, field, value } = req.body;
    const user = users.find(u => u.mail === mail);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

    user[field] = field === 'admin' ? value === true : value;
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(200).json({ success: true });
});

// Supprimer un utilisateur
router.delete('/delete-user', (req, res) => {
    let users = loadUsers(); // Recharger les utilisateurs sans cache

    const { mail } = req.body;
    users = users.filter(u => u.mail !== mail);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.status(200).json({ success: true });
});

module.exports = router;