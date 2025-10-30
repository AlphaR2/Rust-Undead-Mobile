import 'react-native-get-random-values';
import 'fast-text-encoding';
import 'react-native-worklets-core';
import { Platform } from 'react-native';
import structuredClone from '@ungap/structured-clone';
import * as Crypto from 'expo-crypto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;
global.TextEncoder = require('text-encoding').TextEncoder;
global.assert = require('assert');

Buffer.prototype.subarray = function subarray(begin, end) {
  const result = Uint8Array.prototype.subarray.apply(this, [begin, end]);
  Object.setPrototypeOf(result, Buffer.prototype);
  return result;
};

if (Platform.OS !== 'web') {
  const setupPolyfills = async () => {
    const { polyfillGlobal } = await import('react-native/Libraries/Utilities/PolyfillFunctions');
    const { TextEncoderStream, TextDecoderStream } = await import('@stardazed/streams-text-encoding');

    if (!('structuredClone' in global)) {
      polyfillGlobal('structuredClone', () => structuredClone);
    }

    polyfillGlobal('TextEncoderStream', () => TextEncoderStream);
    polyfillGlobal('TextDecoderStream', () => TextDecoderStream);

    if (!global.crypto) {
      global.crypto = {};
    }

    if (!global.crypto.subtle) {
      global.crypto.subtle = {
        digest: async (algorithm, data) => {
          if (algorithm !== 'SHA-256') {
            throw new Error(`Unsupported algorithm: ${algorithm}`);
          }

          let input;
          if (data instanceof Buffer || data instanceof ArrayBuffer) {
            input = new Uint8Array(data);
          } else if (ArrayBuffer.isView(data)) {
            input = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
          } else {
            throw new Error('Input must be a Buffer, ArrayBuffer, or ArrayBufferView');
          }

          return await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, input);
        }
      };
    }
  };

  setupPolyfills().catch((error) => {
    console.error('Failed to setup polyfills:', error);
  });
}

import '@ethersproject/shims';
import 'expo-router/entry';