/**
 * Placeholder for Apollo GraphQL error classes.
 * Apollo Server v5 removed ApolloError from its exports.
 * TODO: Replace with Solvia's own GraphQL error utilities.
 */
export class GraphQLError extends Error {
  readonly code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class NotFoundError extends GraphQLError {
  constructor(message: string) {
    super(message, 'NOT_FOUND');
  }
}

export class ForbiddenError extends GraphQLError {
  constructor(message: string) {
    super(message, 'FORBIDDEN');
  }
}

export class UserInputError extends GraphQLError {
  constructor(message: string) {
    super(message, 'BAD_USER_INPUT');
  }
}
