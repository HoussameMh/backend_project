const express=require('express')
const router= express.Router()
const authenticateUser=require('../middleware/authentication')

const {getAllProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  postUpdate,
  getProjectBackers}=require('../controllers/projectController')

router.get('/', getAllProjects);
router.get('/:id', getProject);
router.get('/:id/backers',getProjectBackers)

router.use(authenticateUser);
router.post('/', createProject);
router.patch('/:id', updateProject);
router.delete('/:id', deleteProject);
router.post('/:id/updates',postUpdate)

module.exports=router