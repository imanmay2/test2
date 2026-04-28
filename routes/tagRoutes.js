const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');
const { validateName } = require('../middleware/validators');

router.use(auth);

router.route('/')
    .get(tagController.getTags)
    .post(validateName, tagController.createTag);

router.route('/:id')
    .get(tagController.getTag)
    .patch(validateName, tagController.updateTag)
    .delete(tagController.deleteTag);

module.exports = router;
