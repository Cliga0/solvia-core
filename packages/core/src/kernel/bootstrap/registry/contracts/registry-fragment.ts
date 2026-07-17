import type { ImportType } from "../../types/import.type";
import type { ProviderType } from "../../types/provider.type";
import type { ExportType } from "../../types/export.type";
import type { MiddlewareType } from "../../types/middleware.type";
import type { GuardType } from "../../types/guard.type";
import type { InterceptorType } from "../../types/interceptor.type";
import type { FilterType } from "../../types/filter.type";

export interface RegistryFragment {

  readonly imports?: readonly ImportType[];

  readonly providers?: readonly ProviderType[];

  readonly exports?: readonly ExportType[];

  readonly middlewares?: readonly MiddlewareType[];

  readonly guards?: readonly GuardType[];

  readonly interceptors?: readonly InterceptorType[];

  readonly filters?: readonly FilterType[];

}