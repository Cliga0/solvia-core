// TODO: Re-enable GraphQL enum registration when Solvia adds GraphQL support.
// import { registerEnumType } from '@nestjs/graphql';

export enum SupportDriver {
  NONE = 'NONE',
  FRONT = 'FRONT',
}

// TODO: Re-enable when GraphQL is available.
// registerEnumType(SupportDriver, {
//   name: 'SupportDriver',
// });
