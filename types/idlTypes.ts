/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/rust_undead.json`.
 */
export type RustUndead = {
  "address": "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9",
  "metadata": {
    "name": "rustUndead",
    "version": "0.1.0",
    "spec": "0.1.0"
  },
  "instructions": [
    {
      "name": "answerQuestion",
      "discriminator": [
        86,
        3,
        30,
        143,
        53,
        98,
        98,
        243
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
          "name": "authority"
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "attackerWarrior",
          "writable": true
        },
        {
          "name": "defenderWarrior",
          "writable": true
        },
        {
          "name": "gamingProfileA",
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
                "path": "battle_room.player_a",
                "account": "battleRoom"
              }
            ]
          }
        },
        {
          "name": "gamingProfileB",
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
                "path": "battle_room.player_b",
                "account": "battleRoom"
              }
            ]
          }
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
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "answer",
          "type": "bool"
        },
        {
          "name": "clientSeed",
          "type": "u8"
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
            "This check ensure that the vrf_program_identity (which is a PDA) is a singer",
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
      "name": "cancelBattle",
      "discriminator": [
        234,
        61,
        97,
        187,
        97,
        170,
        101,
        141
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
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true,
          "optional": true
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
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
      "name": "cancelEmptyBattleRoom",
      "docs": [
        "END - C"
      ],
      "discriminator": [
        12,
        106,
        206,
        38,
        255,
        165,
        78,
        227
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
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true,
          "optional": true
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
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
      "name": "createBattleRoom",
      "discriminator": [
        58,
        179,
        128,
        246,
        115,
        154,
        79,
        95
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerA"
        },
        {
          "name": "warriorA",
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
                "path": "playerA"
              },
              {
                "kind": "arg",
                "path": "warriorName"
              }
            ]
          }
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "warriorName",
          "type": "string"
        },
        {
          "name": "selectedConcepts",
          "type": {
            "array": [
              "u8",
              5
            ]
          }
        },
        {
          "name": "selectedTopics",
          "type": {
            "array": [
              "u8",
              10
            ]
          }
        },
        {
          "name": "selectedQuestions",
          "type": {
            "array": [
              "u16",
              10
            ]
          }
        },
        {
          "name": "correctAnswers",
          "type": {
            "array": [
              "bool",
              10
            ]
          }
        }
      ]
    },
    {
      "name": "createGamingProfile",
      "discriminator": [
        69,
        179,
        111,
        6,
        12,
        163,
        252,
        21
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
                "kind": "account",
                "path": "player"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
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
          "docs": [
            "CHECK : The authority for the program"
          ]
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
          "name": "userAchievements",
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
                  97,
                  99,
                  104,
                  105,
                  101,
                  118,
                  101,
                  109,
                  101,
                  110,
                  116,
                  115
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
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "oracleQueue",
          "writable": true,
          "address": "Cuj97ggrhhidhbu39TijNVqE74xvKJ69gDervRUXAxGh"
        },
        {
          "name": "sessionToken",
          "optional": true
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
        }
      ]
    },
    {
      "name": "delegateBattle",
      "discriminator": [
        62,
        10,
        250,
        88,
        180,
        36,
        120,
        74
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "bufferBattleRoom",
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
                "path": "battleRoom"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                245,
                190,
                196,
                139,
                139,
                242,
                108,
                210,
                220,
                88,
                130,
                229,
                184,
                231,
                250,
                1,
                157,
                78,
                89,
                231,
                158,
                30,
                223,
                126,
                135,
                194,
                102,
                70,
                164,
                217,
                168,
                186
              ]
            }
          }
        },
        {
          "name": "delegationRecordBattleRoom",
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
                "path": "battleRoom"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataBattleRoom",
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
                "path": "battleRoom"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "bufferWarriorA",
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
                "path": "warriorA"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                245,
                190,
                196,
                139,
                139,
                242,
                108,
                210,
                220,
                88,
                130,
                229,
                184,
                231,
                250,
                1,
                157,
                78,
                89,
                231,
                158,
                30,
                223,
                126,
                135,
                194,
                102,
                70,
                164,
                217,
                168,
                186
              ]
            }
          }
        },
        {
          "name": "delegationRecordWarriorA",
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
                "path": "warriorA"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataWarriorA",
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
                "path": "warriorA"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "warriorA",
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
                "kind": "arg",
                "path": "playerA"
              },
              {
                "kind": "arg",
                "path": "warriorAName"
              }
            ]
          }
        },
        {
          "name": "bufferWarriorB",
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
                "path": "warriorB"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                245,
                190,
                196,
                139,
                139,
                242,
                108,
                210,
                220,
                88,
                130,
                229,
                184,
                231,
                250,
                1,
                157,
                78,
                89,
                231,
                158,
                30,
                223,
                126,
                135,
                194,
                102,
                70,
                164,
                217,
                168,
                186
              ]
            }
          }
        },
        {
          "name": "delegationRecordWarriorB",
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
                "path": "warriorB"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataWarriorB",
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
                "path": "warriorB"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "warriorB",
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
                "kind": "arg",
                "path": "playerB"
              },
              {
                "kind": "arg",
                "path": "warriorBName"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "ownerProgram",
          "address": "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9"
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
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "playerA",
          "type": "pubkey"
        },
        {
          "name": "warriorAName",
          "type": "string"
        },
        {
          "name": "playerB",
          "type": "pubkey"
        },
        {
          "name": "warriorBName",
          "type": "string"
        }
      ]
    },
    {
      "name": "delegateConfigs",
      "discriminator": [
        212,
        8,
        221,
        38,
        9,
        114,
        246,
        227
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "bufferGameConfig",
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
                "path": "gameConfig"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                245,
                190,
                196,
                139,
                139,
                242,
                108,
                210,
                220,
                88,
                130,
                229,
                184,
                231,
                250,
                1,
                157,
                78,
                89,
                231,
                158,
                30,
                223,
                126,
                135,
                194,
                102,
                70,
                164,
                217,
                168,
                186
              ]
            }
          }
        },
        {
          "name": "delegationRecordGameConfig",
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
                "path": "gameConfig"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
        },
        {
          "name": "delegationMetadataGameConfig",
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
                "path": "gameConfig"
              }
            ],
            "program": {
              "kind": "account",
              "path": "delegationProgram"
            }
          }
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
          "name": "ownerProgram",
          "address": "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9"
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
      "args": []
    },
    {
      "name": "delegateGamingProfile",
      "discriminator": [
        87,
        140,
        131,
        216,
        242,
        35,
        9,
        173
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
                245,
                190,
                196,
                139,
                139,
                242,
                108,
                210,
                220,
                88,
                130,
                229,
                184,
                231,
                250,
                1,
                157,
                78,
                89,
                231,
                158,
                30,
                223,
                126,
                135,
                194,
                102,
                70,
                164,
                217,
                168,
                186
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
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "ownerProgram",
          "address": "HYHburusRpKcHxcMrrE2oh9DgysGpfpJTeDMDHuTf4Q9"
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
      "name": "emergencyCancelBattle",
      "discriminator": [
        11,
        10,
        74,
        199,
        28,
        62,
        29,
        164
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "roomId",
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
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
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
          "name": "cooldownTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeConfig",
      "discriminator": [
        208,
        127,
        21,
        1,
        194,
        190,
        196,
        70
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
          "name": "cooldownTime",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinBattleRoom",
      "discriminator": [
        96,
        155,
        69,
        190,
        105,
        208,
        17,
        32
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "playerB"
        },
        {
          "name": "warriorB",
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
                "path": "playerB"
              },
              {
                "kind": "arg",
                "path": "warriorName"
              }
            ]
          }
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "warriorName",
          "type": "string"
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
      "name": "settleBattleRoom",
      "discriminator": [
        254,
        23,
        210,
        244,
        99,
        15,
        11,
        61
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
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
      "name": "signalReady",
      "discriminator": [
        96,
        49,
        44,
        123,
        65,
        227,
        168,
        32
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
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
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
                "path": "warriorName"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
        }
      ],
      "args": [
        {
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "warriorName",
          "type": "string"
        }
      ]
    },
    {
      "name": "startBattle",
      "discriminator": [
        87,
        12,
        31,
        196,
        33,
        191,
        140,
        147
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
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
      "name": "undelegateBattleRoom",
      "discriminator": [
        221,
        93,
        230,
        24,
        192,
        98,
        219,
        26
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
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
      "name": "undelegateConfig",
      "discriminator": [
        161,
        116,
        28,
        44,
        36,
        95,
        134,
        227
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "config",
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
          "name": "magicProgram",
          "address": "Magic11111111111111111111111111111111111111"
        },
        {
          "name": "magicContext",
          "writable": true,
          "address": "MagicContext1111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "undelegatePlayera",
      "discriminator": [
        42,
        173,
        179,
        147,
        6,
        115,
        171,
        255
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "warriorA",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
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
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "warrior",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "undelegatePlayerb",
      "discriminator": [
        148,
        90,
        122,
        244,
        186,
        104,
        103,
        38
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "warriorB",
          "writable": true
        },
        {
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "warrior",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "undelegateRoom",
      "discriminator": [
        151,
        179,
        196,
        11,
        39,
        232,
        174,
        131
      ],
      "accounts": [
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "battleRoom",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  97,
                  116,
                  116,
                  108,
                  101,
                  114,
                  111,
                  111,
                  109
                ]
              },
              {
                "kind": "arg",
                "path": "roomId"
              }
            ]
          }
        },
        {
          "name": "sessionToken",
          "optional": true
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
          "name": "roomId",
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
      "name": "updateConfigConfig",
      "discriminator": [
        147,
        239,
        244,
        100,
        47,
        86,
        122,
        237
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
          "name": "cooldownTime",
          "type": {
            "option": "u64"
          }
        },
        {
          "name": "isPaused",
          "type": {
            "option": "bool"
          }
        }
      ]
    },
    {
      "name": "userdata",
      "discriminator": [
        121,
        136,
        149,
        135,
        219,
        62,
        236,
        55
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
          "name": "sessionToken",
          "optional": true
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
    }
  ],
  "accounts": [
    {
      "name": "battleRoom",
      "discriminator": [
        51,
        147,
        104,
        79,
        145,
        40,
        116,
        24
      ]
    },
    {
      "name": "config",
      "discriminator": [
        155,
        12,
        170,
        224,
        30,
        250,
        204,
        130
      ]
    },
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
      "name": "sessionToken",
      "discriminator": [
        233,
        4,
        115,
        14,
        46,
        21,
        1,
        15
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
      "name": "userAchievements",
      "discriminator": [
        113,
        223,
        157,
        75,
        204,
        112,
        2,
        207
      ]
    },
    {
      "name": "userGameProfile",
      "discriminator": [
        65,
        42,
        210,
        40,
        27,
        139,
        161,
        116
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
  "events": [
    {
      "name": "answerRevealEvent",
      "discriminator": [
        194,
        106,
        90,
        39,
        229,
        24,
        213,
        220
      ]
    },
    {
      "name": "answerSubmitEvent",
      "discriminator": [
        112,
        62,
        131,
        18,
        108,
        22,
        170,
        58
      ]
    },
    {
      "name": "battleRoomCancelled",
      "discriminator": [
        253,
        107,
        52,
        241,
        55,
        118,
        228,
        233
      ]
    },
    {
      "name": "battleRoomLive",
      "discriminator": [
        38,
        248,
        4,
        91,
        201,
        225,
        175,
        196
      ]
    },
    {
      "name": "battleStart",
      "discriminator": [
        61,
        214,
        130,
        6,
        226,
        77,
        1,
        51
      ]
    },
    {
      "name": "damageEvent",
      "discriminator": [
        27,
        55,
        72,
        242,
        73,
        220,
        218,
        66
      ]
    },
    {
      "name": "delegationEvent",
      "discriminator": [
        218,
        157,
        197,
        166,
        52,
        67,
        225,
        105
      ]
    },
    {
      "name": "eliminationEvent",
      "discriminator": [
        90,
        240,
        50,
        219,
        116,
        36,
        205,
        148
      ]
    },
    {
      "name": "joinEvent",
      "discriminator": [
        196,
        227,
        34,
        26,
        185,
        22,
        16,
        156
      ]
    },
    {
      "name": "next",
      "discriminator": [
        234,
        241,
        165,
        224,
        176,
        61,
        109,
        149
      ]
    },
    {
      "name": "readyEvent",
      "discriminator": [
        37,
        246,
        161,
        191,
        213,
        126,
        251,
        170
      ]
    },
    {
      "name": "scoresEvent",
      "discriminator": [
        134,
        11,
        93,
        88,
        249,
        64,
        112,
        112
      ]
    },
    {
      "name": "wariorCreatedEvent",
      "discriminator": [
        54,
        173,
        88,
        168,
        77,
        9,
        50,
        182
      ]
    },
    {
      "name": "warriorReleased",
      "discriminator": [
        27,
        229,
        135,
        57,
        126,
        221,
        46,
        165
      ]
    },
    {
      "name": "warriorStatusEvent",
      "discriminator": [
        140,
        121,
        105,
        46,
        10,
        2,
        185,
        188
      ]
    },
    {
      "name": "winnerEvent",
      "discriminator": [
        80,
        230,
        123,
        48,
        43,
        207,
        255,
        183
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
      "name": "answerRevealEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "isCorrect",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "answerSubmitEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "currentQuestionIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "battleRoom",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roomId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "playerA",
            "type": "pubkey"
          },
          {
            "name": "playerB",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "warriorA",
            "type": "pubkey"
          },
          {
            "name": "warriorB",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "selectedConcepts",
            "type": {
              "array": [
                "u8",
                5
              ]
            }
          },
          {
            "name": "selectedTopics",
            "type": {
              "array": [
                "u8",
                10
              ]
            }
          },
          {
            "name": "selectedQuestions",
            "type": {
              "array": [
                "u16",
                10
              ]
            }
          },
          {
            "name": "correctAnswers",
            "type": {
              "array": [
                "bool",
                10
              ]
            }
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "battleState"
              }
            }
          },
          {
            "name": "playerAReady",
            "type": "bool"
          },
          {
            "name": "playerBReady",
            "type": "bool"
          },
          {
            "name": "currentQuestion",
            "type": "u8"
          },
          {
            "name": "playerAAnswers",
            "type": {
              "array": [
                {
                  "option": "bool"
                },
                10
              ]
            }
          },
          {
            "name": "playerBAnswers",
            "type": {
              "array": [
                {
                  "option": "bool"
                },
                10
              ]
            }
          },
          {
            "name": "playerACorrect",
            "type": "u8"
          },
          {
            "name": "playerBCorrect",
            "type": "u8"
          },
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "battleDuration",
            "type": "u32"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "battleStartTime",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleRoomCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roomId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "cancellationStage",
            "type": {
              "defined": {
                "name": "cancellationStage"
              }
            }
          },
          {
            "name": "affectedPlayers",
            "type": "u8"
          },
          {
            "name": "roomAge",
            "type": "u32"
          },
          {
            "name": "warriorA",
            "type": "pubkey"
          },
          {
            "name": "warriorB",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleRoomLive",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "roomId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "battleStart",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warriorA",
            "type": "string"
          },
          {
            "name": "warriorB",
            "type": "string"
          },
          {
            "name": "aHp",
            "type": "u16"
          },
          {
            "name": "bHp",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "battleState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "created"
          },
          {
            "name": "joined"
          },
          {
            "name": "questionsSelected"
          },
          {
            "name": "readyForDelegation"
          },
          {
            "name": "inProgress"
          },
          {
            "name": "completed"
          },
          {
            "name": "cancelled"
          }
        ]
      }
    },
    {
      "name": "cancellationStage",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "noOpponent"
          },
          {
            "name": "opponentJoined"
          },
          {
            "name": "preDelegation"
          }
        ]
      }
    },
    {
      "name": "config",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "totalWarriors",
            "type": "u64"
          },
          {
            "name": "cooldownTime",
            "type": "u64"
          },
          {
            "name": "totalBattles",
            "type": "u32"
          },
          {
            "name": "isPaused",
            "type": "bool"
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
      "name": "damageEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warriorName",
            "type": "string"
          },
          {
            "name": "damage",
            "type": "u16"
          },
          {
            "name": "hp",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "delegationEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "delegated",
            "type": "bool"
          },
          {
            "name": "warriorA",
            "type": "pubkey"
          },
          {
            "name": "warriorB",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "eliminationEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warriorName",
            "type": "string"
          },
          {
            "name": "hp",
            "type": "u16"
          },
          {
            "name": "eliminated",
            "type": "bool"
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
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "cooldownTime",
            "type": "u64"
          },
          {
            "name": "totalBattles",
            "type": "u32"
          },
          {
            "name": "isPaused",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "topPlayers",
            "type": {
              "array": [
                "pubkey",
                15
              ]
            }
          },
          {
            "name": "topScores",
            "type": {
              "array": [
                "u64",
                15
              ]
            }
          },
          {
            "name": "lastUpdated",
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
      "name": "joinEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "joined",
            "type": "bool"
          },
          {
            "name": "playerB",
            "type": "pubkey"
          },
          {
            "name": "warriorName",
            "type": "string"
          },
          {
            "name": "warrior",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "next",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "index",
            "type": "u8"
          },
          {
            "name": "isCompleted",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "readyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "player",
            "type": "pubkey"
          },
          {
            "name": "warriorName",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "scoresEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerA",
            "type": "u8"
          },
          {
            "name": "playerB",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "sessionToken",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "targetProgram",
            "type": "pubkey"
          },
          {
            "name": "sessionSigner",
            "type": "pubkey"
          },
          {
            "name": "validUntil",
            "type": "i64"
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
      "name": "userAchievements",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "overallAchievements",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "warriorAchivement",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "winnerAchievement",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "battleAchievement",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "firstWarriorDate",
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
      "name": "userGameProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
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
            "name": "totalPoints",
            "type": "u64"
          },
          {
            "name": "overallAchievements",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "winnerAchievement",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
          },
          {
            "name": "battleAchievement",
            "type": {
              "defined": {
                "name": "achievementLevel"
              }
            }
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
            "name": "warriorsCreated",
            "type": "u32"
          },
          {
            "name": "totalBattlesWon",
            "type": "u32"
          },
          {
            "name": "totalBattlesLost",
            "type": "u32"
          },
          {
            "name": "totalBattlesFought",
            "type": "u32"
          },
          {
            "name": "joinDate",
            "type": "i64"
          },
          {
            "name": "totalPoints",
            "type": "u64"
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
      "name": "wariorCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "name",
            "type": "string"
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
            "name": "attack",
            "type": "u16"
          },
          {
            "name": "defense",
            "type": "u16"
          },
          {
            "name": "knowledge",
            "type": "u16"
          },
          {
            "name": "imageUrl",
            "type": "string"
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
            "name": "currentHp",
            "type": "u16"
          },
          {
            "name": "maxHp",
            "type": "u16"
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
    },
    {
      "name": "warriorReleased",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warrior",
            "type": "pubkey"
          },
          {
            "name": "warriorName",
            "type": "string"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "roomId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "warriorStatusEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "warriorName",
            "type": "string"
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
            "name": "remainingCooldownTime",
            "type": "i64"
          },
          {
            "name": "warriorReady",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "winnerEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "winner",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "score",
            "type": {
              "option": "u8"
            }
          },
          {
            "name": "hp",
            "type": {
              "option": "u16"
            }
          },
          {
            "name": "tie",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
