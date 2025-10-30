/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rust_undead.json`.
 */
export type RustUndead = {
  "address": "undWHawzrspG9R65bd6V2UxbEw8REc8yWtx4DQ6F3e9",
  "metadata": {
    "name": "rustUndead",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "buildGamingProfile",
      "discriminator": [
        23,
        242,
        234,
        248,
        22,
        13,
        190,
        6
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "gamerProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  103,
                  97,
                  109,
                  101,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "characterClass",
          "type": {
            "defined": {
              "name": "warriorClass"
            }
          }
        }
      ]
    },
    {
      "name": "buildUserProfile",
      "discriminator": [
        140,
        180,
        253,
        176,
        90,
        204,
        176,
        232
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "userRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "arg",
                "path": "username"
              }
            ]
          }
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "username",
          "type": "string"
        },
        {
          "name": "persona",
          "type": {
            "defined": {
              "name": "userPersona"
            }
          }
        }
      ]
    },
    {
      "name": "callbackWarriorStats",
      "discriminator": [
        16,
        177,
        198,
        189,
        251,
        20,
        26,
        186
      ],
      "accounts": [
        {
          "name": "vrfProgramIdentity",
          "docs": [
            "This check ensures that the vrf_program_identity (which is a PDA) is a signer",
            "enforcing the callback is executed by the VRF program through CPI"
          ],
          "signer": true,
          "address": "9irBy75QS2BN81FUgXuHcjqceJJRuc9oDkAe8TKVvvAw"
        },
        {
          "name": "warrior",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "randomness",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "createWarrior",
      "discriminator": [
        163,
        157,
        34,
        175,
        170,
        146,
        80,
        103
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "authority",
          "signer": true
        },
        {
          "name": "gameConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "warrior",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  97,
                  100,
                  95,
                  119,
                  97,
                  114,
                  114,
                  105,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "player"
              },
              {
                "kind": "arg",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "userProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "oracleQueue",
          "writable": true,
          "address": "Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "programIdentity",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  105,
                  100,
                  101,
                  110,
                  116,
                  105,
                  116,
                  121
                ]
              }
            ]
          }
        },
        {
          "name": "vrfProgram",
          "address": "Vrf1RNUjXmQGjmQrQLvJHs9SNkvDJEsRVFPkfSQUwGz"
        },
        {
          "name": "slotHashes",
          "address": "SysvarS1otHashes111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "dna",
          "type": {
            "array": [
              "u8",
              8
            ]
          }
        },
        {
          "name": "class",
          "type": {
            "defined": {
              "name": "warriorClass"
            }
          }
        },
        {
          "name": "clientSeed",
          "type": "u8"
        },
        {
          "name": "noVrf",
          "type": "bool"
        }
      ]
    },
    {
      "name": "gameProfileToRollup",
      "discriminator": [
        43,
        41,
        232,
        35,
        136,
        46,
        86,
        117
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bufferUserGameProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "userGameProfile"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                13,
                133,
                203,
                158,
                235,
                255,
                216,
                98,
                129,
                46,
                208,
                120,
                135,
                122,
                235,
                210,
                78,
                45,
                190,
                79,
                244,
                162,
                97,
                67,
                196,
                78,
                248,
                142,
                196,
                36,
                151,
                18
              ]
            }
          }
        },
        {
          "name": "delegationRecordUserGameProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "userGameProfile"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataUserGameProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "userGameProfile"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "userGameProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  103,
                  97,
                  109,
                  101,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "ownerProgram",
          "address": "undWHawzrspG9R65bd6V2UxbEw8REc8yWtx4DQ6F3e9"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "player",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "initializeGameConfig",
      "discriminator": [
        45,
        61,
        80,
        55,
        152,
        63,
        158,
        47
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "releasedChapters",
          "type": "u8"
        }
      ]
    },
    {
      "name": "initializeUndeadWorld",
      "discriminator": [
        189,
        213,
        161,
        136,
        32,
        41,
        40,
        186
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "gameConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  103,
                  97,
                  109,
                  101,
                  95,
                  99,
                  111,
                  110,
                  102,
                  105,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        },
        {
          "name": "undeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  97,
                  100,
                  95,
                  119,
                  111,
                  114,
                  108,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "worldId"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "worldId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "processUndelegation",
      "discriminator": [
        196,
        28,
        41,
        206,
        48,
        37,
        51,
        167
      ],
      "accounts": [
        {
          "name": "baseAccount",
          "writable": true
        },
        {
          "name": "buffer"
        },
        {
          "name": "payer",
          "writable": true
        },
        {
          "name": "systemProgram"
        }
      ],
      "args": [
        {
          "name": "accountSeeds",
          "type": {
            "vec": "bytes"
          }
        }
      ]
    },
    {
      "name": "startChapter",
      "discriminator": [
        79,
        174,
        206,
        75,
        194,
        166,
        130,
        22
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "gamerProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  103,
                  97,
                  109,
                  101,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "undeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  97,
                  100,
                  95,
                  119,
                  111,
                  114,
                  108,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "worldId"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "chapterNumber",
          "type": "u16"
        },
        {
          "name": "worldId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "submitQuiz",
      "discriminator": [
        48,
        92,
        172,
        142,
        251,
        196,
        14,
        217
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "gamerProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  103,
                  97,
                  109,
                  101,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "undeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  97,
                  100,
                  95,
                  119,
                  111,
                  114,
                  108,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "worldId"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "score",
          "type": "u8"
        },
        {
          "name": "worldId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "updatePosition",
      "discriminator": [
        102,
        75,
        42,
        126,
        57,
        196,
        156,
        9
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "player"
        },
        {
          "name": "gamerProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  115,
                  101,
                  114,
                  95,
                  103,
                  97,
                  109,
                  101,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "position",
          "type": "u32"
        }
      ]
    },
    {
      "name": "worldToRollup",
      "discriminator": [
        231,
        38,
        19,
        16,
        58,
        184,
        163,
        254
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bufferUndeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  117,
                  102,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "undeadWorld"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                13,
                133,
                203,
                158,
                235,
                255,
                216,
                98,
                129,
                46,
                208,
                120,
                135,
                122,
                235,
                210,
                78,
                45,
                190,
                79,
                244,
                162,
                97,
                67,
                196,
                78,
                248,
                142,
                196,
                36,
                151,
                18
              ]
            }
          }
        },
        {
          "name": "delegationRecordUndeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "undeadWorld"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataUndeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "undeadWorld"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "undeadWorld",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  117,
                  110,
                  100,
                  101,
                  97,
                  100,
                  95,
                  119,
                  111,
                  114,
                  108,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "worldId"
              }
            ]
          }
        },
        {
          "name": "ownerProgram",
          "address": "undWHawzrspG9R65bd6V2UxbEw8REc8yWtx4DQ6F3e9"
        },
        {
          "name": "delegationProgram",
          "address": "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "worldId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "gameConfig",
      "discriminator": [
        45,
        146,
        146,
        33,
        170,
        69,
        96,
        133
      ]
    },
    {
      "name": "gamerProfile",
      "discriminator": [
        218,
        7,
        59,
        46,
        92,
        222,
        255,
        90
      ]
    },
    {
      "name": "undeadWarrior",
      "discriminator": [
        221,
        104,
        254,
        146,
        1,
        24,
        0,
        118
      ]
    },
    {
      "name": "undeadWorld",
      "discriminator": [
        191,
        142,
        246,
        191,
        159,
        85,
        192,
        18
      ]
    },
    {
      "name": "userProfile",
      "discriminator": [
        32,
        37,
        119,
        205,
        179,
        180,
        13,
        194
      ]
    },
    {
      "name": "usernameRegistry",
      "discriminator": [
        145,
        217,
        207,
        126,
        35,
        114,
        138,
        18
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidWarriorState",
      "msg": "Warrior is not in the correct state for this action"
    },
    {
      "code": 6001,
      "name": "notWarriorOwner",
      "msg": "Only the warrior owner can perform this action"
    },
    {
      "code": 6002,
      "name": "warriorNameTooLong",
      "msg": "Warrior name exceeds maximum length"
    },
    {
      "code": 6003,
      "name": "warriorAlreadyInBattle",
      "msg": "Warrior is already in a battle"
    },
    {
      "code": 6004,
      "name": "warriorAlreadyExists",
      "msg": "Warrior Name already exists"
    },
    {
      "code": 6005,
      "name": "warriorOnCooldown",
      "msg": "Warrior On Cooldown"
    },
    {
      "code": 6006,
      "name": "invalidBattleState",
      "msg": "Battle room is not in the correct state for this action"
    },
    {
      "code": 6007,
      "name": "battleRoomFull",
      "msg": "Battle room already has two players"
    },
    {
      "code": 6008,
      "name": "notBattleParticipant",
      "msg": "Only battle participants can perform this action"
    },
    {
      "code": 6009,
      "name": "playerNotReady",
      "msg": "Player has not marked themselves as ready"
    },
    {
      "code": 6010,
      "name": "battleAlreadySettled",
      "msg": "Battle results have already been settled"
    },
    {
      "code": 6011,
      "name": "invalidRoomId",
      "msg": "Room ID is invalid or too long"
    },
    {
      "code": 6012,
      "name": "vrfRequestPending",
      "msg": "VRF request is still pending"
    },
    {
      "code": 6013,
      "name": "invalidVrfResult",
      "msg": "Invalid VRF result received"
    },
    {
      "code": 6014,
      "name": "vrfRequestNotFound",
      "msg": "VRF request not found or expired"
    },
    {
      "code": 6015,
      "name": "notAuthorized",
      "msg": "Not authorized to perform this action"
    },
    {
      "code": 6016,
      "name": "invalidSettlementAuthority",
      "msg": "Invalid settlement authority"
    },
    {
      "code": 6017,
      "name": "insufficientFunds",
      "msg": "Insufficient funds for this operation"
    },
    {
      "code": 6018,
      "name": "invalidConceptSelection",
      "msg": "Invalid concept selection"
    },
    {
      "code": 6019,
      "name": "gameNotInitialized",
      "msg": "Game state has not been initialized"
    },
    {
      "code": 6020,
      "name": "invalidErSessionId",
      "msg": "Invalid ephemeral rollup session ID"
    },
    {
      "code": 6021,
      "name": "playerNotInRoom",
      "msg": "Player not in room"
    },
    {
      "code": 6022,
      "name": "alreadyReady",
      "msg": "Player is ready"
    },
    {
      "code": 6023,
      "name": "invalidWarrior",
      "msg": "Invalid Warrior"
    },
    {
      "code": 6024,
      "name": "sameWarriorCannotBattle",
      "msg": "Same Warrior cannot Battle"
    },
    {
      "code": 6025,
      "name": "warriorDefeated",
      "msg": "Warrior defeated"
    },
    {
      "code": 6026,
      "name": "alreadyAnswered",
      "msg": "Player has already answered this question"
    },
    {
      "code": 6027,
      "name": "allQuestionsAnswered",
      "msg": "All Questions answered"
    },
    {
      "code": 6028,
      "name": "nameTooLong",
      "msg": "Name is too long, consider reducing it"
    },
    {
      "code": 6029,
      "name": "nameEmpty",
      "msg": "Invalid, please input name"
    },
    {
      "code": 6030,
      "name": "cannotAttackSelf",
      "msg": "Warrior cannot attack itself"
    },
    {
      "code": 6031,
      "name": "invalidQuestionIndex",
      "msg": "Invalid Question Index"
    },
    {
      "code": 6032,
      "name": "onlyCreatorCanCancel",
      "msg": "Only the room creator can cancel the battle"
    },
    {
      "code": 6033,
      "name": "battleAlreadyStarted",
      "msg": "Battle has already started and cannot be cancelled"
    },
    {
      "code": 6034,
      "name": "battleAlreadyCompleted",
      "msg": "Battle has already been completed"
    },
    {
      "code": 6035,
      "name": "battleAlreadyCancelled",
      "msg": "Battle room has already been cancelled"
    },
    {
      "code": 6036,
      "name": "cannotCancelAtThisStage",
      "msg": "Cannot cancel battle at this stage"
    },
    {
      "code": 6037,
      "name": "cannotUndelegate",
      "msg": "Game not ready for Undelegation"
    },
    {
      "code": 6038,
      "name": "invalidImageIndex",
      "msg": "Invalid image index for the selected rarity"
    },
    {
      "code": 6039,
      "name": "invalidClassRarity",
      "msg": "Invalid warrior class and rarity combination"
    },
    {
      "code": 6040,
      "name": "imageGenerationFailed",
      "msg": "Image generation failed"
    },
    {
      "code": 6041,
      "name": "invalidScore",
      "msg": "Invalid Score"
    },
    {
      "code": 6042,
      "name": "usernameAlreadyChoosen",
      "msg": "Username already choosen"
    }
  ],
  "types": [
    {
      "name": "achievementLevel",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "bronze"
          },
          {
            "name": "silver"
          },
          {
            "name": "gold"
          },
          {
            "name": "platinum"
          },
          {
            "name": "diamond"
          }
        ]
      }
    },
    {
      "name": "gameConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "releasedChapters",
            "type": "u8"
          },
          {
            "name": "totalWarriors",
            "type": "u32"
          },
          {
            "name": "bossBattlesEnabled",
            "type": "bool"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "gamerProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "characterClass",
            "type": {
              "defined": {
                "name": "warriorClass"
              }
            }
          },
          {
            "name": "currentChapter",
            "type": "u16"
          },
          {
            "name": "chaptersCompleted",
            "type": "u16"
          },
          {
            "name": "currentPosition",
            "type": "u32"
          },
          {
            "name": "totalBattlesWon",
            "type": "u64"
          },
          {
            "name": "totalBattlesLost",
            "type": "u64"
          },
          {
            "name": "totalBattlesFought",
            "type": "u64"
          },
          {
            "name": "quizzesTaken",
            "type": "u16"
          },
          {
            "name": "totalQuizScore",
            "type": "u32"
          },
          {
            "name": "undeadScore",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "createdAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "imageRarity",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "common"
          },
          {
            "name": "uncommon"
          },
          {
            "name": "rare"
          }
        ]
      }
    },
    {
      "name": "undeadWarrior",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "address",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "dna",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "baseAttack",
            "type": "u16"
          },
          {
            "name": "baseDefense",
            "type": "u16"
          },
          {
            "name": "baseKnowledge",
            "type": "u16"
          },
          {
            "name": "currentHp",
            "type": "u16"
          },
          {
            "name": "maxHp",
            "type": "u16"
          },
          {
            "name": "warriorClass",
            "type": {
              "defined": {
                "name": "warriorClass"
              }
            }
          },
          {
            "name": "battlesWon",
            "type": "u32"
          },
          {
            "name": "battlesLost",
            "type": "u32"
          },
          {
            "name": "experiencePoints",
            "type": "u64"
          },
          {
            "name": "level",
            "type": "u16"
          },
          {
            "name": "lastBattleAt",
            "type": "i64"
          },
          {
            "name": "cooldownExpiresAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "imageRarity",
            "type": {
              "defined": {
                "name": "imageRarity"
              }
            }
          },
          {
            "name": "imageIndex",
            "type": "u8"
          },
          {
            "name": "imageUri",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "undeadWorld",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "worldId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "activePlayers",
            "type": "u16"
          },
          {
            "name": "totalPlayers",
            "type": "u32"
          },
          {
            "name": "totalCompletions",
            "type": "u32"
          },
          {
            "name": "highestUndeadScoreAverage",
            "type": "u32"
          },
          {
            "name": "topCommander",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "userPersona",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "treasureHunter"
          },
          {
            "name": "boneSmith"
          },
          {
            "name": "obsidianProphet"
          },
          {
            "name": "graveBaron"
          },
          {
            "name": "demeter"
          },
          {
            "name": "collector"
          },
          {
            "name": "covenCaller"
          },
          {
            "name": "seerOfAsh"
          },
          {
            "name": "cerberus"
          }
        ]
      }
    },
    {
      "name": "userProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "username",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "userPersona",
            "type": {
              "option": {
                "defined": {
                  "name": "userPersona"
                }
              }
            }
          },
          {
            "name": "warriors",
            "type": "u32"
          },
          {
            "name": "achievementLevel",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "joinDate",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "usernameRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "warriorClass",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "validator"
          },
          {
            "name": "oracle"
          },
          {
            "name": "guardian"
          },
          {
            "name": "daemon"
          }
        ]
      }
    }
  ]
};
