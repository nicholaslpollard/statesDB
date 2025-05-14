const statesData = require('../data/statesData.json');
const State = require('../model/states'); // MongoDB model

// Helper: find state in JSON by code
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

const getState = async (req, res) => {
    const code = req.params.state.toUpperCase();

    // Get the state from the static JSON file
    const state = findState(code);
    if (!state) return res.status(404).json({ message: `State with code ${code} not found` });

    try {
        // Get any fun facts from MongoDB
        const dbState = await State.findOne({ stateCode: code }).exec();

        // Combine if there are fun facts in MongoDB
        if (dbState && Array.isArray(dbState.funfacts) && dbState.funfacts.length > 0) {
            return res.json({ ...state, funfacts: dbState.funfacts });
        }

        // Return static state data only
        return res.json(state);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const getFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const dbState = await State.findOne({ stateCode: code });

    if (!dbState || !dbState.funfacts.length) {
        return res.status(404).json({ message: `No Fun Facts found for ${code}` });
    }

    const random = Math.floor(Math.random() * dbState.funfacts.length);
    res.json({ funfact: dbState.funfacts[random] });
};

const getCapital = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(404).json({ message: `State with code ${req.params.state} not found` });

    res.json({ state: state.state, capital: state.capital_city });
};

const getNickname = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(404).json({ message: `State with code ${req.params.state} not found` });

    res.json({ state: state.state, nickname: state.nickname });
};

const getPopulation = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(404).json({ message: `State with code ${req.params.state} not found` });

    res.json({ state: state.state, population: state.population.toLocaleString() });
};

const getAdmissionDate = (req, res) => {
    const state = findState(req.params.state);
    if (!state) return res.status(404).json({ message: `State with code ${req.params.state} not found` });

    res.json({ state: state.state, admitted: state.admission_date });
};

// POST: Add new fun facts
const addFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const funfacts = req.body.funfacts;

    if (!funfacts || !Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value required and must be an array' });
    }

    const stateExists = findState(code);
    if (!stateExists) {
        return res.status(404).json({ message: `State with code ${code} not found` });
    }

    let stateDoc = await State.findOne({ stateCode: code });
    if (stateDoc) {
        // Prevent duplicate fun facts
        const uniqueFunfacts = [...new Set([...stateDoc.funfacts, ...funfacts])];
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

    if (index === undefined || !funfact) {
        return res.status(400).json({ message: 'State fun fact and index value required' });
    }

    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !stateDoc.funfacts.length) {
        return res.status(404).json({ message: `No Fun Facts found for ${code}` });
    }

    // Corrected index validation
    if (index < 0 || index >= stateDoc.funfacts.length) {
        return res.status(400).json({ message: 'No Fun Fact found at that index' });
    }

    stateDoc.funfacts[index] = funfact;
    await stateDoc.save();
    res.json(stateDoc);
};

// DELETE: Remove fun fact
const deleteFunFact = async (req, res) => {
    const code = req.params.state.toUpperCase();
    const { index } = req.body;

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    const stateDoc = await State.findOne({ stateCode: code });
    if (!stateDoc || !stateDoc.funfacts.length) {
        return res.status(404).json({ message: `No Fun Facts found for ${code}` });
    }

    // Corrected index validation
    if (index < 0 || index >= stateDoc.funfacts.length) {
        return res.status(400).json({ message: 'No Fun Fact found at that index' });
    }

    stateDoc.funfacts.splice(index, 1);
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

