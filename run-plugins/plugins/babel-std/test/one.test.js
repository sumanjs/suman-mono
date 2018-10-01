const suman = require('suman');
const Test = suman.init(module);

Test.create(function (it, child_process, fs, path) {

  const fixtures = path.resolve(__dirname, 'fixtures');

  fs.readdirSync(fixtures, function (items) {

    items.forEach(function (item) {

      it.cb(item, t => {

        const file = path.resolve(fixtures, item);
        const k = child_process.spawn('suman',[file]);

        k.once('exit', t);

      });

    });

  });

});