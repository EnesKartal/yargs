/* global describe, it */

import * as fs from 'fs';
import * as path from 'path';
import {expect} from 'chai';
import {applyExtends} from '../helpers/helpers.mjs';

describe('applyExtends', () => {
  it('loads a JSON file if one is referenced by "extends" key', () => {
    const conf = applyExtends(
      {
        extends: './test/fixtures/config.json',
        batman: 'Caped Crusader',
      },
      process.cwd()
    );
    expect(conf.batman).to.equal('Caped Crusader');
    expect(conf.version).to.equal('1.0.2');
  });

  it('does not allow prototype pollution via __proto__', () => {
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    const conf = applyExtends(polluted, process.cwd(), true);
    expect(conf.polluted).to.equal(undefined);
    expect({}.polluted).to.equal(undefined);
  });

  it('resolves relative extends inside an extended module config', () => {
    const pkgDir = path.join(
      process.cwd(),
      'node_modules',
      'yargs-extends-rel-test'
    );
    fs.mkdirSync(pkgDir, {recursive: true});
    try {
      fs.writeFileSync(
        path.join(pkgDir, 'package.json'),
        JSON.stringify({name: 'yargs-extends-rel-test', version: '1.0.0', main: 'index.json'})
      );
      fs.writeFileSync(
        path.join(pkgDir, 'index.json'),
        JSON.stringify({extends: './base.json', b: 2})
      );
      fs.writeFileSync(
        path.join(pkgDir, 'base.json'),
        JSON.stringify({c: 3})
      );
      const conf = applyExtends(
        {a: 1, extends: 'yargs-extends-rel-test'},
        process.cwd(),
        true
      );
      expect(conf).to.deep.equal({a: 1, b: 2, c: 3});
    } finally {
      fs.rmSync(pkgDir, {recursive: true, force: true});
    }
  });
});
