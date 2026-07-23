import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from '../placeholders/twenty-shared-utils';

import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from '../placeholders/graphql-errors.util';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from '../twenty-config.exception';

@Catch(ConfigVariableException)
export class ConfigVariableGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: ConfigVariableException) {
    switch (exception.code) {
      case ConfigVariableExceptionCode.VARIABLE_NOT_FOUND:
        throw new NotFoundError(exception.message);
      case ConfigVariableExceptionCode.ENVIRONMENT_ONLY_VARIABLE:
        throw new ForbiddenError(exception.message);
      case ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED:
      case ConfigVariableExceptionCode.VALIDATION_FAILED:
        throw new UserInputError(exception.message);
      case ConfigVariableExceptionCode.INTERNAL_ERROR:
      case ConfigVariableExceptionCode.UNSUPPORTED_CONFIG_TYPE:
        throw exception;
      default: {
        assertUnreachable(exception.code);
      }
    }
  }
}
