const assert = require('assert');
const HemeraLoader = require('../index');
const cfg = require('./config.sample.json');
const loader = new HemeraLoader(cfg);
loader.ready();

const hemera = loader.hemera;

// TODO

describe('Hemera', () => {
    it('act', async()=> {
        let res = await hemera.act({topic: 'plugin1', cmd: 'create'});

        assert(res.data, 'Creation done!')
    })
})