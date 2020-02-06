// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import ContentShareConstants from '../contentsharecontroller/ContentShareConstants';

export default class Modality {
  private static MODALITY_SEPARATOR = ContentShareConstants.Modality[0];

  static MODALITY_CONTENT = ContentShareConstants.Modality.substr(1);

  constructor(private _id: string) {}

  id(): string {
    return this._id;
  }

  base(): string {
    if (this._id === '') {
      return '';
    }
    return this._id.split(Modality.MODALITY_SEPARATOR)[0];
  }

  modality(): string {
    if (this._id === '') {
      return '';
    }
    const components = this._id.split(Modality.MODALITY_SEPARATOR);
    if (components.length === 2) {
      return components[1];
    }
    return '';
  }

  hasModality(modality: string): boolean {
    return modality !== '' && this.modality() === modality;
  }

  withModality(modality: string): Modality {
    const m = new Modality(this.base() + Modality.MODALITY_SEPARATOR + modality);
    if (modality === '' || this.base() === '' || new Modality(m._id).modality() !== modality) {
      return new Modality(this.base());
    }
    return m;
  }
}
