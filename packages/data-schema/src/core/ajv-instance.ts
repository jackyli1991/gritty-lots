import Ajv from 'ajv';
// import draft07Schema from 'ajv/dist/refs/json-schema-draft-07.json'

const ajv = new Ajv();

// Register meta schema under its default $id key
// const metaKey = draft07Schema.$id
// if (!ajv.getSchema(metaKey)) {
//   ajv.addMetaSchema(draft07Schema, metaKey)
// }

// Also register under the https URL key used by some JSON files
// if (!ajv.getSchema('https://json-schema.org/draft-07/schema')) {
//   ajv.addMetaSchema(draft07Schema, 'https://json-schema.org/draft-07/schema')
// }

export default ajv;
