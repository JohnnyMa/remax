import * as path from 'path';
import ejs from 'ejs';
import { compilation } from 'webpack';
import { Meta, RemaxOptions } from 'remax-types';
import API from '../../../../API';
import { pageUID } from './createPageTemplate';
import * as cacheable from './cacheable';

export default async function createHelperFile(
  options: RemaxOptions,
  pagePath: string,
  meta: Meta,
  compilation: compilation.Compilation
) {
  if (!meta.jsHelper || !meta.ejs.jsHelper) {
    return null;
  }

  pagePath = pagePath.replace(path.join(options.cwd, options.rootDir) + '/', '');

  const source: string = await ejs.renderFile(meta.ejs.jsHelper, {
    target: API.adapter.target,
  });

  const fileName = path.join(path.dirname(pagePath), `${pageUID(pagePath)}_helper${meta.jsHelper.extension}`);

  if (!cacheable.invalid(fileName, source)) {
    return;
  }

  compilation.assets[fileName] = {
    source: () => source,
    size: () => Buffer.byteLength(source),
  };
}
