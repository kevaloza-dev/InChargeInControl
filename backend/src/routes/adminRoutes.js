const express = require('express');
const multer = require('multer');
const { bulkImport, getUsers, exportUsers } = require('../controllers/adminController');
const { auth, admin } = require('../middleware/auth');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.use(auth, admin);

router.post('/import', upload.single('file'), bulkImport);
router.get('/users', getUsers);
router.get('/export', exportUsers);

module.exports = router;
