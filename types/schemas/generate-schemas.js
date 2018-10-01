const path = require('path');
const TJS = require('typescript-json-schema');

// optionally pass argument to schema generator
const settings = {
  required: true
};

// optionally pass ts compiler options
const compilerOptions = {
  "declaration": false,
  "baseUrl": ".",
  "allowJs": false,
  "target": "es5",
  "ignoreError":true,
  "module": "commonjs",
  "noImplicitAny": true,
  "removeComments": true,
  "allowUnreachableCode": true,
  "lib": [
    "es2015",
    "es2016",
    "es2017",
    "dom",
    "es5",
    "es2015.promise"
  ]
};

const cwd = process.cwd();

const files = [
  path.resolve(cwd + '/dts/at-config.d.ts')
];

files.forEach(function(f){
  console.log('generating schemas for file => ', f);
});

const program = TJS.getProgramFromFiles(files, compilerOptions);

// const program = TJS.getProgramFromFiles(files);

// We can either get the schema for one file and one type...
// const schema = TJS.generateSchema(program, 'IAtConfig', settings);
const schema = TJS.generateSchema(program, 'IAtConfig');

console.log('schema is as follows:');
console.log(schema);


// // ... or a generator that lets us incrementally get more schemas
// const generator = TJS.buildGenerator(program, settings);
//
// // all symbols
// const symbols = generator.getUserSymbols();
//
// // Get symbols for different types from generator.
// generator.getSchemaForSymbol("MyType");
// generator.getSchemaForSymbol("AnotherType");
