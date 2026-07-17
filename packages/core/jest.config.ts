import type { Config } from "jest";


const config: Config = {

  /**
   * Environnement Node.js
   *
   * Le Kernel est une infrastructure backend.
   */
  testEnvironment: "node",


  /**
   * Support TypeScript.
   *
   * Utilise ts-jest pour compiler les tests.
   */
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.json",
      },
    ],
  },


  /**
   * Racine des tests.
   */
  rootDir: ".",


  /**
   * Où chercher les fichiers tests.
   */
  testMatch: [
    "<rootDir>/src/**/*.spec.ts",
    "<rootDir>/src/**/*.test.ts",
  ],


  /**
   * Extensions supportées.
   */
  moduleFileExtensions: [
    "ts",
    "js",
    "json",
  ],


  /**
   * Alias TypeScript.
   *
   * Supporte les imports :
   *
   * import { X } from "src/..."
   */
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },


  /**
   * Nettoyage automatique des mocks.
   */
  clearMocks: true,


  /**
   * Restaurer les implémentations originales.
   */
  restoreMocks: true,


  /**
   * Rapport détaillé.
   */
  verbose: true,


  /**
   * Couverture future.
   */
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.module.ts",
    "!src/**/*.dto.ts",
  ],


  /**
   * Sortie couverture.
   */
  coverageDirectory:
    "<rootDir>/coverage",

};


export default config;