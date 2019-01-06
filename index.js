const fs = require('fs');
const path = require('path');

module.exports = class Loader {
    constructor(config) {
        this.config = config;
        const Hemera = require('nats-hemera');
        const NATS = require('nats');

        let { url, host, port } = this.config.nats;
        let client = NATS.connect({ url: url || `nats://${host}:${port}` });

        let { logLevel, name } = this.config;
        this.hemera = new Hemera(client, { logLevel, childLogger: false, tag: name });

        if (this.config.extensions === void 0 || this.config.plugins === 0)
            return this.isReady = false;

        this.plugins = [];
        this.__require__(this.config.extensions);
        this.__plugin__(this.config.plugins);
    }

    // async __test__() {
    //     try {
    //         let r = await this.hemera.act({ topic: 'plugin1', cmd: 'create' })
    //         let r2 = await this.hemera.act({ topic: 'plugin2', cmd: 'remove' })
    //         let r3 = await this.hemera.act({ topic: 'plugin2', cmd: 'create' })
            
    //         console.log('res', r.data, r2.data, r3.data);
    //     }
    //     catch (e) {
    //         console.log('error', e)
    //     }
    // }

    __require__(extensions) {
        extensions.forEach(ext => {
            typeof ext === "string"
                ? this.hemera.use(require(ext))
                : this.hemera.use(require(ext.name), /* config */
                    { [Object.keys(ext)[1]]: Object.values(ext)[1] })
        });
    }

    // TODO plugin: format replies, logs, messages
    __plugin__(plugins) {
        plugins.forEach(p =>
            this.hemera.use((hemera, config, done) => {
                let { topic } = config;

                let _ = path.join(__dirname, config.path);
                let _manager = path.join(_, config.handler);
                let _communicator = path.join(_, config.communicator);
                let _da = path.join(_, config.data_access);
                // let _msg = path.join(_, config.messenger);

                let communicator = require(_communicator)(hemera,config);
                let da = require(_da)(hemera, config);
                // let messenger = require(_msg)(hemera, config);
                
                let options = { communicator, da, config }

                let manager = require(_manager)(options);
                
                Object.keys(manager).forEach(h => hemera.add({ topic, cmd: h }, manager[h]));

                done()
            }, p)
        )
    }

    ready() {
        let { name } = this.config;
        this.hemera
            .ready()
            .then(() => {
                console.log(`${name} service listening...`)
                // this.__test__();
            })
            .catch((err) => console.error(err, `${name} service error!`));
    }
}