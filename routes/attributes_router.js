const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.render('index');
});

router.get('/attributes', async (req, res) => {
  return res.render('attributes/index', {
    title: 'Attributes',
    button: 'Create attribute',
    buttonClass: 'create-attribute'
  });
});

module.exports = router;
