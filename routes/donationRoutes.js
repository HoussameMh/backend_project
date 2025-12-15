const express=require('express')
const router= express.Router()
const authenticateUser=require('../middleware/authentication')
const {createDonation,getMyDonations}=require('../controllers/donationController')

router.post('/',authenticateUser,createDonation).get('/',authenticateUser,getMyDonations)


module.exports=router