// Copyright IBM Corp. 2020. All Rights Reserved.
// Node module: @loopback/boot
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {
  config,
  Constructor,
  inject,
  MetadataInspector,
} from '@loopback/context';
import {Application, CoreBindings} from '@loopback/core';
import {Model, MODEL_KEY} from '@loopback/repository';
import debugFactory from 'debug';
import {BootBindings} from '../keys';
import {ArtifactOptions, booter} from '../types';
import {BaseArtifactBooter} from './base-artifact.booter';

const debug = debugFactory('loopback:boot:model-booter');

/**
 * A class that extends BaseArtifactBooter to boot the 'Model' artifact type.
 *
 * Supported phases: configure, discover, load
 *
 * @param app - Application instance
 * @param projectRoot - Root of User Project relative to which all paths are resolved
 * @param bootConfig - Model Artifact Options Object
 */
@booter('models')
export class ModelBooter extends BaseArtifactBooter {
  constructor(
    @inject(CoreBindings.APPLICATION_INSTANCE)
    public app: Application,
    @inject(BootBindings.PROJECT_ROOT) projectRoot: string,
    @config()
    public modelConfig: ArtifactOptions = {},
  ) {
    super(
      projectRoot,
      // Set Model Booter Options if passed in via bootConfig
      Object.assign({}, ModelDefaults, modelConfig),
    );
  }

  /**
   * Uses super method to get a list of Artifact classes. Boot each file by
   * creating a DataSourceConstructor and binding it to the application class.
   */
  async load() {
    await super.load();

    for (const cls of this.classes) {
      if (!isModelClass(cls)) continue;

      debug('Bind class: %s', cls.name);
      // We are binding the model class itself
      const binding = this.app.bind(`models.${cls.name}`).to(cls).tag('model');
      debug('Binding created for model class %s: %j', cls.name, binding);
    }
  }
}

/**
 * Default ArtifactOptions for DataSourceBooter.
 */
export const ModelDefaults: ArtifactOptions = {
  dirs: ['models'],
  extensions: ['.model.js'],
  nested: true,
};

function isModelClass(cls: Constructor<unknown>) {
  if (MetadataInspector.getClassMetadata(MODEL_KEY, cls)) {
    return true;
  }
  return extendsFrom(cls, Model);
}

function extendsFrom(
  subClass: Constructor<unknown>,
  baseClass: Constructor<unknown>,
) {
  let cls = subClass;
  while (cls) {
    if (cls === baseClass) return true;
    cls = Object.getPrototypeOf(cls);
  }
  return false;
}
