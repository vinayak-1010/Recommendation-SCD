#!/usr/bin/env node --experimental-strip-types
/**
 * Data validation script using JSON schemas
 */

import Ajv from 'ajv';
import { readFileSync } from 'fs';
import { join } from 'path';

const ajv = new Ajv({ allErrors: true, verbose: true });

interface ValidationTarget {
  dataFile: string;
  schemaFile: string;
  name: string;
}

const targets: ValidationTarget[] = [
  { dataFile: 'data/places.json', schemaFile: 'data/schemas/places.schema.json', name: 'Places' },
  { dataFile: 'data/eateries.json', schemaFile: 'data/schemas/eateries.schema.json', name: 'Eateries' },
  { dataFile: 'data/clusters.json', schemaFile: 'data/schemas/clusters.schema.json', name: 'Clusters' },
  { dataFile: 'data/routes.json', schemaFile: 'data/schemas/routes.schema.json', name: 'Routes' },
  { dataFile: 'data/traffic.json', schemaFile: 'data/schemas/traffic.schema.json', name: 'Traffic' },
  { dataFile: 'data/rules.json', schemaFile: 'data/schemas/rules.schema.json', name: 'Rules' },
  { dataFile: 'data/copy.json', schemaFile: 'data/schemas/copy.schema.json', name: 'Copy' },
  { dataFile: 'data/config.json', schemaFile: 'data/schemas/config.schema.json', name: 'Config' }
];

let hasErrors = false;

for (const target of targets) {
  try {
    const schema = JSON.parse(readFileSync(target.schemaFile, 'utf-8'));
    const data = JSON.parse(readFileSync(target.dataFile, 'utf-8'));
    
    const validate = ajv.compile(schema);
    const valid = validate(data);
    
    if (!valid) {
      console.error(`❌ ${target.name} validation failed:`);
      console.error(JSON.stringify(validate.errors, null, 2));
      hasErrors = true;
    } else {
      console.log(`✅ ${target.name} validation passed`);
    }
  } catch (err) {
    console.error(`❌ Error validating ${target.name}:`, err);
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error('\n❌ Validation failed');
  process.exit(1);
} else {
  console.log('\n✅ All data files validated successfully');
}
