const Donation = require('../models/Donation');
const Project = require('../models/Project');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError, BadRequestError } = require('../errors');


const createDonation = async (req, res) => {
  const { amount, project: projectId, selectedRewardId } = req.body;
  const { userId } = req.user;

  
  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw new NotFoundError(`Pas de projet avec l'id ${projectId}`);
  }

  if (new Date(project.deadline) < new Date()) {
    throw new BadRequestError('La collecte pour ce projet est terminée.');
  }


  if (selectedRewardId) {
    const reward = project.rewards.id(selectedRewardId);

    if (!reward) {
      throw new NotFoundError('Récompense introuvable');
    }

    if (amount < reward.minAmount) {
      throw new BadRequestError(
        `Pour choisir "${reward.title}", vous devez donner au moins ${reward.minAmount} DH`
      );
    }

    if (reward.stock !== null && reward.stock <= 0) {
      throw new BadRequestError('Désolé, cette récompense est en rupture de stock !');
    }

    reward.claimers += 1; 
    if (reward.stock !== null) {
      reward.stock -= 1;  
    }
  }

  const donation = await Donation.create({
    amount,
    donor: userId,
    project: projectId,
    selectedRewardId, 
    status: 'completed'
  });

   project.currentAmount += amount;

   if (!project.backers.includes(userId)) {
    project.backers.push(userId);
    project.backersCount += 1;
  }

  await project.save(); 

  res.status(StatusCodes.CREATED).json({ 
    donation, 
    msg: 'Don effectué et récompense validée !' 
  });
};


const getMyDonations = async (req, res) => {
  
  const donations = await Donation.find({ donor: req.user.userId })
    .populate('project', 'title category') 
    .sort('-createdAt');

  res.status(StatusCodes.OK).json({ donations, count: donations.length });
};

module.exports = { createDonation , getMyDonations};