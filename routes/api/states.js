const express = require('express');
const router = express.Router();
const statesController = require('../../controllers/statesController');

// GET all states or contig query
router.get('/', statesController.getAllStates);

// GET all info about a state
router.get('/:state', statesController.getState);

// GET random fun fact
router.get('/:state/funfact', statesController.getFunFact);

// GET capital, nickname, population, admission date
router.get('/:state/capital', statesController.getCapital);
router.get('/:state/nickname', statesController.getNickname);
router.get('/:state/population', statesController.getPopulation);
router.get('/:state/admission', statesController.getAdmissionDate);

// POST new fun facts
router.post('/:state/funfact', statesController.addFunFact);

// PATCH fun fact
router.patch('/:state/funfact', statesController.updateFunFact);

// DELETE fun fact
router.delete('/:state/funfact', statesController.deleteFunFact);

module.exports = router;
