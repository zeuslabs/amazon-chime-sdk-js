// Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as chai from 'chai';

import ContentShareConstants from '../../src/contentsharecontroller/ContentShareConstants';
import Modality from '../../src/modality/Modality';

describe('Modality', () => {
  const expect: Chai.ExpectStatic = chai.expect;

  describe('base', () => {
    it('returns expected values', () => {
      expect(new Modality('').base()).to.eq('');
      expect(new Modality('base').base()).to.eq('base');
      expect(new Modality('base#modality').base()).to.eq('base');
      expect(new Modality('base#modality#bad').base()).to.eq('base');
    });
  });

  describe('modality', () => {
    it('returns expected values', () => {
      expect(new Modality('').modality()).to.eq('');
      expect(new Modality('base').modality()).to.eq('');
      expect(new Modality('base#modality').modality()).to.eq('modality');
      expect(new Modality('base#modality#bad').modality()).to.eq('');
    });
  });

  describe('hasModality', () => {
    it('returns expected values', () => {
      expect(new Modality('').hasModality('')).to.eq(false);
      expect(new Modality('').hasModality('modality')).to.eq(false);
      expect(new Modality('').hasModality('modality#bad')).to.eq(false);
      expect(new Modality('base').hasModality('')).to.eq(false);
      expect(new Modality('base').hasModality('modality')).to.eq(false);
      expect(new Modality('base').hasModality('modality#bad')).to.eq(false);
      expect(new Modality('base#modality').hasModality('')).to.eq(false);
      expect(new Modality('base#modality').hasModality('modality')).to.eq(true);
      expect(new Modality('base#modality').hasModality('modality#bad')).to.eq(false);
      expect(new Modality('base#modality#bad').hasModality('')).to.eq(false);
      expect(new Modality('base#modality#bad').hasModality('modality')).to.eq(false);
      expect(new Modality('base#modality#bad').hasModality('modality#bad')).to.eq(false);
    });
  });

  describe('withModality', () => {
    it('returns expected values', () => {
      expect(new Modality('').withModality('').id()).to.eq('');
      expect(new Modality('').withModality('modality').id()).to.eq('');
      expect(new Modality('').withModality('modality#bad').id()).to.eq('');
      expect(new Modality('base').withModality('').id()).to.eq('base');
      expect(new Modality('base').withModality('modality').id()).to.eq('base#modality');
      expect(new Modality('base').withModality('modality#bad').id()).to.eq('base');
      expect(new Modality('base#other').withModality('').id()).to.eq('base');
      expect(new Modality('base#other').withModality('modality').id()).to.eq('base#modality');
      expect(new Modality('base#other').withModality('modality#bad').id()).to.eq('base');
      expect(new Modality('base#other#bad').withModality('').id()).to.eq('base');
      expect(new Modality('base#other#bad').withModality('modality').id()).to.eq('base#modality');
      expect(new Modality('base#other#bad').withModality('modality#bad').id()).to.eq('base');
    });
  });

  describe('content', () => {
    const modality = ContentShareConstants.Modality;
    it('returns expected values', () => {
      expect(new Modality('base' + modality).base()).to.eq('base');
      expect(new Modality('base' + modality).modality()).to.eq(Modality.MODALITY_CONTENT);
      expect(new Modality('base' + modality).hasModality(Modality.MODALITY_CONTENT)).to.eq(true);
      expect(new Modality('base').withModality(Modality.MODALITY_CONTENT).id()).to.eq(
        'base' + modality
      );
    });
  });
});
