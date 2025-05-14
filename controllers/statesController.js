const statesData = require('../data/statesData.json');
const State = require('../model/states'); // MongoDB model

// check if a state code is valid
const isValidStateCode = (code) => {
    return statesData.some(state => state.code.toUpperCase() === code.toUpperCase());
};

// find state in JSON by code
const findState = (code) => statesData.find(state => state.code.toUpperCase() === code.toUpperCase());

// GET /states or /states?contig=true|false
const getAllStates = async (req, res) => {
    let states = [...statesData];

    if (req.query.contig === 'true') {
        states = states.filter(state => state.code !== 'AK' && state.code !== 'HI');
    } else if (req.query.contig === 'false') {
        states = states.filter(state => state.code === 'AK' || state.code === 'HI');
    }

    const dbStates = await State.find({});
    states = states.map(state => {
        const match = dbStates.find(s => s.stateCode === state.code);
        if (match && match.funfacts && match.funfacts.length) {
            return { ...state, funfacts: match.funfacts };
        }
        return state;
    });

    res.json(states);
};

//GET state
const getState = async (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const state = findState(code);

    try {
        const dbState = await State.findOne({ stateCode: code }).exec();

        if (dbState && Array.isArray(dbState.funfacts) && dbState.funfacts.length > 0) {
            return res.json({ ...state, funfacts: dbState.funfacts });
        }

        return res.json(state);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

//GET funfact
const getFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const dbState = await State.findOne({ stateCode: code });

    if (!dbState || !dbState.funfacts.length) {
        const state = findState(code);
        const stateName = state ? state.state : code;
        return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
    }

    const random = Math.floor(Math.random() * dbState.funfacts.length);
    res.json({ funfact: dbState.funfacts[random] });
};

const getCapital = (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const state = findState(code);
    res.json({ state: state.state, capital: state.capital_city });
};
//GET nickname
const getNickname = (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const state = findState(code);
    res.json({ state: state.state, nickname: state.nickname });
};
//GET population
const getPopulation = (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const state = findState(code);
    res.json({ state: state.state, population: state.population.toLocaleString() });
};
//GET admission Date
const getAdmissionDate = (req, res) => {
    const code = req.params.state.toUpperCase();

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    const state = findState(code);
    res.json({ state: state.state, admitted: state.admission_date });
};

// POST: Add new fun facts
const addFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const funfacts = req.body.funfacts;

    const stateExists = findState(code);
    if (!stateExists) {
        return res.status(404).json({ message: `State with code ${code} not found` });
    }

    if (!funfacts) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }

    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    let stateDoc = await State.findOne({ stateCode: code });
    if (stateDoc) {
        const uniqueFunfacts = [...stateDoc.funfacts, ...funfacts];
        stateDoc.funfacts = uniqueFunfacts;
    } else {
        stateDoc = new State({ stateCode: code, funfacts });
    }

    await stateDoc.save();
    res.status(201).json(stateDoc);
};

// PATCH: Update fun fact
const updateFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { index, funfact } = req.body;

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    if (!funfact || typeof funfact !== 'string') {
        return res.status(400).json({ message: 'State fun fact value required' });
    }

    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !Array.isArray(stateDoc.funfacts) || stateDoc.funfacts.length === 0) {
        const state = findState(code);
        const stateName = state ? state.state : code;
        return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
    }

    const idx = index - 1;

    if (idx < 0 || idx >= stateDoc.funfacts.length) {
        const state = findState(code);
        const stateName = state ? state.state : code;
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateName}` });
    }

    stateDoc.funfacts[idx] = funfact;
    await stateDoc.save();

    res.json(stateDoc);
};

// DELETE: Remove fun fact
const deleteFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { index } = req.body;

    if (!isValidStateCode(code)) {
        return res.status(400).json({ message: 'Invalid state abbreviation parameter' });
    }

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !Array.isArray(stateDoc.funfacts) || stateDoc.funfacts.length === 0) {
        const state = findState(code);
        const stateName = state ? state.state : code;
        return res.status(404).json({ message: `No Fun Facts found for ${stateName}` });
    }

    const idx = index - 1;

    if (idx < 0 || idx >= stateDoc.funfacts.length) {
        const state = findState(code);
        const stateName = state ? state.state : code;
        return res.status(400).json({ message: `No Fun Fact found at that index for ${stateName}` });
    }

    stateDoc.funfacts.splice(idx, 1);
    await stateDoc.save();
    res.json(stateDoc);
};

// Exports
module.exports = {
    getAllStates,
    getState,
    getFunFact,
    getCapital,
    getNickname,
    getPopulation,
    getAdmissionDate,
    addFunFact,
    updateFunFact,
    deleteFunFact
};