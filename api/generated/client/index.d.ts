
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ApiBooking
 * 
 */
export type ApiBooking = $Result.DefaultSelection<Prisma.$ApiBookingPayload>
/**
 * Model ApiPaymentAction
 * 
 */
export type ApiPaymentAction = $Result.DefaultSelection<Prisma.$ApiPaymentActionPayload>
/**
 * Model ApiWorkflowTrigger
 * 
 */
export type ApiWorkflowTrigger = $Result.DefaultSelection<Prisma.$ApiWorkflowTriggerPayload>
/**
 * Model ApiBookingDocument
 * 
 */
export type ApiBookingDocument = $Result.DefaultSelection<Prisma.$ApiBookingDocumentPayload>
/**
 * Model ApiBusinessMetrics
 * 
 */
export type ApiBusinessMetrics = $Result.DefaultSelection<Prisma.$ApiBusinessMetricsPayload>
/**
 * Model ApiRequestLog
 * 
 */
export type ApiRequestLog = $Result.DefaultSelection<Prisma.$ApiRequestLogPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ApiBookings
 * const apiBookings = await prisma.apiBooking.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ApiBookings
   * const apiBookings = await prisma.apiBooking.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.apiBooking`: Exposes CRUD operations for the **ApiBooking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiBookings
    * const apiBookings = await prisma.apiBooking.findMany()
    * ```
    */
  get apiBooking(): Prisma.ApiBookingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apiPaymentAction`: Exposes CRUD operations for the **ApiPaymentAction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiPaymentActions
    * const apiPaymentActions = await prisma.apiPaymentAction.findMany()
    * ```
    */
  get apiPaymentAction(): Prisma.ApiPaymentActionDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apiWorkflowTrigger`: Exposes CRUD operations for the **ApiWorkflowTrigger** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiWorkflowTriggers
    * const apiWorkflowTriggers = await prisma.apiWorkflowTrigger.findMany()
    * ```
    */
  get apiWorkflowTrigger(): Prisma.ApiWorkflowTriggerDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apiBookingDocument`: Exposes CRUD operations for the **ApiBookingDocument** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiBookingDocuments
    * const apiBookingDocuments = await prisma.apiBookingDocument.findMany()
    * ```
    */
  get apiBookingDocument(): Prisma.ApiBookingDocumentDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apiBusinessMetrics`: Exposes CRUD operations for the **ApiBusinessMetrics** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiBusinessMetrics
    * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findMany()
    * ```
    */
  get apiBusinessMetrics(): Prisma.ApiBusinessMetricsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.apiRequestLog`: Exposes CRUD operations for the **ApiRequestLog** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ApiRequestLogs
    * const apiRequestLogs = await prisma.apiRequestLog.findMany()
    * ```
    */
  get apiRequestLog(): Prisma.ApiRequestLogDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.8.2
   * Query Engine version: 2060c79ba17c6bb9f5823312b6f6b7f4a845738e
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ApiBooking: 'ApiBooking',
    ApiPaymentAction: 'ApiPaymentAction',
    ApiWorkflowTrigger: 'ApiWorkflowTrigger',
    ApiBookingDocument: 'ApiBookingDocument',
    ApiBusinessMetrics: 'ApiBusinessMetrics',
    ApiRequestLog: 'ApiRequestLog'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "apiBooking" | "apiPaymentAction" | "apiWorkflowTrigger" | "apiBookingDocument" | "apiBusinessMetrics" | "apiRequestLog"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ApiBooking: {
        payload: Prisma.$ApiBookingPayload<ExtArgs>
        fields: Prisma.ApiBookingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiBookingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiBookingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          findFirst: {
            args: Prisma.ApiBookingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiBookingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          findMany: {
            args: Prisma.ApiBookingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>[]
          }
          create: {
            args: Prisma.ApiBookingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          createMany: {
            args: Prisma.ApiBookingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiBookingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>[]
          }
          delete: {
            args: Prisma.ApiBookingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          update: {
            args: Prisma.ApiBookingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          deleteMany: {
            args: Prisma.ApiBookingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiBookingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiBookingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>[]
          }
          upsert: {
            args: Prisma.ApiBookingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingPayload>
          }
          aggregate: {
            args: Prisma.ApiBookingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiBooking>
          }
          groupBy: {
            args: Prisma.ApiBookingGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiBookingGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiBookingCountArgs<ExtArgs>
            result: $Utils.Optional<ApiBookingCountAggregateOutputType> | number
          }
        }
      }
      ApiPaymentAction: {
        payload: Prisma.$ApiPaymentActionPayload<ExtArgs>
        fields: Prisma.ApiPaymentActionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiPaymentActionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiPaymentActionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          findFirst: {
            args: Prisma.ApiPaymentActionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiPaymentActionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          findMany: {
            args: Prisma.ApiPaymentActionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>[]
          }
          create: {
            args: Prisma.ApiPaymentActionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          createMany: {
            args: Prisma.ApiPaymentActionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiPaymentActionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>[]
          }
          delete: {
            args: Prisma.ApiPaymentActionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          update: {
            args: Prisma.ApiPaymentActionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          deleteMany: {
            args: Prisma.ApiPaymentActionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiPaymentActionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiPaymentActionUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>[]
          }
          upsert: {
            args: Prisma.ApiPaymentActionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiPaymentActionPayload>
          }
          aggregate: {
            args: Prisma.ApiPaymentActionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiPaymentAction>
          }
          groupBy: {
            args: Prisma.ApiPaymentActionGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiPaymentActionGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiPaymentActionCountArgs<ExtArgs>
            result: $Utils.Optional<ApiPaymentActionCountAggregateOutputType> | number
          }
        }
      }
      ApiWorkflowTrigger: {
        payload: Prisma.$ApiWorkflowTriggerPayload<ExtArgs>
        fields: Prisma.ApiWorkflowTriggerFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiWorkflowTriggerFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiWorkflowTriggerFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          findFirst: {
            args: Prisma.ApiWorkflowTriggerFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiWorkflowTriggerFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          findMany: {
            args: Prisma.ApiWorkflowTriggerFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>[]
          }
          create: {
            args: Prisma.ApiWorkflowTriggerCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          createMany: {
            args: Prisma.ApiWorkflowTriggerCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiWorkflowTriggerCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>[]
          }
          delete: {
            args: Prisma.ApiWorkflowTriggerDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          update: {
            args: Prisma.ApiWorkflowTriggerUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          deleteMany: {
            args: Prisma.ApiWorkflowTriggerDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiWorkflowTriggerUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiWorkflowTriggerUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>[]
          }
          upsert: {
            args: Prisma.ApiWorkflowTriggerUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiWorkflowTriggerPayload>
          }
          aggregate: {
            args: Prisma.ApiWorkflowTriggerAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiWorkflowTrigger>
          }
          groupBy: {
            args: Prisma.ApiWorkflowTriggerGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiWorkflowTriggerGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiWorkflowTriggerCountArgs<ExtArgs>
            result: $Utils.Optional<ApiWorkflowTriggerCountAggregateOutputType> | number
          }
        }
      }
      ApiBookingDocument: {
        payload: Prisma.$ApiBookingDocumentPayload<ExtArgs>
        fields: Prisma.ApiBookingDocumentFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiBookingDocumentFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiBookingDocumentFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          findFirst: {
            args: Prisma.ApiBookingDocumentFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiBookingDocumentFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          findMany: {
            args: Prisma.ApiBookingDocumentFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>[]
          }
          create: {
            args: Prisma.ApiBookingDocumentCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          createMany: {
            args: Prisma.ApiBookingDocumentCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiBookingDocumentCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>[]
          }
          delete: {
            args: Prisma.ApiBookingDocumentDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          update: {
            args: Prisma.ApiBookingDocumentUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          deleteMany: {
            args: Prisma.ApiBookingDocumentDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiBookingDocumentUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiBookingDocumentUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>[]
          }
          upsert: {
            args: Prisma.ApiBookingDocumentUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBookingDocumentPayload>
          }
          aggregate: {
            args: Prisma.ApiBookingDocumentAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiBookingDocument>
          }
          groupBy: {
            args: Prisma.ApiBookingDocumentGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiBookingDocumentGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiBookingDocumentCountArgs<ExtArgs>
            result: $Utils.Optional<ApiBookingDocumentCountAggregateOutputType> | number
          }
        }
      }
      ApiBusinessMetrics: {
        payload: Prisma.$ApiBusinessMetricsPayload<ExtArgs>
        fields: Prisma.ApiBusinessMetricsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiBusinessMetricsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiBusinessMetricsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          findFirst: {
            args: Prisma.ApiBusinessMetricsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiBusinessMetricsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          findMany: {
            args: Prisma.ApiBusinessMetricsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>[]
          }
          create: {
            args: Prisma.ApiBusinessMetricsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          createMany: {
            args: Prisma.ApiBusinessMetricsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiBusinessMetricsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>[]
          }
          delete: {
            args: Prisma.ApiBusinessMetricsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          update: {
            args: Prisma.ApiBusinessMetricsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          deleteMany: {
            args: Prisma.ApiBusinessMetricsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiBusinessMetricsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiBusinessMetricsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>[]
          }
          upsert: {
            args: Prisma.ApiBusinessMetricsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiBusinessMetricsPayload>
          }
          aggregate: {
            args: Prisma.ApiBusinessMetricsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiBusinessMetrics>
          }
          groupBy: {
            args: Prisma.ApiBusinessMetricsGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiBusinessMetricsGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiBusinessMetricsCountArgs<ExtArgs>
            result: $Utils.Optional<ApiBusinessMetricsCountAggregateOutputType> | number
          }
        }
      }
      ApiRequestLog: {
        payload: Prisma.$ApiRequestLogPayload<ExtArgs>
        fields: Prisma.ApiRequestLogFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ApiRequestLogFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ApiRequestLogFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          findFirst: {
            args: Prisma.ApiRequestLogFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ApiRequestLogFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          findMany: {
            args: Prisma.ApiRequestLogFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>[]
          }
          create: {
            args: Prisma.ApiRequestLogCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          createMany: {
            args: Prisma.ApiRequestLogCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ApiRequestLogCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>[]
          }
          delete: {
            args: Prisma.ApiRequestLogDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          update: {
            args: Prisma.ApiRequestLogUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          deleteMany: {
            args: Prisma.ApiRequestLogDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ApiRequestLogUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.ApiRequestLogUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>[]
          }
          upsert: {
            args: Prisma.ApiRequestLogUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ApiRequestLogPayload>
          }
          aggregate: {
            args: Prisma.ApiRequestLogAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateApiRequestLog>
          }
          groupBy: {
            args: Prisma.ApiRequestLogGroupByArgs<ExtArgs>
            result: $Utils.Optional<ApiRequestLogGroupByOutputType>[]
          }
          count: {
            args: Prisma.ApiRequestLogCountArgs<ExtArgs>
            result: $Utils.Optional<ApiRequestLogCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    apiBooking?: ApiBookingOmit
    apiPaymentAction?: ApiPaymentActionOmit
    apiWorkflowTrigger?: ApiWorkflowTriggerOmit
    apiBookingDocument?: ApiBookingDocumentOmit
    apiBusinessMetrics?: ApiBusinessMetricsOmit
    apiRequestLog?: ApiRequestLogOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ApiBookingCountOutputType
   */

  export type ApiBookingCountOutputType = {
    paymentActions: number
    workflowTriggers: number
    documents: number
  }

  export type ApiBookingCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paymentActions?: boolean | ApiBookingCountOutputTypeCountPaymentActionsArgs
    workflowTriggers?: boolean | ApiBookingCountOutputTypeCountWorkflowTriggersArgs
    documents?: boolean | ApiBookingCountOutputTypeCountDocumentsArgs
  }

  // Custom InputTypes
  /**
   * ApiBookingCountOutputType without action
   */
  export type ApiBookingCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingCountOutputType
     */
    select?: ApiBookingCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ApiBookingCountOutputType without action
   */
  export type ApiBookingCountOutputTypeCountPaymentActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiPaymentActionWhereInput
  }

  /**
   * ApiBookingCountOutputType without action
   */
  export type ApiBookingCountOutputTypeCountWorkflowTriggersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiWorkflowTriggerWhereInput
  }

  /**
   * ApiBookingCountOutputType without action
   */
  export type ApiBookingCountOutputTypeCountDocumentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiBookingDocumentWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ApiBooking
   */

  export type AggregateApiBooking = {
    _count: ApiBookingCountAggregateOutputType | null
    _avg: ApiBookingAvgAggregateOutputType | null
    _sum: ApiBookingSumAggregateOutputType | null
    _min: ApiBookingMinAggregateOutputType | null
    _max: ApiBookingMaxAggregateOutputType | null
  }

  export type ApiBookingAvgAggregateOutputType = {
    servicePrice: Decimal | null
    duration: number | null
    paymentAmount: Decimal | null
    hoursOld: number | null
    remindersSent: number | null
  }

  export type ApiBookingSumAggregateOutputType = {
    servicePrice: Decimal | null
    duration: number | null
    paymentAmount: Decimal | null
    hoursOld: number | null
    remindersSent: number | null
  }

  export type ApiBookingMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    ghlContactId: string | null
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    serviceName: string | null
    serviceDescription: string | null
    servicePrice: Decimal | null
    scheduledDateTime: Date | null
    duration: number | null
    timezone: string | null
    appointmentStatus: string | null
    locationType: string | null
    addressStreet: string | null
    addressCity: string | null
    addressState: string | null
    addressZip: string | null
    addressFormatted: string | null
    locationNotes: string | null
    paymentAmount: Decimal | null
    paymentStatus: string | null
    paymentMethod: string | null
    paymentUrl: string | null
    paymentIntentId: string | null
    paidAt: Date | null
    paymentExpiresAt: Date | null
    urgencyLevel: string | null
    hoursOld: number | null
    remindersSent: number | null
    lastReminderAt: Date | null
    leadSource: string | null
    campaignName: string | null
    referralCode: string | null
    ghlWorkflowId: string | null
    triggerSource: string | null
    notes: string | null
    internalNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type ApiBookingMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    ghlContactId: string | null
    customerName: string | null
    customerEmail: string | null
    customerPhone: string | null
    serviceName: string | null
    serviceDescription: string | null
    servicePrice: Decimal | null
    scheduledDateTime: Date | null
    duration: number | null
    timezone: string | null
    appointmentStatus: string | null
    locationType: string | null
    addressStreet: string | null
    addressCity: string | null
    addressState: string | null
    addressZip: string | null
    addressFormatted: string | null
    locationNotes: string | null
    paymentAmount: Decimal | null
    paymentStatus: string | null
    paymentMethod: string | null
    paymentUrl: string | null
    paymentIntentId: string | null
    paidAt: Date | null
    paymentExpiresAt: Date | null
    urgencyLevel: string | null
    hoursOld: number | null
    remindersSent: number | null
    lastReminderAt: Date | null
    leadSource: string | null
    campaignName: string | null
    referralCode: string | null
    ghlWorkflowId: string | null
    triggerSource: string | null
    notes: string | null
    internalNotes: string | null
    createdAt: Date | null
    updatedAt: Date | null
    createdBy: string | null
  }

  export type ApiBookingCountAggregateOutputType = {
    id: number
    bookingId: number
    ghlContactId: number
    customerName: number
    customerEmail: number
    customerPhone: number
    serviceName: number
    serviceDescription: number
    servicePrice: number
    scheduledDateTime: number
    duration: number
    timezone: number
    appointmentStatus: number
    locationType: number
    addressStreet: number
    addressCity: number
    addressState: number
    addressZip: number
    addressFormatted: number
    locationNotes: number
    paymentAmount: number
    paymentStatus: number
    paymentMethod: number
    paymentUrl: number
    paymentIntentId: number
    paidAt: number
    paymentExpiresAt: number
    urgencyLevel: number
    hoursOld: number
    remindersSent: number
    lastReminderAt: number
    leadSource: number
    campaignName: number
    referralCode: number
    ghlWorkflowId: number
    triggerSource: number
    notes: number
    internalNotes: number
    createdAt: number
    updatedAt: number
    createdBy: number
    _all: number
  }


  export type ApiBookingAvgAggregateInputType = {
    servicePrice?: true
    duration?: true
    paymentAmount?: true
    hoursOld?: true
    remindersSent?: true
  }

  export type ApiBookingSumAggregateInputType = {
    servicePrice?: true
    duration?: true
    paymentAmount?: true
    hoursOld?: true
    remindersSent?: true
  }

  export type ApiBookingMinAggregateInputType = {
    id?: true
    bookingId?: true
    ghlContactId?: true
    customerName?: true
    customerEmail?: true
    customerPhone?: true
    serviceName?: true
    serviceDescription?: true
    servicePrice?: true
    scheduledDateTime?: true
    duration?: true
    timezone?: true
    appointmentStatus?: true
    locationType?: true
    addressStreet?: true
    addressCity?: true
    addressState?: true
    addressZip?: true
    addressFormatted?: true
    locationNotes?: true
    paymentAmount?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentUrl?: true
    paymentIntentId?: true
    paidAt?: true
    paymentExpiresAt?: true
    urgencyLevel?: true
    hoursOld?: true
    remindersSent?: true
    lastReminderAt?: true
    leadSource?: true
    campaignName?: true
    referralCode?: true
    ghlWorkflowId?: true
    triggerSource?: true
    notes?: true
    internalNotes?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type ApiBookingMaxAggregateInputType = {
    id?: true
    bookingId?: true
    ghlContactId?: true
    customerName?: true
    customerEmail?: true
    customerPhone?: true
    serviceName?: true
    serviceDescription?: true
    servicePrice?: true
    scheduledDateTime?: true
    duration?: true
    timezone?: true
    appointmentStatus?: true
    locationType?: true
    addressStreet?: true
    addressCity?: true
    addressState?: true
    addressZip?: true
    addressFormatted?: true
    locationNotes?: true
    paymentAmount?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentUrl?: true
    paymentIntentId?: true
    paidAt?: true
    paymentExpiresAt?: true
    urgencyLevel?: true
    hoursOld?: true
    remindersSent?: true
    lastReminderAt?: true
    leadSource?: true
    campaignName?: true
    referralCode?: true
    ghlWorkflowId?: true
    triggerSource?: true
    notes?: true
    internalNotes?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
  }

  export type ApiBookingCountAggregateInputType = {
    id?: true
    bookingId?: true
    ghlContactId?: true
    customerName?: true
    customerEmail?: true
    customerPhone?: true
    serviceName?: true
    serviceDescription?: true
    servicePrice?: true
    scheduledDateTime?: true
    duration?: true
    timezone?: true
    appointmentStatus?: true
    locationType?: true
    addressStreet?: true
    addressCity?: true
    addressState?: true
    addressZip?: true
    addressFormatted?: true
    locationNotes?: true
    paymentAmount?: true
    paymentStatus?: true
    paymentMethod?: true
    paymentUrl?: true
    paymentIntentId?: true
    paidAt?: true
    paymentExpiresAt?: true
    urgencyLevel?: true
    hoursOld?: true
    remindersSent?: true
    lastReminderAt?: true
    leadSource?: true
    campaignName?: true
    referralCode?: true
    ghlWorkflowId?: true
    triggerSource?: true
    notes?: true
    internalNotes?: true
    createdAt?: true
    updatedAt?: true
    createdBy?: true
    _all?: true
  }

  export type ApiBookingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBooking to aggregate.
     */
    where?: ApiBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookings to fetch.
     */
    orderBy?: ApiBookingOrderByWithRelationInput | ApiBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiBookings
    **/
    _count?: true | ApiBookingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApiBookingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApiBookingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiBookingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiBookingMaxAggregateInputType
  }

  export type GetApiBookingAggregateType<T extends ApiBookingAggregateArgs> = {
        [P in keyof T & keyof AggregateApiBooking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiBooking[P]>
      : GetScalarType<T[P], AggregateApiBooking[P]>
  }




  export type ApiBookingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiBookingWhereInput
    orderBy?: ApiBookingOrderByWithAggregationInput | ApiBookingOrderByWithAggregationInput[]
    by: ApiBookingScalarFieldEnum[] | ApiBookingScalarFieldEnum
    having?: ApiBookingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiBookingCountAggregateInputType | true
    _avg?: ApiBookingAvgAggregateInputType
    _sum?: ApiBookingSumAggregateInputType
    _min?: ApiBookingMinAggregateInputType
    _max?: ApiBookingMaxAggregateInputType
  }

  export type ApiBookingGroupByOutputType = {
    id: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription: string | null
    servicePrice: Decimal
    scheduledDateTime: Date
    duration: number
    timezone: string
    appointmentStatus: string
    locationType: string
    addressStreet: string | null
    addressCity: string | null
    addressState: string | null
    addressZip: string | null
    addressFormatted: string | null
    locationNotes: string | null
    paymentAmount: Decimal
    paymentStatus: string
    paymentMethod: string
    paymentUrl: string | null
    paymentIntentId: string | null
    paidAt: Date | null
    paymentExpiresAt: Date
    urgencyLevel: string
    hoursOld: number
    remindersSent: number
    lastReminderAt: Date | null
    leadSource: string
    campaignName: string | null
    referralCode: string | null
    ghlWorkflowId: string | null
    triggerSource: string | null
    notes: string | null
    internalNotes: string | null
    createdAt: Date
    updatedAt: Date
    createdBy: string
    _count: ApiBookingCountAggregateOutputType | null
    _avg: ApiBookingAvgAggregateOutputType | null
    _sum: ApiBookingSumAggregateOutputType | null
    _min: ApiBookingMinAggregateOutputType | null
    _max: ApiBookingMaxAggregateOutputType | null
  }

  type GetApiBookingGroupByPayload<T extends ApiBookingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiBookingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiBookingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiBookingGroupByOutputType[P]>
            : GetScalarType<T[P], ApiBookingGroupByOutputType[P]>
        }
      >
    >


  export type ApiBookingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    ghlContactId?: boolean
    customerName?: boolean
    customerEmail?: boolean
    customerPhone?: boolean
    serviceName?: boolean
    serviceDescription?: boolean
    servicePrice?: boolean
    scheduledDateTime?: boolean
    duration?: boolean
    timezone?: boolean
    appointmentStatus?: boolean
    locationType?: boolean
    addressStreet?: boolean
    addressCity?: boolean
    addressState?: boolean
    addressZip?: boolean
    addressFormatted?: boolean
    locationNotes?: boolean
    paymentAmount?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentUrl?: boolean
    paymentIntentId?: boolean
    paidAt?: boolean
    paymentExpiresAt?: boolean
    urgencyLevel?: boolean
    hoursOld?: boolean
    remindersSent?: boolean
    lastReminderAt?: boolean
    leadSource?: boolean
    campaignName?: boolean
    referralCode?: boolean
    ghlWorkflowId?: boolean
    triggerSource?: boolean
    notes?: boolean
    internalNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
    paymentActions?: boolean | ApiBooking$paymentActionsArgs<ExtArgs>
    workflowTriggers?: boolean | ApiBooking$workflowTriggersArgs<ExtArgs>
    documents?: boolean | ApiBooking$documentsArgs<ExtArgs>
    _count?: boolean | ApiBookingCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiBooking"]>

  export type ApiBookingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    ghlContactId?: boolean
    customerName?: boolean
    customerEmail?: boolean
    customerPhone?: boolean
    serviceName?: boolean
    serviceDescription?: boolean
    servicePrice?: boolean
    scheduledDateTime?: boolean
    duration?: boolean
    timezone?: boolean
    appointmentStatus?: boolean
    locationType?: boolean
    addressStreet?: boolean
    addressCity?: boolean
    addressState?: boolean
    addressZip?: boolean
    addressFormatted?: boolean
    locationNotes?: boolean
    paymentAmount?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentUrl?: boolean
    paymentIntentId?: boolean
    paidAt?: boolean
    paymentExpiresAt?: boolean
    urgencyLevel?: boolean
    hoursOld?: boolean
    remindersSent?: boolean
    lastReminderAt?: boolean
    leadSource?: boolean
    campaignName?: boolean
    referralCode?: boolean
    ghlWorkflowId?: boolean
    triggerSource?: boolean
    notes?: boolean
    internalNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["apiBooking"]>

  export type ApiBookingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    ghlContactId?: boolean
    customerName?: boolean
    customerEmail?: boolean
    customerPhone?: boolean
    serviceName?: boolean
    serviceDescription?: boolean
    servicePrice?: boolean
    scheduledDateTime?: boolean
    duration?: boolean
    timezone?: boolean
    appointmentStatus?: boolean
    locationType?: boolean
    addressStreet?: boolean
    addressCity?: boolean
    addressState?: boolean
    addressZip?: boolean
    addressFormatted?: boolean
    locationNotes?: boolean
    paymentAmount?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentUrl?: boolean
    paymentIntentId?: boolean
    paidAt?: boolean
    paymentExpiresAt?: boolean
    urgencyLevel?: boolean
    hoursOld?: boolean
    remindersSent?: boolean
    lastReminderAt?: boolean
    leadSource?: boolean
    campaignName?: boolean
    referralCode?: boolean
    ghlWorkflowId?: boolean
    triggerSource?: boolean
    notes?: boolean
    internalNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }, ExtArgs["result"]["apiBooking"]>

  export type ApiBookingSelectScalar = {
    id?: boolean
    bookingId?: boolean
    ghlContactId?: boolean
    customerName?: boolean
    customerEmail?: boolean
    customerPhone?: boolean
    serviceName?: boolean
    serviceDescription?: boolean
    servicePrice?: boolean
    scheduledDateTime?: boolean
    duration?: boolean
    timezone?: boolean
    appointmentStatus?: boolean
    locationType?: boolean
    addressStreet?: boolean
    addressCity?: boolean
    addressState?: boolean
    addressZip?: boolean
    addressFormatted?: boolean
    locationNotes?: boolean
    paymentAmount?: boolean
    paymentStatus?: boolean
    paymentMethod?: boolean
    paymentUrl?: boolean
    paymentIntentId?: boolean
    paidAt?: boolean
    paymentExpiresAt?: boolean
    urgencyLevel?: boolean
    hoursOld?: boolean
    remindersSent?: boolean
    lastReminderAt?: boolean
    leadSource?: boolean
    campaignName?: boolean
    referralCode?: boolean
    ghlWorkflowId?: boolean
    triggerSource?: boolean
    notes?: boolean
    internalNotes?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    createdBy?: boolean
  }

  export type ApiBookingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "ghlContactId" | "customerName" | "customerEmail" | "customerPhone" | "serviceName" | "serviceDescription" | "servicePrice" | "scheduledDateTime" | "duration" | "timezone" | "appointmentStatus" | "locationType" | "addressStreet" | "addressCity" | "addressState" | "addressZip" | "addressFormatted" | "locationNotes" | "paymentAmount" | "paymentStatus" | "paymentMethod" | "paymentUrl" | "paymentIntentId" | "paidAt" | "paymentExpiresAt" | "urgencyLevel" | "hoursOld" | "remindersSent" | "lastReminderAt" | "leadSource" | "campaignName" | "referralCode" | "ghlWorkflowId" | "triggerSource" | "notes" | "internalNotes" | "createdAt" | "updatedAt" | "createdBy", ExtArgs["result"]["apiBooking"]>
  export type ApiBookingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    paymentActions?: boolean | ApiBooking$paymentActionsArgs<ExtArgs>
    workflowTriggers?: boolean | ApiBooking$workflowTriggersArgs<ExtArgs>
    documents?: boolean | ApiBooking$documentsArgs<ExtArgs>
    _count?: boolean | ApiBookingCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ApiBookingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type ApiBookingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ApiBookingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiBooking"
    objects: {
      paymentActions: Prisma.$ApiPaymentActionPayload<ExtArgs>[]
      workflowTriggers: Prisma.$ApiWorkflowTriggerPayload<ExtArgs>[]
      documents: Prisma.$ApiBookingDocumentPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      ghlContactId: string
      customerName: string
      customerEmail: string
      customerPhone: string
      serviceName: string
      serviceDescription: string | null
      servicePrice: Prisma.Decimal
      scheduledDateTime: Date
      duration: number
      timezone: string
      appointmentStatus: string
      locationType: string
      addressStreet: string | null
      addressCity: string | null
      addressState: string | null
      addressZip: string | null
      addressFormatted: string | null
      locationNotes: string | null
      paymentAmount: Prisma.Decimal
      paymentStatus: string
      paymentMethod: string
      paymentUrl: string | null
      paymentIntentId: string | null
      paidAt: Date | null
      paymentExpiresAt: Date
      urgencyLevel: string
      hoursOld: number
      remindersSent: number
      lastReminderAt: Date | null
      leadSource: string
      campaignName: string | null
      referralCode: string | null
      ghlWorkflowId: string | null
      triggerSource: string | null
      notes: string | null
      internalNotes: string | null
      createdAt: Date
      updatedAt: Date
      createdBy: string
    }, ExtArgs["result"]["apiBooking"]>
    composites: {}
  }

  type ApiBookingGetPayload<S extends boolean | null | undefined | ApiBookingDefaultArgs> = $Result.GetResult<Prisma.$ApiBookingPayload, S>

  type ApiBookingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiBookingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiBookingCountAggregateInputType | true
    }

  export interface ApiBookingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiBooking'], meta: { name: 'ApiBooking' } }
    /**
     * Find zero or one ApiBooking that matches the filter.
     * @param {ApiBookingFindUniqueArgs} args - Arguments to find a ApiBooking
     * @example
     * // Get one ApiBooking
     * const apiBooking = await prisma.apiBooking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiBookingFindUniqueArgs>(args: SelectSubset<T, ApiBookingFindUniqueArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiBooking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiBookingFindUniqueOrThrowArgs} args - Arguments to find a ApiBooking
     * @example
     * // Get one ApiBooking
     * const apiBooking = await prisma.apiBooking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiBookingFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiBookingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBooking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingFindFirstArgs} args - Arguments to find a ApiBooking
     * @example
     * // Get one ApiBooking
     * const apiBooking = await prisma.apiBooking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiBookingFindFirstArgs>(args?: SelectSubset<T, ApiBookingFindFirstArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBooking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingFindFirstOrThrowArgs} args - Arguments to find a ApiBooking
     * @example
     * // Get one ApiBooking
     * const apiBooking = await prisma.apiBooking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiBookingFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiBookingFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiBookings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiBookings
     * const apiBookings = await prisma.apiBooking.findMany()
     * 
     * // Get first 10 ApiBookings
     * const apiBookings = await prisma.apiBooking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiBookingWithIdOnly = await prisma.apiBooking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiBookingFindManyArgs>(args?: SelectSubset<T, ApiBookingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiBooking.
     * @param {ApiBookingCreateArgs} args - Arguments to create a ApiBooking.
     * @example
     * // Create one ApiBooking
     * const ApiBooking = await prisma.apiBooking.create({
     *   data: {
     *     // ... data to create a ApiBooking
     *   }
     * })
     * 
     */
    create<T extends ApiBookingCreateArgs>(args: SelectSubset<T, ApiBookingCreateArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiBookings.
     * @param {ApiBookingCreateManyArgs} args - Arguments to create many ApiBookings.
     * @example
     * // Create many ApiBookings
     * const apiBooking = await prisma.apiBooking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiBookingCreateManyArgs>(args?: SelectSubset<T, ApiBookingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiBookings and returns the data saved in the database.
     * @param {ApiBookingCreateManyAndReturnArgs} args - Arguments to create many ApiBookings.
     * @example
     * // Create many ApiBookings
     * const apiBooking = await prisma.apiBooking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiBookings and only return the `id`
     * const apiBookingWithIdOnly = await prisma.apiBooking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiBookingCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiBookingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiBooking.
     * @param {ApiBookingDeleteArgs} args - Arguments to delete one ApiBooking.
     * @example
     * // Delete one ApiBooking
     * const ApiBooking = await prisma.apiBooking.delete({
     *   where: {
     *     // ... filter to delete one ApiBooking
     *   }
     * })
     * 
     */
    delete<T extends ApiBookingDeleteArgs>(args: SelectSubset<T, ApiBookingDeleteArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiBooking.
     * @param {ApiBookingUpdateArgs} args - Arguments to update one ApiBooking.
     * @example
     * // Update one ApiBooking
     * const apiBooking = await prisma.apiBooking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiBookingUpdateArgs>(args: SelectSubset<T, ApiBookingUpdateArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiBookings.
     * @param {ApiBookingDeleteManyArgs} args - Arguments to filter ApiBookings to delete.
     * @example
     * // Delete a few ApiBookings
     * const { count } = await prisma.apiBooking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiBookingDeleteManyArgs>(args?: SelectSubset<T, ApiBookingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiBookings
     * const apiBooking = await prisma.apiBooking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiBookingUpdateManyArgs>(args: SelectSubset<T, ApiBookingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBookings and returns the data updated in the database.
     * @param {ApiBookingUpdateManyAndReturnArgs} args - Arguments to update many ApiBookings.
     * @example
     * // Update many ApiBookings
     * const apiBooking = await prisma.apiBooking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiBookings and only return the `id`
     * const apiBookingWithIdOnly = await prisma.apiBooking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiBookingUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiBookingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiBooking.
     * @param {ApiBookingUpsertArgs} args - Arguments to update or create a ApiBooking.
     * @example
     * // Update or create a ApiBooking
     * const apiBooking = await prisma.apiBooking.upsert({
     *   create: {
     *     // ... data to create a ApiBooking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiBooking we want to update
     *   }
     * })
     */
    upsert<T extends ApiBookingUpsertArgs>(args: SelectSubset<T, ApiBookingUpsertArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiBookings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingCountArgs} args - Arguments to filter ApiBookings to count.
     * @example
     * // Count the number of ApiBookings
     * const count = await prisma.apiBooking.count({
     *   where: {
     *     // ... the filter for the ApiBookings we want to count
     *   }
     * })
    **/
    count<T extends ApiBookingCountArgs>(
      args?: Subset<T, ApiBookingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiBookingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiBooking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiBookingAggregateArgs>(args: Subset<T, ApiBookingAggregateArgs>): Prisma.PrismaPromise<GetApiBookingAggregateType<T>>

    /**
     * Group by ApiBooking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiBookingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiBookingGroupByArgs['orderBy'] }
        : { orderBy?: ApiBookingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiBookingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiBookingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiBooking model
   */
  readonly fields: ApiBookingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiBooking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiBookingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    paymentActions<T extends ApiBooking$paymentActionsArgs<ExtArgs> = {}>(args?: Subset<T, ApiBooking$paymentActionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    workflowTriggers<T extends ApiBooking$workflowTriggersArgs<ExtArgs> = {}>(args?: Subset<T, ApiBooking$workflowTriggersArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    documents<T extends ApiBooking$documentsArgs<ExtArgs> = {}>(args?: Subset<T, ApiBooking$documentsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiBooking model
   */
  interface ApiBookingFieldRefs {
    readonly id: FieldRef<"ApiBooking", 'String'>
    readonly bookingId: FieldRef<"ApiBooking", 'String'>
    readonly ghlContactId: FieldRef<"ApiBooking", 'String'>
    readonly customerName: FieldRef<"ApiBooking", 'String'>
    readonly customerEmail: FieldRef<"ApiBooking", 'String'>
    readonly customerPhone: FieldRef<"ApiBooking", 'String'>
    readonly serviceName: FieldRef<"ApiBooking", 'String'>
    readonly serviceDescription: FieldRef<"ApiBooking", 'String'>
    readonly servicePrice: FieldRef<"ApiBooking", 'Decimal'>
    readonly scheduledDateTime: FieldRef<"ApiBooking", 'DateTime'>
    readonly duration: FieldRef<"ApiBooking", 'Int'>
    readonly timezone: FieldRef<"ApiBooking", 'String'>
    readonly appointmentStatus: FieldRef<"ApiBooking", 'String'>
    readonly locationType: FieldRef<"ApiBooking", 'String'>
    readonly addressStreet: FieldRef<"ApiBooking", 'String'>
    readonly addressCity: FieldRef<"ApiBooking", 'String'>
    readonly addressState: FieldRef<"ApiBooking", 'String'>
    readonly addressZip: FieldRef<"ApiBooking", 'String'>
    readonly addressFormatted: FieldRef<"ApiBooking", 'String'>
    readonly locationNotes: FieldRef<"ApiBooking", 'String'>
    readonly paymentAmount: FieldRef<"ApiBooking", 'Decimal'>
    readonly paymentStatus: FieldRef<"ApiBooking", 'String'>
    readonly paymentMethod: FieldRef<"ApiBooking", 'String'>
    readonly paymentUrl: FieldRef<"ApiBooking", 'String'>
    readonly paymentIntentId: FieldRef<"ApiBooking", 'String'>
    readonly paidAt: FieldRef<"ApiBooking", 'DateTime'>
    readonly paymentExpiresAt: FieldRef<"ApiBooking", 'DateTime'>
    readonly urgencyLevel: FieldRef<"ApiBooking", 'String'>
    readonly hoursOld: FieldRef<"ApiBooking", 'Int'>
    readonly remindersSent: FieldRef<"ApiBooking", 'Int'>
    readonly lastReminderAt: FieldRef<"ApiBooking", 'DateTime'>
    readonly leadSource: FieldRef<"ApiBooking", 'String'>
    readonly campaignName: FieldRef<"ApiBooking", 'String'>
    readonly referralCode: FieldRef<"ApiBooking", 'String'>
    readonly ghlWorkflowId: FieldRef<"ApiBooking", 'String'>
    readonly triggerSource: FieldRef<"ApiBooking", 'String'>
    readonly notes: FieldRef<"ApiBooking", 'String'>
    readonly internalNotes: FieldRef<"ApiBooking", 'String'>
    readonly createdAt: FieldRef<"ApiBooking", 'DateTime'>
    readonly updatedAt: FieldRef<"ApiBooking", 'DateTime'>
    readonly createdBy: FieldRef<"ApiBooking", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ApiBooking findUnique
   */
  export type ApiBookingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter, which ApiBooking to fetch.
     */
    where: ApiBookingWhereUniqueInput
  }

  /**
   * ApiBooking findUniqueOrThrow
   */
  export type ApiBookingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter, which ApiBooking to fetch.
     */
    where: ApiBookingWhereUniqueInput
  }

  /**
   * ApiBooking findFirst
   */
  export type ApiBookingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter, which ApiBooking to fetch.
     */
    where?: ApiBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookings to fetch.
     */
    orderBy?: ApiBookingOrderByWithRelationInput | ApiBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBookings.
     */
    cursor?: ApiBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBookings.
     */
    distinct?: ApiBookingScalarFieldEnum | ApiBookingScalarFieldEnum[]
  }

  /**
   * ApiBooking findFirstOrThrow
   */
  export type ApiBookingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter, which ApiBooking to fetch.
     */
    where?: ApiBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookings to fetch.
     */
    orderBy?: ApiBookingOrderByWithRelationInput | ApiBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBookings.
     */
    cursor?: ApiBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBookings.
     */
    distinct?: ApiBookingScalarFieldEnum | ApiBookingScalarFieldEnum[]
  }

  /**
   * ApiBooking findMany
   */
  export type ApiBookingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookings to fetch.
     */
    where?: ApiBookingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookings to fetch.
     */
    orderBy?: ApiBookingOrderByWithRelationInput | ApiBookingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiBookings.
     */
    cursor?: ApiBookingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookings.
     */
    skip?: number
    distinct?: ApiBookingScalarFieldEnum | ApiBookingScalarFieldEnum[]
  }

  /**
   * ApiBooking create
   */
  export type ApiBookingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * The data needed to create a ApiBooking.
     */
    data: XOR<ApiBookingCreateInput, ApiBookingUncheckedCreateInput>
  }

  /**
   * ApiBooking createMany
   */
  export type ApiBookingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiBookings.
     */
    data: ApiBookingCreateManyInput | ApiBookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiBooking createManyAndReturn
   */
  export type ApiBookingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * The data used to create many ApiBookings.
     */
    data: ApiBookingCreateManyInput | ApiBookingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiBooking update
   */
  export type ApiBookingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * The data needed to update a ApiBooking.
     */
    data: XOR<ApiBookingUpdateInput, ApiBookingUncheckedUpdateInput>
    /**
     * Choose, which ApiBooking to update.
     */
    where: ApiBookingWhereUniqueInput
  }

  /**
   * ApiBooking updateMany
   */
  export type ApiBookingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiBookings.
     */
    data: XOR<ApiBookingUpdateManyMutationInput, ApiBookingUncheckedUpdateManyInput>
    /**
     * Filter which ApiBookings to update
     */
    where?: ApiBookingWhereInput
    /**
     * Limit how many ApiBookings to update.
     */
    limit?: number
  }

  /**
   * ApiBooking updateManyAndReturn
   */
  export type ApiBookingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * The data used to update ApiBookings.
     */
    data: XOR<ApiBookingUpdateManyMutationInput, ApiBookingUncheckedUpdateManyInput>
    /**
     * Filter which ApiBookings to update
     */
    where?: ApiBookingWhereInput
    /**
     * Limit how many ApiBookings to update.
     */
    limit?: number
  }

  /**
   * ApiBooking upsert
   */
  export type ApiBookingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * The filter to search for the ApiBooking to update in case it exists.
     */
    where: ApiBookingWhereUniqueInput
    /**
     * In case the ApiBooking found by the `where` argument doesn't exist, create a new ApiBooking with this data.
     */
    create: XOR<ApiBookingCreateInput, ApiBookingUncheckedCreateInput>
    /**
     * In case the ApiBooking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiBookingUpdateInput, ApiBookingUncheckedUpdateInput>
  }

  /**
   * ApiBooking delete
   */
  export type ApiBookingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
    /**
     * Filter which ApiBooking to delete.
     */
    where: ApiBookingWhereUniqueInput
  }

  /**
   * ApiBooking deleteMany
   */
  export type ApiBookingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBookings to delete
     */
    where?: ApiBookingWhereInput
    /**
     * Limit how many ApiBookings to delete.
     */
    limit?: number
  }

  /**
   * ApiBooking.paymentActions
   */
  export type ApiBooking$paymentActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    where?: ApiPaymentActionWhereInput
    orderBy?: ApiPaymentActionOrderByWithRelationInput | ApiPaymentActionOrderByWithRelationInput[]
    cursor?: ApiPaymentActionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApiPaymentActionScalarFieldEnum | ApiPaymentActionScalarFieldEnum[]
  }

  /**
   * ApiBooking.workflowTriggers
   */
  export type ApiBooking$workflowTriggersArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    where?: ApiWorkflowTriggerWhereInput
    orderBy?: ApiWorkflowTriggerOrderByWithRelationInput | ApiWorkflowTriggerOrderByWithRelationInput[]
    cursor?: ApiWorkflowTriggerWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApiWorkflowTriggerScalarFieldEnum | ApiWorkflowTriggerScalarFieldEnum[]
  }

  /**
   * ApiBooking.documents
   */
  export type ApiBooking$documentsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    where?: ApiBookingDocumentWhereInput
    orderBy?: ApiBookingDocumentOrderByWithRelationInput | ApiBookingDocumentOrderByWithRelationInput[]
    cursor?: ApiBookingDocumentWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ApiBookingDocumentScalarFieldEnum | ApiBookingDocumentScalarFieldEnum[]
  }

  /**
   * ApiBooking without action
   */
  export type ApiBookingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBooking
     */
    select?: ApiBookingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBooking
     */
    omit?: ApiBookingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingInclude<ExtArgs> | null
  }


  /**
   * Model ApiPaymentAction
   */

  export type AggregateApiPaymentAction = {
    _count: ApiPaymentActionCountAggregateOutputType | null
    _min: ApiPaymentActionMinAggregateOutputType | null
    _max: ApiPaymentActionMaxAggregateOutputType | null
  }

  export type ApiPaymentActionMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    actionType: string | null
    reminderType: string | null
    notes: string | null
    timestamp: Date | null
  }

  export type ApiPaymentActionMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    actionType: string | null
    reminderType: string | null
    notes: string | null
    timestamp: Date | null
  }

  export type ApiPaymentActionCountAggregateOutputType = {
    id: number
    bookingId: number
    actionType: number
    reminderType: number
    notes: number
    timestamp: number
    _all: number
  }


  export type ApiPaymentActionMinAggregateInputType = {
    id?: true
    bookingId?: true
    actionType?: true
    reminderType?: true
    notes?: true
    timestamp?: true
  }

  export type ApiPaymentActionMaxAggregateInputType = {
    id?: true
    bookingId?: true
    actionType?: true
    reminderType?: true
    notes?: true
    timestamp?: true
  }

  export type ApiPaymentActionCountAggregateInputType = {
    id?: true
    bookingId?: true
    actionType?: true
    reminderType?: true
    notes?: true
    timestamp?: true
    _all?: true
  }

  export type ApiPaymentActionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiPaymentAction to aggregate.
     */
    where?: ApiPaymentActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPaymentActions to fetch.
     */
    orderBy?: ApiPaymentActionOrderByWithRelationInput | ApiPaymentActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiPaymentActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPaymentActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPaymentActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiPaymentActions
    **/
    _count?: true | ApiPaymentActionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiPaymentActionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiPaymentActionMaxAggregateInputType
  }

  export type GetApiPaymentActionAggregateType<T extends ApiPaymentActionAggregateArgs> = {
        [P in keyof T & keyof AggregateApiPaymentAction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiPaymentAction[P]>
      : GetScalarType<T[P], AggregateApiPaymentAction[P]>
  }




  export type ApiPaymentActionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiPaymentActionWhereInput
    orderBy?: ApiPaymentActionOrderByWithAggregationInput | ApiPaymentActionOrderByWithAggregationInput[]
    by: ApiPaymentActionScalarFieldEnum[] | ApiPaymentActionScalarFieldEnum
    having?: ApiPaymentActionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiPaymentActionCountAggregateInputType | true
    _min?: ApiPaymentActionMinAggregateInputType
    _max?: ApiPaymentActionMaxAggregateInputType
  }

  export type ApiPaymentActionGroupByOutputType = {
    id: string
    bookingId: string
    actionType: string
    reminderType: string | null
    notes: string | null
    timestamp: Date
    _count: ApiPaymentActionCountAggregateOutputType | null
    _min: ApiPaymentActionMinAggregateOutputType | null
    _max: ApiPaymentActionMaxAggregateOutputType | null
  }

  type GetApiPaymentActionGroupByPayload<T extends ApiPaymentActionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiPaymentActionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiPaymentActionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiPaymentActionGroupByOutputType[P]>
            : GetScalarType<T[P], ApiPaymentActionGroupByOutputType[P]>
        }
      >
    >


  export type ApiPaymentActionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    actionType?: boolean
    reminderType?: boolean
    notes?: boolean
    timestamp?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiPaymentAction"]>

  export type ApiPaymentActionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    actionType?: boolean
    reminderType?: boolean
    notes?: boolean
    timestamp?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiPaymentAction"]>

  export type ApiPaymentActionSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    actionType?: boolean
    reminderType?: boolean
    notes?: boolean
    timestamp?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiPaymentAction"]>

  export type ApiPaymentActionSelectScalar = {
    id?: boolean
    bookingId?: boolean
    actionType?: boolean
    reminderType?: boolean
    notes?: boolean
    timestamp?: boolean
  }

  export type ApiPaymentActionOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "actionType" | "reminderType" | "notes" | "timestamp", ExtArgs["result"]["apiPaymentAction"]>
  export type ApiPaymentActionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiPaymentActionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiPaymentActionIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }

  export type $ApiPaymentActionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiPaymentAction"
    objects: {
      booking: Prisma.$ApiBookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      actionType: string
      reminderType: string | null
      notes: string | null
      timestamp: Date
    }, ExtArgs["result"]["apiPaymentAction"]>
    composites: {}
  }

  type ApiPaymentActionGetPayload<S extends boolean | null | undefined | ApiPaymentActionDefaultArgs> = $Result.GetResult<Prisma.$ApiPaymentActionPayload, S>

  type ApiPaymentActionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiPaymentActionFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiPaymentActionCountAggregateInputType | true
    }

  export interface ApiPaymentActionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiPaymentAction'], meta: { name: 'ApiPaymentAction' } }
    /**
     * Find zero or one ApiPaymentAction that matches the filter.
     * @param {ApiPaymentActionFindUniqueArgs} args - Arguments to find a ApiPaymentAction
     * @example
     * // Get one ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiPaymentActionFindUniqueArgs>(args: SelectSubset<T, ApiPaymentActionFindUniqueArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiPaymentAction that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiPaymentActionFindUniqueOrThrowArgs} args - Arguments to find a ApiPaymentAction
     * @example
     * // Get one ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiPaymentActionFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiPaymentActionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiPaymentAction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionFindFirstArgs} args - Arguments to find a ApiPaymentAction
     * @example
     * // Get one ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiPaymentActionFindFirstArgs>(args?: SelectSubset<T, ApiPaymentActionFindFirstArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiPaymentAction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionFindFirstOrThrowArgs} args - Arguments to find a ApiPaymentAction
     * @example
     * // Get one ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiPaymentActionFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiPaymentActionFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiPaymentActions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiPaymentActions
     * const apiPaymentActions = await prisma.apiPaymentAction.findMany()
     * 
     * // Get first 10 ApiPaymentActions
     * const apiPaymentActions = await prisma.apiPaymentAction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiPaymentActionWithIdOnly = await prisma.apiPaymentAction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiPaymentActionFindManyArgs>(args?: SelectSubset<T, ApiPaymentActionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiPaymentAction.
     * @param {ApiPaymentActionCreateArgs} args - Arguments to create a ApiPaymentAction.
     * @example
     * // Create one ApiPaymentAction
     * const ApiPaymentAction = await prisma.apiPaymentAction.create({
     *   data: {
     *     // ... data to create a ApiPaymentAction
     *   }
     * })
     * 
     */
    create<T extends ApiPaymentActionCreateArgs>(args: SelectSubset<T, ApiPaymentActionCreateArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiPaymentActions.
     * @param {ApiPaymentActionCreateManyArgs} args - Arguments to create many ApiPaymentActions.
     * @example
     * // Create many ApiPaymentActions
     * const apiPaymentAction = await prisma.apiPaymentAction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiPaymentActionCreateManyArgs>(args?: SelectSubset<T, ApiPaymentActionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiPaymentActions and returns the data saved in the database.
     * @param {ApiPaymentActionCreateManyAndReturnArgs} args - Arguments to create many ApiPaymentActions.
     * @example
     * // Create many ApiPaymentActions
     * const apiPaymentAction = await prisma.apiPaymentAction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiPaymentActions and only return the `id`
     * const apiPaymentActionWithIdOnly = await prisma.apiPaymentAction.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiPaymentActionCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiPaymentActionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiPaymentAction.
     * @param {ApiPaymentActionDeleteArgs} args - Arguments to delete one ApiPaymentAction.
     * @example
     * // Delete one ApiPaymentAction
     * const ApiPaymentAction = await prisma.apiPaymentAction.delete({
     *   where: {
     *     // ... filter to delete one ApiPaymentAction
     *   }
     * })
     * 
     */
    delete<T extends ApiPaymentActionDeleteArgs>(args: SelectSubset<T, ApiPaymentActionDeleteArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiPaymentAction.
     * @param {ApiPaymentActionUpdateArgs} args - Arguments to update one ApiPaymentAction.
     * @example
     * // Update one ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiPaymentActionUpdateArgs>(args: SelectSubset<T, ApiPaymentActionUpdateArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiPaymentActions.
     * @param {ApiPaymentActionDeleteManyArgs} args - Arguments to filter ApiPaymentActions to delete.
     * @example
     * // Delete a few ApiPaymentActions
     * const { count } = await prisma.apiPaymentAction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiPaymentActionDeleteManyArgs>(args?: SelectSubset<T, ApiPaymentActionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiPaymentActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiPaymentActions
     * const apiPaymentAction = await prisma.apiPaymentAction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiPaymentActionUpdateManyArgs>(args: SelectSubset<T, ApiPaymentActionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiPaymentActions and returns the data updated in the database.
     * @param {ApiPaymentActionUpdateManyAndReturnArgs} args - Arguments to update many ApiPaymentActions.
     * @example
     * // Update many ApiPaymentActions
     * const apiPaymentAction = await prisma.apiPaymentAction.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiPaymentActions and only return the `id`
     * const apiPaymentActionWithIdOnly = await prisma.apiPaymentAction.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiPaymentActionUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiPaymentActionUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiPaymentAction.
     * @param {ApiPaymentActionUpsertArgs} args - Arguments to update or create a ApiPaymentAction.
     * @example
     * // Update or create a ApiPaymentAction
     * const apiPaymentAction = await prisma.apiPaymentAction.upsert({
     *   create: {
     *     // ... data to create a ApiPaymentAction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiPaymentAction we want to update
     *   }
     * })
     */
    upsert<T extends ApiPaymentActionUpsertArgs>(args: SelectSubset<T, ApiPaymentActionUpsertArgs<ExtArgs>>): Prisma__ApiPaymentActionClient<$Result.GetResult<Prisma.$ApiPaymentActionPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiPaymentActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionCountArgs} args - Arguments to filter ApiPaymentActions to count.
     * @example
     * // Count the number of ApiPaymentActions
     * const count = await prisma.apiPaymentAction.count({
     *   where: {
     *     // ... the filter for the ApiPaymentActions we want to count
     *   }
     * })
    **/
    count<T extends ApiPaymentActionCountArgs>(
      args?: Subset<T, ApiPaymentActionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiPaymentActionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiPaymentAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiPaymentActionAggregateArgs>(args: Subset<T, ApiPaymentActionAggregateArgs>): Prisma.PrismaPromise<GetApiPaymentActionAggregateType<T>>

    /**
     * Group by ApiPaymentAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiPaymentActionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiPaymentActionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiPaymentActionGroupByArgs['orderBy'] }
        : { orderBy?: ApiPaymentActionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiPaymentActionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiPaymentActionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiPaymentAction model
   */
  readonly fields: ApiPaymentActionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiPaymentAction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiPaymentActionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends ApiBookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApiBookingDefaultArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiPaymentAction model
   */
  interface ApiPaymentActionFieldRefs {
    readonly id: FieldRef<"ApiPaymentAction", 'String'>
    readonly bookingId: FieldRef<"ApiPaymentAction", 'String'>
    readonly actionType: FieldRef<"ApiPaymentAction", 'String'>
    readonly reminderType: FieldRef<"ApiPaymentAction", 'String'>
    readonly notes: FieldRef<"ApiPaymentAction", 'String'>
    readonly timestamp: FieldRef<"ApiPaymentAction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ApiPaymentAction findUnique
   */
  export type ApiPaymentActionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter, which ApiPaymentAction to fetch.
     */
    where: ApiPaymentActionWhereUniqueInput
  }

  /**
   * ApiPaymentAction findUniqueOrThrow
   */
  export type ApiPaymentActionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter, which ApiPaymentAction to fetch.
     */
    where: ApiPaymentActionWhereUniqueInput
  }

  /**
   * ApiPaymentAction findFirst
   */
  export type ApiPaymentActionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter, which ApiPaymentAction to fetch.
     */
    where?: ApiPaymentActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPaymentActions to fetch.
     */
    orderBy?: ApiPaymentActionOrderByWithRelationInput | ApiPaymentActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiPaymentActions.
     */
    cursor?: ApiPaymentActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPaymentActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPaymentActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiPaymentActions.
     */
    distinct?: ApiPaymentActionScalarFieldEnum | ApiPaymentActionScalarFieldEnum[]
  }

  /**
   * ApiPaymentAction findFirstOrThrow
   */
  export type ApiPaymentActionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter, which ApiPaymentAction to fetch.
     */
    where?: ApiPaymentActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPaymentActions to fetch.
     */
    orderBy?: ApiPaymentActionOrderByWithRelationInput | ApiPaymentActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiPaymentActions.
     */
    cursor?: ApiPaymentActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPaymentActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPaymentActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiPaymentActions.
     */
    distinct?: ApiPaymentActionScalarFieldEnum | ApiPaymentActionScalarFieldEnum[]
  }

  /**
   * ApiPaymentAction findMany
   */
  export type ApiPaymentActionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter, which ApiPaymentActions to fetch.
     */
    where?: ApiPaymentActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiPaymentActions to fetch.
     */
    orderBy?: ApiPaymentActionOrderByWithRelationInput | ApiPaymentActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiPaymentActions.
     */
    cursor?: ApiPaymentActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiPaymentActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiPaymentActions.
     */
    skip?: number
    distinct?: ApiPaymentActionScalarFieldEnum | ApiPaymentActionScalarFieldEnum[]
  }

  /**
   * ApiPaymentAction create
   */
  export type ApiPaymentActionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * The data needed to create a ApiPaymentAction.
     */
    data: XOR<ApiPaymentActionCreateInput, ApiPaymentActionUncheckedCreateInput>
  }

  /**
   * ApiPaymentAction createMany
   */
  export type ApiPaymentActionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiPaymentActions.
     */
    data: ApiPaymentActionCreateManyInput | ApiPaymentActionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiPaymentAction createManyAndReturn
   */
  export type ApiPaymentActionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * The data used to create many ApiPaymentActions.
     */
    data: ApiPaymentActionCreateManyInput | ApiPaymentActionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiPaymentAction update
   */
  export type ApiPaymentActionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * The data needed to update a ApiPaymentAction.
     */
    data: XOR<ApiPaymentActionUpdateInput, ApiPaymentActionUncheckedUpdateInput>
    /**
     * Choose, which ApiPaymentAction to update.
     */
    where: ApiPaymentActionWhereUniqueInput
  }

  /**
   * ApiPaymentAction updateMany
   */
  export type ApiPaymentActionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiPaymentActions.
     */
    data: XOR<ApiPaymentActionUpdateManyMutationInput, ApiPaymentActionUncheckedUpdateManyInput>
    /**
     * Filter which ApiPaymentActions to update
     */
    where?: ApiPaymentActionWhereInput
    /**
     * Limit how many ApiPaymentActions to update.
     */
    limit?: number
  }

  /**
   * ApiPaymentAction updateManyAndReturn
   */
  export type ApiPaymentActionUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * The data used to update ApiPaymentActions.
     */
    data: XOR<ApiPaymentActionUpdateManyMutationInput, ApiPaymentActionUncheckedUpdateManyInput>
    /**
     * Filter which ApiPaymentActions to update
     */
    where?: ApiPaymentActionWhereInput
    /**
     * Limit how many ApiPaymentActions to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiPaymentAction upsert
   */
  export type ApiPaymentActionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * The filter to search for the ApiPaymentAction to update in case it exists.
     */
    where: ApiPaymentActionWhereUniqueInput
    /**
     * In case the ApiPaymentAction found by the `where` argument doesn't exist, create a new ApiPaymentAction with this data.
     */
    create: XOR<ApiPaymentActionCreateInput, ApiPaymentActionUncheckedCreateInput>
    /**
     * In case the ApiPaymentAction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiPaymentActionUpdateInput, ApiPaymentActionUncheckedUpdateInput>
  }

  /**
   * ApiPaymentAction delete
   */
  export type ApiPaymentActionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
    /**
     * Filter which ApiPaymentAction to delete.
     */
    where: ApiPaymentActionWhereUniqueInput
  }

  /**
   * ApiPaymentAction deleteMany
   */
  export type ApiPaymentActionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiPaymentActions to delete
     */
    where?: ApiPaymentActionWhereInput
    /**
     * Limit how many ApiPaymentActions to delete.
     */
    limit?: number
  }

  /**
   * ApiPaymentAction without action
   */
  export type ApiPaymentActionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiPaymentAction
     */
    select?: ApiPaymentActionSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiPaymentAction
     */
    omit?: ApiPaymentActionOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiPaymentActionInclude<ExtArgs> | null
  }


  /**
   * Model ApiWorkflowTrigger
   */

  export type AggregateApiWorkflowTrigger = {
    _count: ApiWorkflowTriggerCountAggregateOutputType | null
    _min: ApiWorkflowTriggerMinAggregateOutputType | null
    _max: ApiWorkflowTriggerMaxAggregateOutputType | null
  }

  export type ApiWorkflowTriggerMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    workflowName: string | null
    status: string | null
    triggeredAt: Date | null
    completedAt: Date | null
    errorMessage: string | null
  }

  export type ApiWorkflowTriggerMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    workflowName: string | null
    status: string | null
    triggeredAt: Date | null
    completedAt: Date | null
    errorMessage: string | null
  }

  export type ApiWorkflowTriggerCountAggregateOutputType = {
    id: number
    bookingId: number
    workflowName: number
    status: number
    triggeredAt: number
    completedAt: number
    errorMessage: number
    _all: number
  }


  export type ApiWorkflowTriggerMinAggregateInputType = {
    id?: true
    bookingId?: true
    workflowName?: true
    status?: true
    triggeredAt?: true
    completedAt?: true
    errorMessage?: true
  }

  export type ApiWorkflowTriggerMaxAggregateInputType = {
    id?: true
    bookingId?: true
    workflowName?: true
    status?: true
    triggeredAt?: true
    completedAt?: true
    errorMessage?: true
  }

  export type ApiWorkflowTriggerCountAggregateInputType = {
    id?: true
    bookingId?: true
    workflowName?: true
    status?: true
    triggeredAt?: true
    completedAt?: true
    errorMessage?: true
    _all?: true
  }

  export type ApiWorkflowTriggerAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiWorkflowTrigger to aggregate.
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiWorkflowTriggers to fetch.
     */
    orderBy?: ApiWorkflowTriggerOrderByWithRelationInput | ApiWorkflowTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiWorkflowTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiWorkflowTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiWorkflowTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiWorkflowTriggers
    **/
    _count?: true | ApiWorkflowTriggerCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiWorkflowTriggerMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiWorkflowTriggerMaxAggregateInputType
  }

  export type GetApiWorkflowTriggerAggregateType<T extends ApiWorkflowTriggerAggregateArgs> = {
        [P in keyof T & keyof AggregateApiWorkflowTrigger]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiWorkflowTrigger[P]>
      : GetScalarType<T[P], AggregateApiWorkflowTrigger[P]>
  }




  export type ApiWorkflowTriggerGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiWorkflowTriggerWhereInput
    orderBy?: ApiWorkflowTriggerOrderByWithAggregationInput | ApiWorkflowTriggerOrderByWithAggregationInput[]
    by: ApiWorkflowTriggerScalarFieldEnum[] | ApiWorkflowTriggerScalarFieldEnum
    having?: ApiWorkflowTriggerScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiWorkflowTriggerCountAggregateInputType | true
    _min?: ApiWorkflowTriggerMinAggregateInputType
    _max?: ApiWorkflowTriggerMaxAggregateInputType
  }

  export type ApiWorkflowTriggerGroupByOutputType = {
    id: string
    bookingId: string
    workflowName: string
    status: string
    triggeredAt: Date
    completedAt: Date | null
    errorMessage: string | null
    _count: ApiWorkflowTriggerCountAggregateOutputType | null
    _min: ApiWorkflowTriggerMinAggregateOutputType | null
    _max: ApiWorkflowTriggerMaxAggregateOutputType | null
  }

  type GetApiWorkflowTriggerGroupByPayload<T extends ApiWorkflowTriggerGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiWorkflowTriggerGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiWorkflowTriggerGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiWorkflowTriggerGroupByOutputType[P]>
            : GetScalarType<T[P], ApiWorkflowTriggerGroupByOutputType[P]>
        }
      >
    >


  export type ApiWorkflowTriggerSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    workflowName?: boolean
    status?: boolean
    triggeredAt?: boolean
    completedAt?: boolean
    errorMessage?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiWorkflowTrigger"]>

  export type ApiWorkflowTriggerSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    workflowName?: boolean
    status?: boolean
    triggeredAt?: boolean
    completedAt?: boolean
    errorMessage?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiWorkflowTrigger"]>

  export type ApiWorkflowTriggerSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    workflowName?: boolean
    status?: boolean
    triggeredAt?: boolean
    completedAt?: boolean
    errorMessage?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiWorkflowTrigger"]>

  export type ApiWorkflowTriggerSelectScalar = {
    id?: boolean
    bookingId?: boolean
    workflowName?: boolean
    status?: boolean
    triggeredAt?: boolean
    completedAt?: boolean
    errorMessage?: boolean
  }

  export type ApiWorkflowTriggerOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "workflowName" | "status" | "triggeredAt" | "completedAt" | "errorMessage", ExtArgs["result"]["apiWorkflowTrigger"]>
  export type ApiWorkflowTriggerInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiWorkflowTriggerIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiWorkflowTriggerIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }

  export type $ApiWorkflowTriggerPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiWorkflowTrigger"
    objects: {
      booking: Prisma.$ApiBookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      workflowName: string
      status: string
      triggeredAt: Date
      completedAt: Date | null
      errorMessage: string | null
    }, ExtArgs["result"]["apiWorkflowTrigger"]>
    composites: {}
  }

  type ApiWorkflowTriggerGetPayload<S extends boolean | null | undefined | ApiWorkflowTriggerDefaultArgs> = $Result.GetResult<Prisma.$ApiWorkflowTriggerPayload, S>

  type ApiWorkflowTriggerCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiWorkflowTriggerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiWorkflowTriggerCountAggregateInputType | true
    }

  export interface ApiWorkflowTriggerDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiWorkflowTrigger'], meta: { name: 'ApiWorkflowTrigger' } }
    /**
     * Find zero or one ApiWorkflowTrigger that matches the filter.
     * @param {ApiWorkflowTriggerFindUniqueArgs} args - Arguments to find a ApiWorkflowTrigger
     * @example
     * // Get one ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiWorkflowTriggerFindUniqueArgs>(args: SelectSubset<T, ApiWorkflowTriggerFindUniqueArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiWorkflowTrigger that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiWorkflowTriggerFindUniqueOrThrowArgs} args - Arguments to find a ApiWorkflowTrigger
     * @example
     * // Get one ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiWorkflowTriggerFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiWorkflowTriggerFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiWorkflowTrigger that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerFindFirstArgs} args - Arguments to find a ApiWorkflowTrigger
     * @example
     * // Get one ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiWorkflowTriggerFindFirstArgs>(args?: SelectSubset<T, ApiWorkflowTriggerFindFirstArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiWorkflowTrigger that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerFindFirstOrThrowArgs} args - Arguments to find a ApiWorkflowTrigger
     * @example
     * // Get one ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiWorkflowTriggerFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiWorkflowTriggerFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiWorkflowTriggers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiWorkflowTriggers
     * const apiWorkflowTriggers = await prisma.apiWorkflowTrigger.findMany()
     * 
     * // Get first 10 ApiWorkflowTriggers
     * const apiWorkflowTriggers = await prisma.apiWorkflowTrigger.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiWorkflowTriggerWithIdOnly = await prisma.apiWorkflowTrigger.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiWorkflowTriggerFindManyArgs>(args?: SelectSubset<T, ApiWorkflowTriggerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiWorkflowTrigger.
     * @param {ApiWorkflowTriggerCreateArgs} args - Arguments to create a ApiWorkflowTrigger.
     * @example
     * // Create one ApiWorkflowTrigger
     * const ApiWorkflowTrigger = await prisma.apiWorkflowTrigger.create({
     *   data: {
     *     // ... data to create a ApiWorkflowTrigger
     *   }
     * })
     * 
     */
    create<T extends ApiWorkflowTriggerCreateArgs>(args: SelectSubset<T, ApiWorkflowTriggerCreateArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiWorkflowTriggers.
     * @param {ApiWorkflowTriggerCreateManyArgs} args - Arguments to create many ApiWorkflowTriggers.
     * @example
     * // Create many ApiWorkflowTriggers
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiWorkflowTriggerCreateManyArgs>(args?: SelectSubset<T, ApiWorkflowTriggerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiWorkflowTriggers and returns the data saved in the database.
     * @param {ApiWorkflowTriggerCreateManyAndReturnArgs} args - Arguments to create many ApiWorkflowTriggers.
     * @example
     * // Create many ApiWorkflowTriggers
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiWorkflowTriggers and only return the `id`
     * const apiWorkflowTriggerWithIdOnly = await prisma.apiWorkflowTrigger.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiWorkflowTriggerCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiWorkflowTriggerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiWorkflowTrigger.
     * @param {ApiWorkflowTriggerDeleteArgs} args - Arguments to delete one ApiWorkflowTrigger.
     * @example
     * // Delete one ApiWorkflowTrigger
     * const ApiWorkflowTrigger = await prisma.apiWorkflowTrigger.delete({
     *   where: {
     *     // ... filter to delete one ApiWorkflowTrigger
     *   }
     * })
     * 
     */
    delete<T extends ApiWorkflowTriggerDeleteArgs>(args: SelectSubset<T, ApiWorkflowTriggerDeleteArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiWorkflowTrigger.
     * @param {ApiWorkflowTriggerUpdateArgs} args - Arguments to update one ApiWorkflowTrigger.
     * @example
     * // Update one ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiWorkflowTriggerUpdateArgs>(args: SelectSubset<T, ApiWorkflowTriggerUpdateArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiWorkflowTriggers.
     * @param {ApiWorkflowTriggerDeleteManyArgs} args - Arguments to filter ApiWorkflowTriggers to delete.
     * @example
     * // Delete a few ApiWorkflowTriggers
     * const { count } = await prisma.apiWorkflowTrigger.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiWorkflowTriggerDeleteManyArgs>(args?: SelectSubset<T, ApiWorkflowTriggerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiWorkflowTriggers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiWorkflowTriggers
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiWorkflowTriggerUpdateManyArgs>(args: SelectSubset<T, ApiWorkflowTriggerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiWorkflowTriggers and returns the data updated in the database.
     * @param {ApiWorkflowTriggerUpdateManyAndReturnArgs} args - Arguments to update many ApiWorkflowTriggers.
     * @example
     * // Update many ApiWorkflowTriggers
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiWorkflowTriggers and only return the `id`
     * const apiWorkflowTriggerWithIdOnly = await prisma.apiWorkflowTrigger.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiWorkflowTriggerUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiWorkflowTriggerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiWorkflowTrigger.
     * @param {ApiWorkflowTriggerUpsertArgs} args - Arguments to update or create a ApiWorkflowTrigger.
     * @example
     * // Update or create a ApiWorkflowTrigger
     * const apiWorkflowTrigger = await prisma.apiWorkflowTrigger.upsert({
     *   create: {
     *     // ... data to create a ApiWorkflowTrigger
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiWorkflowTrigger we want to update
     *   }
     * })
     */
    upsert<T extends ApiWorkflowTriggerUpsertArgs>(args: SelectSubset<T, ApiWorkflowTriggerUpsertArgs<ExtArgs>>): Prisma__ApiWorkflowTriggerClient<$Result.GetResult<Prisma.$ApiWorkflowTriggerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiWorkflowTriggers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerCountArgs} args - Arguments to filter ApiWorkflowTriggers to count.
     * @example
     * // Count the number of ApiWorkflowTriggers
     * const count = await prisma.apiWorkflowTrigger.count({
     *   where: {
     *     // ... the filter for the ApiWorkflowTriggers we want to count
     *   }
     * })
    **/
    count<T extends ApiWorkflowTriggerCountArgs>(
      args?: Subset<T, ApiWorkflowTriggerCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiWorkflowTriggerCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiWorkflowTrigger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiWorkflowTriggerAggregateArgs>(args: Subset<T, ApiWorkflowTriggerAggregateArgs>): Prisma.PrismaPromise<GetApiWorkflowTriggerAggregateType<T>>

    /**
     * Group by ApiWorkflowTrigger.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiWorkflowTriggerGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiWorkflowTriggerGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiWorkflowTriggerGroupByArgs['orderBy'] }
        : { orderBy?: ApiWorkflowTriggerGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiWorkflowTriggerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiWorkflowTriggerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiWorkflowTrigger model
   */
  readonly fields: ApiWorkflowTriggerFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiWorkflowTrigger.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiWorkflowTriggerClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends ApiBookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApiBookingDefaultArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiWorkflowTrigger model
   */
  interface ApiWorkflowTriggerFieldRefs {
    readonly id: FieldRef<"ApiWorkflowTrigger", 'String'>
    readonly bookingId: FieldRef<"ApiWorkflowTrigger", 'String'>
    readonly workflowName: FieldRef<"ApiWorkflowTrigger", 'String'>
    readonly status: FieldRef<"ApiWorkflowTrigger", 'String'>
    readonly triggeredAt: FieldRef<"ApiWorkflowTrigger", 'DateTime'>
    readonly completedAt: FieldRef<"ApiWorkflowTrigger", 'DateTime'>
    readonly errorMessage: FieldRef<"ApiWorkflowTrigger", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ApiWorkflowTrigger findUnique
   */
  export type ApiWorkflowTriggerFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter, which ApiWorkflowTrigger to fetch.
     */
    where: ApiWorkflowTriggerWhereUniqueInput
  }

  /**
   * ApiWorkflowTrigger findUniqueOrThrow
   */
  export type ApiWorkflowTriggerFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter, which ApiWorkflowTrigger to fetch.
     */
    where: ApiWorkflowTriggerWhereUniqueInput
  }

  /**
   * ApiWorkflowTrigger findFirst
   */
  export type ApiWorkflowTriggerFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter, which ApiWorkflowTrigger to fetch.
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiWorkflowTriggers to fetch.
     */
    orderBy?: ApiWorkflowTriggerOrderByWithRelationInput | ApiWorkflowTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiWorkflowTriggers.
     */
    cursor?: ApiWorkflowTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiWorkflowTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiWorkflowTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiWorkflowTriggers.
     */
    distinct?: ApiWorkflowTriggerScalarFieldEnum | ApiWorkflowTriggerScalarFieldEnum[]
  }

  /**
   * ApiWorkflowTrigger findFirstOrThrow
   */
  export type ApiWorkflowTriggerFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter, which ApiWorkflowTrigger to fetch.
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiWorkflowTriggers to fetch.
     */
    orderBy?: ApiWorkflowTriggerOrderByWithRelationInput | ApiWorkflowTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiWorkflowTriggers.
     */
    cursor?: ApiWorkflowTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiWorkflowTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiWorkflowTriggers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiWorkflowTriggers.
     */
    distinct?: ApiWorkflowTriggerScalarFieldEnum | ApiWorkflowTriggerScalarFieldEnum[]
  }

  /**
   * ApiWorkflowTrigger findMany
   */
  export type ApiWorkflowTriggerFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter, which ApiWorkflowTriggers to fetch.
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiWorkflowTriggers to fetch.
     */
    orderBy?: ApiWorkflowTriggerOrderByWithRelationInput | ApiWorkflowTriggerOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiWorkflowTriggers.
     */
    cursor?: ApiWorkflowTriggerWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiWorkflowTriggers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiWorkflowTriggers.
     */
    skip?: number
    distinct?: ApiWorkflowTriggerScalarFieldEnum | ApiWorkflowTriggerScalarFieldEnum[]
  }

  /**
   * ApiWorkflowTrigger create
   */
  export type ApiWorkflowTriggerCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * The data needed to create a ApiWorkflowTrigger.
     */
    data: XOR<ApiWorkflowTriggerCreateInput, ApiWorkflowTriggerUncheckedCreateInput>
  }

  /**
   * ApiWorkflowTrigger createMany
   */
  export type ApiWorkflowTriggerCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiWorkflowTriggers.
     */
    data: ApiWorkflowTriggerCreateManyInput | ApiWorkflowTriggerCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiWorkflowTrigger createManyAndReturn
   */
  export type ApiWorkflowTriggerCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * The data used to create many ApiWorkflowTriggers.
     */
    data: ApiWorkflowTriggerCreateManyInput | ApiWorkflowTriggerCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiWorkflowTrigger update
   */
  export type ApiWorkflowTriggerUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * The data needed to update a ApiWorkflowTrigger.
     */
    data: XOR<ApiWorkflowTriggerUpdateInput, ApiWorkflowTriggerUncheckedUpdateInput>
    /**
     * Choose, which ApiWorkflowTrigger to update.
     */
    where: ApiWorkflowTriggerWhereUniqueInput
  }

  /**
   * ApiWorkflowTrigger updateMany
   */
  export type ApiWorkflowTriggerUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiWorkflowTriggers.
     */
    data: XOR<ApiWorkflowTriggerUpdateManyMutationInput, ApiWorkflowTriggerUncheckedUpdateManyInput>
    /**
     * Filter which ApiWorkflowTriggers to update
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * Limit how many ApiWorkflowTriggers to update.
     */
    limit?: number
  }

  /**
   * ApiWorkflowTrigger updateManyAndReturn
   */
  export type ApiWorkflowTriggerUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * The data used to update ApiWorkflowTriggers.
     */
    data: XOR<ApiWorkflowTriggerUpdateManyMutationInput, ApiWorkflowTriggerUncheckedUpdateManyInput>
    /**
     * Filter which ApiWorkflowTriggers to update
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * Limit how many ApiWorkflowTriggers to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiWorkflowTrigger upsert
   */
  export type ApiWorkflowTriggerUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * The filter to search for the ApiWorkflowTrigger to update in case it exists.
     */
    where: ApiWorkflowTriggerWhereUniqueInput
    /**
     * In case the ApiWorkflowTrigger found by the `where` argument doesn't exist, create a new ApiWorkflowTrigger with this data.
     */
    create: XOR<ApiWorkflowTriggerCreateInput, ApiWorkflowTriggerUncheckedCreateInput>
    /**
     * In case the ApiWorkflowTrigger was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiWorkflowTriggerUpdateInput, ApiWorkflowTriggerUncheckedUpdateInput>
  }

  /**
   * ApiWorkflowTrigger delete
   */
  export type ApiWorkflowTriggerDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
    /**
     * Filter which ApiWorkflowTrigger to delete.
     */
    where: ApiWorkflowTriggerWhereUniqueInput
  }

  /**
   * ApiWorkflowTrigger deleteMany
   */
  export type ApiWorkflowTriggerDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiWorkflowTriggers to delete
     */
    where?: ApiWorkflowTriggerWhereInput
    /**
     * Limit how many ApiWorkflowTriggers to delete.
     */
    limit?: number
  }

  /**
   * ApiWorkflowTrigger without action
   */
  export type ApiWorkflowTriggerDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiWorkflowTrigger
     */
    select?: ApiWorkflowTriggerSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiWorkflowTrigger
     */
    omit?: ApiWorkflowTriggerOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiWorkflowTriggerInclude<ExtArgs> | null
  }


  /**
   * Model ApiBookingDocument
   */

  export type AggregateApiBookingDocument = {
    _count: ApiBookingDocumentCountAggregateOutputType | null
    _avg: ApiBookingDocumentAvgAggregateOutputType | null
    _sum: ApiBookingDocumentSumAggregateOutputType | null
    _min: ApiBookingDocumentMinAggregateOutputType | null
    _max: ApiBookingDocumentMaxAggregateOutputType | null
  }

  export type ApiBookingDocumentAvgAggregateOutputType = {
    count: number | null
  }

  export type ApiBookingDocumentSumAggregateOutputType = {
    count: number | null
  }

  export type ApiBookingDocumentMinAggregateOutputType = {
    id: string | null
    bookingId: string | null
    name: string | null
    type: string | null
    count: number | null
  }

  export type ApiBookingDocumentMaxAggregateOutputType = {
    id: string | null
    bookingId: string | null
    name: string | null
    type: string | null
    count: number | null
  }

  export type ApiBookingDocumentCountAggregateOutputType = {
    id: number
    bookingId: number
    name: number
    type: number
    count: number
    _all: number
  }


  export type ApiBookingDocumentAvgAggregateInputType = {
    count?: true
  }

  export type ApiBookingDocumentSumAggregateInputType = {
    count?: true
  }

  export type ApiBookingDocumentMinAggregateInputType = {
    id?: true
    bookingId?: true
    name?: true
    type?: true
    count?: true
  }

  export type ApiBookingDocumentMaxAggregateInputType = {
    id?: true
    bookingId?: true
    name?: true
    type?: true
    count?: true
  }

  export type ApiBookingDocumentCountAggregateInputType = {
    id?: true
    bookingId?: true
    name?: true
    type?: true
    count?: true
    _all?: true
  }

  export type ApiBookingDocumentAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBookingDocument to aggregate.
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookingDocuments to fetch.
     */
    orderBy?: ApiBookingDocumentOrderByWithRelationInput | ApiBookingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiBookingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiBookingDocuments
    **/
    _count?: true | ApiBookingDocumentCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApiBookingDocumentAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApiBookingDocumentSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiBookingDocumentMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiBookingDocumentMaxAggregateInputType
  }

  export type GetApiBookingDocumentAggregateType<T extends ApiBookingDocumentAggregateArgs> = {
        [P in keyof T & keyof AggregateApiBookingDocument]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiBookingDocument[P]>
      : GetScalarType<T[P], AggregateApiBookingDocument[P]>
  }




  export type ApiBookingDocumentGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiBookingDocumentWhereInput
    orderBy?: ApiBookingDocumentOrderByWithAggregationInput | ApiBookingDocumentOrderByWithAggregationInput[]
    by: ApiBookingDocumentScalarFieldEnum[] | ApiBookingDocumentScalarFieldEnum
    having?: ApiBookingDocumentScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiBookingDocumentCountAggregateInputType | true
    _avg?: ApiBookingDocumentAvgAggregateInputType
    _sum?: ApiBookingDocumentSumAggregateInputType
    _min?: ApiBookingDocumentMinAggregateInputType
    _max?: ApiBookingDocumentMaxAggregateInputType
  }

  export type ApiBookingDocumentGroupByOutputType = {
    id: string
    bookingId: string
    name: string
    type: string
    count: number
    _count: ApiBookingDocumentCountAggregateOutputType | null
    _avg: ApiBookingDocumentAvgAggregateOutputType | null
    _sum: ApiBookingDocumentSumAggregateOutputType | null
    _min: ApiBookingDocumentMinAggregateOutputType | null
    _max: ApiBookingDocumentMaxAggregateOutputType | null
  }

  type GetApiBookingDocumentGroupByPayload<T extends ApiBookingDocumentGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiBookingDocumentGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiBookingDocumentGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiBookingDocumentGroupByOutputType[P]>
            : GetScalarType<T[P], ApiBookingDocumentGroupByOutputType[P]>
        }
      >
    >


  export type ApiBookingDocumentSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    name?: boolean
    type?: boolean
    count?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiBookingDocument"]>

  export type ApiBookingDocumentSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    name?: boolean
    type?: boolean
    count?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiBookingDocument"]>

  export type ApiBookingDocumentSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    bookingId?: boolean
    name?: boolean
    type?: boolean
    count?: boolean
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["apiBookingDocument"]>

  export type ApiBookingDocumentSelectScalar = {
    id?: boolean
    bookingId?: boolean
    name?: boolean
    type?: boolean
    count?: boolean
  }

  export type ApiBookingDocumentOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "bookingId" | "name" | "type" | "count", ExtArgs["result"]["apiBookingDocument"]>
  export type ApiBookingDocumentInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiBookingDocumentIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }
  export type ApiBookingDocumentIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    booking?: boolean | ApiBookingDefaultArgs<ExtArgs>
  }

  export type $ApiBookingDocumentPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiBookingDocument"
    objects: {
      booking: Prisma.$ApiBookingPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      bookingId: string
      name: string
      type: string
      count: number
    }, ExtArgs["result"]["apiBookingDocument"]>
    composites: {}
  }

  type ApiBookingDocumentGetPayload<S extends boolean | null | undefined | ApiBookingDocumentDefaultArgs> = $Result.GetResult<Prisma.$ApiBookingDocumentPayload, S>

  type ApiBookingDocumentCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiBookingDocumentFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiBookingDocumentCountAggregateInputType | true
    }

  export interface ApiBookingDocumentDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiBookingDocument'], meta: { name: 'ApiBookingDocument' } }
    /**
     * Find zero or one ApiBookingDocument that matches the filter.
     * @param {ApiBookingDocumentFindUniqueArgs} args - Arguments to find a ApiBookingDocument
     * @example
     * // Get one ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiBookingDocumentFindUniqueArgs>(args: SelectSubset<T, ApiBookingDocumentFindUniqueArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiBookingDocument that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiBookingDocumentFindUniqueOrThrowArgs} args - Arguments to find a ApiBookingDocument
     * @example
     * // Get one ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiBookingDocumentFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiBookingDocumentFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBookingDocument that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentFindFirstArgs} args - Arguments to find a ApiBookingDocument
     * @example
     * // Get one ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiBookingDocumentFindFirstArgs>(args?: SelectSubset<T, ApiBookingDocumentFindFirstArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBookingDocument that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentFindFirstOrThrowArgs} args - Arguments to find a ApiBookingDocument
     * @example
     * // Get one ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiBookingDocumentFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiBookingDocumentFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiBookingDocuments that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiBookingDocuments
     * const apiBookingDocuments = await prisma.apiBookingDocument.findMany()
     * 
     * // Get first 10 ApiBookingDocuments
     * const apiBookingDocuments = await prisma.apiBookingDocument.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiBookingDocumentWithIdOnly = await prisma.apiBookingDocument.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiBookingDocumentFindManyArgs>(args?: SelectSubset<T, ApiBookingDocumentFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiBookingDocument.
     * @param {ApiBookingDocumentCreateArgs} args - Arguments to create a ApiBookingDocument.
     * @example
     * // Create one ApiBookingDocument
     * const ApiBookingDocument = await prisma.apiBookingDocument.create({
     *   data: {
     *     // ... data to create a ApiBookingDocument
     *   }
     * })
     * 
     */
    create<T extends ApiBookingDocumentCreateArgs>(args: SelectSubset<T, ApiBookingDocumentCreateArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiBookingDocuments.
     * @param {ApiBookingDocumentCreateManyArgs} args - Arguments to create many ApiBookingDocuments.
     * @example
     * // Create many ApiBookingDocuments
     * const apiBookingDocument = await prisma.apiBookingDocument.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiBookingDocumentCreateManyArgs>(args?: SelectSubset<T, ApiBookingDocumentCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiBookingDocuments and returns the data saved in the database.
     * @param {ApiBookingDocumentCreateManyAndReturnArgs} args - Arguments to create many ApiBookingDocuments.
     * @example
     * // Create many ApiBookingDocuments
     * const apiBookingDocument = await prisma.apiBookingDocument.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiBookingDocuments and only return the `id`
     * const apiBookingDocumentWithIdOnly = await prisma.apiBookingDocument.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiBookingDocumentCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiBookingDocumentCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiBookingDocument.
     * @param {ApiBookingDocumentDeleteArgs} args - Arguments to delete one ApiBookingDocument.
     * @example
     * // Delete one ApiBookingDocument
     * const ApiBookingDocument = await prisma.apiBookingDocument.delete({
     *   where: {
     *     // ... filter to delete one ApiBookingDocument
     *   }
     * })
     * 
     */
    delete<T extends ApiBookingDocumentDeleteArgs>(args: SelectSubset<T, ApiBookingDocumentDeleteArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiBookingDocument.
     * @param {ApiBookingDocumentUpdateArgs} args - Arguments to update one ApiBookingDocument.
     * @example
     * // Update one ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiBookingDocumentUpdateArgs>(args: SelectSubset<T, ApiBookingDocumentUpdateArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiBookingDocuments.
     * @param {ApiBookingDocumentDeleteManyArgs} args - Arguments to filter ApiBookingDocuments to delete.
     * @example
     * // Delete a few ApiBookingDocuments
     * const { count } = await prisma.apiBookingDocument.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiBookingDocumentDeleteManyArgs>(args?: SelectSubset<T, ApiBookingDocumentDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBookingDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiBookingDocuments
     * const apiBookingDocument = await prisma.apiBookingDocument.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiBookingDocumentUpdateManyArgs>(args: SelectSubset<T, ApiBookingDocumentUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBookingDocuments and returns the data updated in the database.
     * @param {ApiBookingDocumentUpdateManyAndReturnArgs} args - Arguments to update many ApiBookingDocuments.
     * @example
     * // Update many ApiBookingDocuments
     * const apiBookingDocument = await prisma.apiBookingDocument.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiBookingDocuments and only return the `id`
     * const apiBookingDocumentWithIdOnly = await prisma.apiBookingDocument.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiBookingDocumentUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiBookingDocumentUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiBookingDocument.
     * @param {ApiBookingDocumentUpsertArgs} args - Arguments to update or create a ApiBookingDocument.
     * @example
     * // Update or create a ApiBookingDocument
     * const apiBookingDocument = await prisma.apiBookingDocument.upsert({
     *   create: {
     *     // ... data to create a ApiBookingDocument
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiBookingDocument we want to update
     *   }
     * })
     */
    upsert<T extends ApiBookingDocumentUpsertArgs>(args: SelectSubset<T, ApiBookingDocumentUpsertArgs<ExtArgs>>): Prisma__ApiBookingDocumentClient<$Result.GetResult<Prisma.$ApiBookingDocumentPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiBookingDocuments.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentCountArgs} args - Arguments to filter ApiBookingDocuments to count.
     * @example
     * // Count the number of ApiBookingDocuments
     * const count = await prisma.apiBookingDocument.count({
     *   where: {
     *     // ... the filter for the ApiBookingDocuments we want to count
     *   }
     * })
    **/
    count<T extends ApiBookingDocumentCountArgs>(
      args?: Subset<T, ApiBookingDocumentCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiBookingDocumentCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiBookingDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiBookingDocumentAggregateArgs>(args: Subset<T, ApiBookingDocumentAggregateArgs>): Prisma.PrismaPromise<GetApiBookingDocumentAggregateType<T>>

    /**
     * Group by ApiBookingDocument.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBookingDocumentGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiBookingDocumentGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiBookingDocumentGroupByArgs['orderBy'] }
        : { orderBy?: ApiBookingDocumentGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiBookingDocumentGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiBookingDocumentGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiBookingDocument model
   */
  readonly fields: ApiBookingDocumentFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiBookingDocument.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiBookingDocumentClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    booking<T extends ApiBookingDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ApiBookingDefaultArgs<ExtArgs>>): Prisma__ApiBookingClient<$Result.GetResult<Prisma.$ApiBookingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiBookingDocument model
   */
  interface ApiBookingDocumentFieldRefs {
    readonly id: FieldRef<"ApiBookingDocument", 'String'>
    readonly bookingId: FieldRef<"ApiBookingDocument", 'String'>
    readonly name: FieldRef<"ApiBookingDocument", 'String'>
    readonly type: FieldRef<"ApiBookingDocument", 'String'>
    readonly count: FieldRef<"ApiBookingDocument", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ApiBookingDocument findUnique
   */
  export type ApiBookingDocumentFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookingDocument to fetch.
     */
    where: ApiBookingDocumentWhereUniqueInput
  }

  /**
   * ApiBookingDocument findUniqueOrThrow
   */
  export type ApiBookingDocumentFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookingDocument to fetch.
     */
    where: ApiBookingDocumentWhereUniqueInput
  }

  /**
   * ApiBookingDocument findFirst
   */
  export type ApiBookingDocumentFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookingDocument to fetch.
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookingDocuments to fetch.
     */
    orderBy?: ApiBookingDocumentOrderByWithRelationInput | ApiBookingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBookingDocuments.
     */
    cursor?: ApiBookingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBookingDocuments.
     */
    distinct?: ApiBookingDocumentScalarFieldEnum | ApiBookingDocumentScalarFieldEnum[]
  }

  /**
   * ApiBookingDocument findFirstOrThrow
   */
  export type ApiBookingDocumentFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookingDocument to fetch.
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookingDocuments to fetch.
     */
    orderBy?: ApiBookingDocumentOrderByWithRelationInput | ApiBookingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBookingDocuments.
     */
    cursor?: ApiBookingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookingDocuments.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBookingDocuments.
     */
    distinct?: ApiBookingDocumentScalarFieldEnum | ApiBookingDocumentScalarFieldEnum[]
  }

  /**
   * ApiBookingDocument findMany
   */
  export type ApiBookingDocumentFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter, which ApiBookingDocuments to fetch.
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBookingDocuments to fetch.
     */
    orderBy?: ApiBookingDocumentOrderByWithRelationInput | ApiBookingDocumentOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiBookingDocuments.
     */
    cursor?: ApiBookingDocumentWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBookingDocuments from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBookingDocuments.
     */
    skip?: number
    distinct?: ApiBookingDocumentScalarFieldEnum | ApiBookingDocumentScalarFieldEnum[]
  }

  /**
   * ApiBookingDocument create
   */
  export type ApiBookingDocumentCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * The data needed to create a ApiBookingDocument.
     */
    data: XOR<ApiBookingDocumentCreateInput, ApiBookingDocumentUncheckedCreateInput>
  }

  /**
   * ApiBookingDocument createMany
   */
  export type ApiBookingDocumentCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiBookingDocuments.
     */
    data: ApiBookingDocumentCreateManyInput | ApiBookingDocumentCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiBookingDocument createManyAndReturn
   */
  export type ApiBookingDocumentCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * The data used to create many ApiBookingDocuments.
     */
    data: ApiBookingDocumentCreateManyInput | ApiBookingDocumentCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiBookingDocument update
   */
  export type ApiBookingDocumentUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * The data needed to update a ApiBookingDocument.
     */
    data: XOR<ApiBookingDocumentUpdateInput, ApiBookingDocumentUncheckedUpdateInput>
    /**
     * Choose, which ApiBookingDocument to update.
     */
    where: ApiBookingDocumentWhereUniqueInput
  }

  /**
   * ApiBookingDocument updateMany
   */
  export type ApiBookingDocumentUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiBookingDocuments.
     */
    data: XOR<ApiBookingDocumentUpdateManyMutationInput, ApiBookingDocumentUncheckedUpdateManyInput>
    /**
     * Filter which ApiBookingDocuments to update
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * Limit how many ApiBookingDocuments to update.
     */
    limit?: number
  }

  /**
   * ApiBookingDocument updateManyAndReturn
   */
  export type ApiBookingDocumentUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * The data used to update ApiBookingDocuments.
     */
    data: XOR<ApiBookingDocumentUpdateManyMutationInput, ApiBookingDocumentUncheckedUpdateManyInput>
    /**
     * Filter which ApiBookingDocuments to update
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * Limit how many ApiBookingDocuments to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * ApiBookingDocument upsert
   */
  export type ApiBookingDocumentUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * The filter to search for the ApiBookingDocument to update in case it exists.
     */
    where: ApiBookingDocumentWhereUniqueInput
    /**
     * In case the ApiBookingDocument found by the `where` argument doesn't exist, create a new ApiBookingDocument with this data.
     */
    create: XOR<ApiBookingDocumentCreateInput, ApiBookingDocumentUncheckedCreateInput>
    /**
     * In case the ApiBookingDocument was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiBookingDocumentUpdateInput, ApiBookingDocumentUncheckedUpdateInput>
  }

  /**
   * ApiBookingDocument delete
   */
  export type ApiBookingDocumentDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
    /**
     * Filter which ApiBookingDocument to delete.
     */
    where: ApiBookingDocumentWhereUniqueInput
  }

  /**
   * ApiBookingDocument deleteMany
   */
  export type ApiBookingDocumentDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBookingDocuments to delete
     */
    where?: ApiBookingDocumentWhereInput
    /**
     * Limit how many ApiBookingDocuments to delete.
     */
    limit?: number
  }

  /**
   * ApiBookingDocument without action
   */
  export type ApiBookingDocumentDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBookingDocument
     */
    select?: ApiBookingDocumentSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBookingDocument
     */
    omit?: ApiBookingDocumentOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ApiBookingDocumentInclude<ExtArgs> | null
  }


  /**
   * Model ApiBusinessMetrics
   */

  export type AggregateApiBusinessMetrics = {
    _count: ApiBusinessMetricsCountAggregateOutputType | null
    _avg: ApiBusinessMetricsAvgAggregateOutputType | null
    _sum: ApiBusinessMetricsSumAggregateOutputType | null
    _min: ApiBusinessMetricsMinAggregateOutputType | null
    _max: ApiBusinessMetricsMaxAggregateOutputType | null
  }

  export type ApiBusinessMetricsAvgAggregateOutputType = {
    totalBookings: number | null
    pendingPayments: number | null
    completedPayments: number | null
    failedPayments: number | null
    totalRevenue: Decimal | null
    averageBookingValue: Decimal | null
    urgencyNew: number | null
    urgencyMedium: number | null
    urgencyHigh: number | null
    urgencyCritical: number | null
    websiteBookings: number | null
    phoneBookings: number | null
    formBookings: number | null
    referralBookings: number | null
    adBookings: number | null
  }

  export type ApiBusinessMetricsSumAggregateOutputType = {
    totalBookings: number | null
    pendingPayments: number | null
    completedPayments: number | null
    failedPayments: number | null
    totalRevenue: Decimal | null
    averageBookingValue: Decimal | null
    urgencyNew: number | null
    urgencyMedium: number | null
    urgencyHigh: number | null
    urgencyCritical: number | null
    websiteBookings: number | null
    phoneBookings: number | null
    formBookings: number | null
    referralBookings: number | null
    adBookings: number | null
  }

  export type ApiBusinessMetricsMinAggregateOutputType = {
    id: string | null
    date: Date | null
    totalBookings: number | null
    pendingPayments: number | null
    completedPayments: number | null
    failedPayments: number | null
    totalRevenue: Decimal | null
    averageBookingValue: Decimal | null
    urgencyNew: number | null
    urgencyMedium: number | null
    urgencyHigh: number | null
    urgencyCritical: number | null
    websiteBookings: number | null
    phoneBookings: number | null
    formBookings: number | null
    referralBookings: number | null
    adBookings: number | null
  }

  export type ApiBusinessMetricsMaxAggregateOutputType = {
    id: string | null
    date: Date | null
    totalBookings: number | null
    pendingPayments: number | null
    completedPayments: number | null
    failedPayments: number | null
    totalRevenue: Decimal | null
    averageBookingValue: Decimal | null
    urgencyNew: number | null
    urgencyMedium: number | null
    urgencyHigh: number | null
    urgencyCritical: number | null
    websiteBookings: number | null
    phoneBookings: number | null
    formBookings: number | null
    referralBookings: number | null
    adBookings: number | null
  }

  export type ApiBusinessMetricsCountAggregateOutputType = {
    id: number
    date: number
    totalBookings: number
    pendingPayments: number
    completedPayments: number
    failedPayments: number
    totalRevenue: number
    averageBookingValue: number
    urgencyNew: number
    urgencyMedium: number
    urgencyHigh: number
    urgencyCritical: number
    websiteBookings: number
    phoneBookings: number
    formBookings: number
    referralBookings: number
    adBookings: number
    _all: number
  }


  export type ApiBusinessMetricsAvgAggregateInputType = {
    totalBookings?: true
    pendingPayments?: true
    completedPayments?: true
    failedPayments?: true
    totalRevenue?: true
    averageBookingValue?: true
    urgencyNew?: true
    urgencyMedium?: true
    urgencyHigh?: true
    urgencyCritical?: true
    websiteBookings?: true
    phoneBookings?: true
    formBookings?: true
    referralBookings?: true
    adBookings?: true
  }

  export type ApiBusinessMetricsSumAggregateInputType = {
    totalBookings?: true
    pendingPayments?: true
    completedPayments?: true
    failedPayments?: true
    totalRevenue?: true
    averageBookingValue?: true
    urgencyNew?: true
    urgencyMedium?: true
    urgencyHigh?: true
    urgencyCritical?: true
    websiteBookings?: true
    phoneBookings?: true
    formBookings?: true
    referralBookings?: true
    adBookings?: true
  }

  export type ApiBusinessMetricsMinAggregateInputType = {
    id?: true
    date?: true
    totalBookings?: true
    pendingPayments?: true
    completedPayments?: true
    failedPayments?: true
    totalRevenue?: true
    averageBookingValue?: true
    urgencyNew?: true
    urgencyMedium?: true
    urgencyHigh?: true
    urgencyCritical?: true
    websiteBookings?: true
    phoneBookings?: true
    formBookings?: true
    referralBookings?: true
    adBookings?: true
  }

  export type ApiBusinessMetricsMaxAggregateInputType = {
    id?: true
    date?: true
    totalBookings?: true
    pendingPayments?: true
    completedPayments?: true
    failedPayments?: true
    totalRevenue?: true
    averageBookingValue?: true
    urgencyNew?: true
    urgencyMedium?: true
    urgencyHigh?: true
    urgencyCritical?: true
    websiteBookings?: true
    phoneBookings?: true
    formBookings?: true
    referralBookings?: true
    adBookings?: true
  }

  export type ApiBusinessMetricsCountAggregateInputType = {
    id?: true
    date?: true
    totalBookings?: true
    pendingPayments?: true
    completedPayments?: true
    failedPayments?: true
    totalRevenue?: true
    averageBookingValue?: true
    urgencyNew?: true
    urgencyMedium?: true
    urgencyHigh?: true
    urgencyCritical?: true
    websiteBookings?: true
    phoneBookings?: true
    formBookings?: true
    referralBookings?: true
    adBookings?: true
    _all?: true
  }

  export type ApiBusinessMetricsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBusinessMetrics to aggregate.
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBusinessMetrics to fetch.
     */
    orderBy?: ApiBusinessMetricsOrderByWithRelationInput | ApiBusinessMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiBusinessMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBusinessMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBusinessMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiBusinessMetrics
    **/
    _count?: true | ApiBusinessMetricsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApiBusinessMetricsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApiBusinessMetricsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiBusinessMetricsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiBusinessMetricsMaxAggregateInputType
  }

  export type GetApiBusinessMetricsAggregateType<T extends ApiBusinessMetricsAggregateArgs> = {
        [P in keyof T & keyof AggregateApiBusinessMetrics]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiBusinessMetrics[P]>
      : GetScalarType<T[P], AggregateApiBusinessMetrics[P]>
  }




  export type ApiBusinessMetricsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiBusinessMetricsWhereInput
    orderBy?: ApiBusinessMetricsOrderByWithAggregationInput | ApiBusinessMetricsOrderByWithAggregationInput[]
    by: ApiBusinessMetricsScalarFieldEnum[] | ApiBusinessMetricsScalarFieldEnum
    having?: ApiBusinessMetricsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiBusinessMetricsCountAggregateInputType | true
    _avg?: ApiBusinessMetricsAvgAggregateInputType
    _sum?: ApiBusinessMetricsSumAggregateInputType
    _min?: ApiBusinessMetricsMinAggregateInputType
    _max?: ApiBusinessMetricsMaxAggregateInputType
  }

  export type ApiBusinessMetricsGroupByOutputType = {
    id: string
    date: Date
    totalBookings: number
    pendingPayments: number
    completedPayments: number
    failedPayments: number
    totalRevenue: Decimal
    averageBookingValue: Decimal
    urgencyNew: number
    urgencyMedium: number
    urgencyHigh: number
    urgencyCritical: number
    websiteBookings: number
    phoneBookings: number
    formBookings: number
    referralBookings: number
    adBookings: number
    _count: ApiBusinessMetricsCountAggregateOutputType | null
    _avg: ApiBusinessMetricsAvgAggregateOutputType | null
    _sum: ApiBusinessMetricsSumAggregateOutputType | null
    _min: ApiBusinessMetricsMinAggregateOutputType | null
    _max: ApiBusinessMetricsMaxAggregateOutputType | null
  }

  type GetApiBusinessMetricsGroupByPayload<T extends ApiBusinessMetricsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiBusinessMetricsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiBusinessMetricsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiBusinessMetricsGroupByOutputType[P]>
            : GetScalarType<T[P], ApiBusinessMetricsGroupByOutputType[P]>
        }
      >
    >


  export type ApiBusinessMetricsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalBookings?: boolean
    pendingPayments?: boolean
    completedPayments?: boolean
    failedPayments?: boolean
    totalRevenue?: boolean
    averageBookingValue?: boolean
    urgencyNew?: boolean
    urgencyMedium?: boolean
    urgencyHigh?: boolean
    urgencyCritical?: boolean
    websiteBookings?: boolean
    phoneBookings?: boolean
    formBookings?: boolean
    referralBookings?: boolean
    adBookings?: boolean
  }, ExtArgs["result"]["apiBusinessMetrics"]>

  export type ApiBusinessMetricsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalBookings?: boolean
    pendingPayments?: boolean
    completedPayments?: boolean
    failedPayments?: boolean
    totalRevenue?: boolean
    averageBookingValue?: boolean
    urgencyNew?: boolean
    urgencyMedium?: boolean
    urgencyHigh?: boolean
    urgencyCritical?: boolean
    websiteBookings?: boolean
    phoneBookings?: boolean
    formBookings?: boolean
    referralBookings?: boolean
    adBookings?: boolean
  }, ExtArgs["result"]["apiBusinessMetrics"]>

  export type ApiBusinessMetricsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    date?: boolean
    totalBookings?: boolean
    pendingPayments?: boolean
    completedPayments?: boolean
    failedPayments?: boolean
    totalRevenue?: boolean
    averageBookingValue?: boolean
    urgencyNew?: boolean
    urgencyMedium?: boolean
    urgencyHigh?: boolean
    urgencyCritical?: boolean
    websiteBookings?: boolean
    phoneBookings?: boolean
    formBookings?: boolean
    referralBookings?: boolean
    adBookings?: boolean
  }, ExtArgs["result"]["apiBusinessMetrics"]>

  export type ApiBusinessMetricsSelectScalar = {
    id?: boolean
    date?: boolean
    totalBookings?: boolean
    pendingPayments?: boolean
    completedPayments?: boolean
    failedPayments?: boolean
    totalRevenue?: boolean
    averageBookingValue?: boolean
    urgencyNew?: boolean
    urgencyMedium?: boolean
    urgencyHigh?: boolean
    urgencyCritical?: boolean
    websiteBookings?: boolean
    phoneBookings?: boolean
    formBookings?: boolean
    referralBookings?: boolean
    adBookings?: boolean
  }

  export type ApiBusinessMetricsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "date" | "totalBookings" | "pendingPayments" | "completedPayments" | "failedPayments" | "totalRevenue" | "averageBookingValue" | "urgencyNew" | "urgencyMedium" | "urgencyHigh" | "urgencyCritical" | "websiteBookings" | "phoneBookings" | "formBookings" | "referralBookings" | "adBookings", ExtArgs["result"]["apiBusinessMetrics"]>

  export type $ApiBusinessMetricsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiBusinessMetrics"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      date: Date
      totalBookings: number
      pendingPayments: number
      completedPayments: number
      failedPayments: number
      totalRevenue: Prisma.Decimal
      averageBookingValue: Prisma.Decimal
      urgencyNew: number
      urgencyMedium: number
      urgencyHigh: number
      urgencyCritical: number
      websiteBookings: number
      phoneBookings: number
      formBookings: number
      referralBookings: number
      adBookings: number
    }, ExtArgs["result"]["apiBusinessMetrics"]>
    composites: {}
  }

  type ApiBusinessMetricsGetPayload<S extends boolean | null | undefined | ApiBusinessMetricsDefaultArgs> = $Result.GetResult<Prisma.$ApiBusinessMetricsPayload, S>

  type ApiBusinessMetricsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiBusinessMetricsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiBusinessMetricsCountAggregateInputType | true
    }

  export interface ApiBusinessMetricsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiBusinessMetrics'], meta: { name: 'ApiBusinessMetrics' } }
    /**
     * Find zero or one ApiBusinessMetrics that matches the filter.
     * @param {ApiBusinessMetricsFindUniqueArgs} args - Arguments to find a ApiBusinessMetrics
     * @example
     * // Get one ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiBusinessMetricsFindUniqueArgs>(args: SelectSubset<T, ApiBusinessMetricsFindUniqueArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiBusinessMetrics that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiBusinessMetricsFindUniqueOrThrowArgs} args - Arguments to find a ApiBusinessMetrics
     * @example
     * // Get one ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiBusinessMetricsFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiBusinessMetricsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBusinessMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsFindFirstArgs} args - Arguments to find a ApiBusinessMetrics
     * @example
     * // Get one ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiBusinessMetricsFindFirstArgs>(args?: SelectSubset<T, ApiBusinessMetricsFindFirstArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiBusinessMetrics that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsFindFirstOrThrowArgs} args - Arguments to find a ApiBusinessMetrics
     * @example
     * // Get one ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiBusinessMetricsFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiBusinessMetricsFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiBusinessMetrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findMany()
     * 
     * // Get first 10 ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiBusinessMetricsWithIdOnly = await prisma.apiBusinessMetrics.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiBusinessMetricsFindManyArgs>(args?: SelectSubset<T, ApiBusinessMetricsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiBusinessMetrics.
     * @param {ApiBusinessMetricsCreateArgs} args - Arguments to create a ApiBusinessMetrics.
     * @example
     * // Create one ApiBusinessMetrics
     * const ApiBusinessMetrics = await prisma.apiBusinessMetrics.create({
     *   data: {
     *     // ... data to create a ApiBusinessMetrics
     *   }
     * })
     * 
     */
    create<T extends ApiBusinessMetricsCreateArgs>(args: SelectSubset<T, ApiBusinessMetricsCreateArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiBusinessMetrics.
     * @param {ApiBusinessMetricsCreateManyArgs} args - Arguments to create many ApiBusinessMetrics.
     * @example
     * // Create many ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiBusinessMetricsCreateManyArgs>(args?: SelectSubset<T, ApiBusinessMetricsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiBusinessMetrics and returns the data saved in the database.
     * @param {ApiBusinessMetricsCreateManyAndReturnArgs} args - Arguments to create many ApiBusinessMetrics.
     * @example
     * // Create many ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiBusinessMetrics and only return the `id`
     * const apiBusinessMetricsWithIdOnly = await prisma.apiBusinessMetrics.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiBusinessMetricsCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiBusinessMetricsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiBusinessMetrics.
     * @param {ApiBusinessMetricsDeleteArgs} args - Arguments to delete one ApiBusinessMetrics.
     * @example
     * // Delete one ApiBusinessMetrics
     * const ApiBusinessMetrics = await prisma.apiBusinessMetrics.delete({
     *   where: {
     *     // ... filter to delete one ApiBusinessMetrics
     *   }
     * })
     * 
     */
    delete<T extends ApiBusinessMetricsDeleteArgs>(args: SelectSubset<T, ApiBusinessMetricsDeleteArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiBusinessMetrics.
     * @param {ApiBusinessMetricsUpdateArgs} args - Arguments to update one ApiBusinessMetrics.
     * @example
     * // Update one ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiBusinessMetricsUpdateArgs>(args: SelectSubset<T, ApiBusinessMetricsUpdateArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiBusinessMetrics.
     * @param {ApiBusinessMetricsDeleteManyArgs} args - Arguments to filter ApiBusinessMetrics to delete.
     * @example
     * // Delete a few ApiBusinessMetrics
     * const { count } = await prisma.apiBusinessMetrics.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiBusinessMetricsDeleteManyArgs>(args?: SelectSubset<T, ApiBusinessMetricsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBusinessMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiBusinessMetricsUpdateManyArgs>(args: SelectSubset<T, ApiBusinessMetricsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiBusinessMetrics and returns the data updated in the database.
     * @param {ApiBusinessMetricsUpdateManyAndReturnArgs} args - Arguments to update many ApiBusinessMetrics.
     * @example
     * // Update many ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiBusinessMetrics and only return the `id`
     * const apiBusinessMetricsWithIdOnly = await prisma.apiBusinessMetrics.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiBusinessMetricsUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiBusinessMetricsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiBusinessMetrics.
     * @param {ApiBusinessMetricsUpsertArgs} args - Arguments to update or create a ApiBusinessMetrics.
     * @example
     * // Update or create a ApiBusinessMetrics
     * const apiBusinessMetrics = await prisma.apiBusinessMetrics.upsert({
     *   create: {
     *     // ... data to create a ApiBusinessMetrics
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiBusinessMetrics we want to update
     *   }
     * })
     */
    upsert<T extends ApiBusinessMetricsUpsertArgs>(args: SelectSubset<T, ApiBusinessMetricsUpsertArgs<ExtArgs>>): Prisma__ApiBusinessMetricsClient<$Result.GetResult<Prisma.$ApiBusinessMetricsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiBusinessMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsCountArgs} args - Arguments to filter ApiBusinessMetrics to count.
     * @example
     * // Count the number of ApiBusinessMetrics
     * const count = await prisma.apiBusinessMetrics.count({
     *   where: {
     *     // ... the filter for the ApiBusinessMetrics we want to count
     *   }
     * })
    **/
    count<T extends ApiBusinessMetricsCountArgs>(
      args?: Subset<T, ApiBusinessMetricsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiBusinessMetricsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiBusinessMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiBusinessMetricsAggregateArgs>(args: Subset<T, ApiBusinessMetricsAggregateArgs>): Prisma.PrismaPromise<GetApiBusinessMetricsAggregateType<T>>

    /**
     * Group by ApiBusinessMetrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiBusinessMetricsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiBusinessMetricsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiBusinessMetricsGroupByArgs['orderBy'] }
        : { orderBy?: ApiBusinessMetricsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiBusinessMetricsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiBusinessMetricsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiBusinessMetrics model
   */
  readonly fields: ApiBusinessMetricsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiBusinessMetrics.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiBusinessMetricsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiBusinessMetrics model
   */
  interface ApiBusinessMetricsFieldRefs {
    readonly id: FieldRef<"ApiBusinessMetrics", 'String'>
    readonly date: FieldRef<"ApiBusinessMetrics", 'DateTime'>
    readonly totalBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly pendingPayments: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly completedPayments: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly failedPayments: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly totalRevenue: FieldRef<"ApiBusinessMetrics", 'Decimal'>
    readonly averageBookingValue: FieldRef<"ApiBusinessMetrics", 'Decimal'>
    readonly urgencyNew: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly urgencyMedium: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly urgencyHigh: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly urgencyCritical: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly websiteBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly phoneBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly formBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly referralBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
    readonly adBookings: FieldRef<"ApiBusinessMetrics", 'Int'>
  }
    

  // Custom InputTypes
  /**
   * ApiBusinessMetrics findUnique
   */
  export type ApiBusinessMetricsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter, which ApiBusinessMetrics to fetch.
     */
    where: ApiBusinessMetricsWhereUniqueInput
  }

  /**
   * ApiBusinessMetrics findUniqueOrThrow
   */
  export type ApiBusinessMetricsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter, which ApiBusinessMetrics to fetch.
     */
    where: ApiBusinessMetricsWhereUniqueInput
  }

  /**
   * ApiBusinessMetrics findFirst
   */
  export type ApiBusinessMetricsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter, which ApiBusinessMetrics to fetch.
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBusinessMetrics to fetch.
     */
    orderBy?: ApiBusinessMetricsOrderByWithRelationInput | ApiBusinessMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBusinessMetrics.
     */
    cursor?: ApiBusinessMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBusinessMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBusinessMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBusinessMetrics.
     */
    distinct?: ApiBusinessMetricsScalarFieldEnum | ApiBusinessMetricsScalarFieldEnum[]
  }

  /**
   * ApiBusinessMetrics findFirstOrThrow
   */
  export type ApiBusinessMetricsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter, which ApiBusinessMetrics to fetch.
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBusinessMetrics to fetch.
     */
    orderBy?: ApiBusinessMetricsOrderByWithRelationInput | ApiBusinessMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiBusinessMetrics.
     */
    cursor?: ApiBusinessMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBusinessMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBusinessMetrics.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiBusinessMetrics.
     */
    distinct?: ApiBusinessMetricsScalarFieldEnum | ApiBusinessMetricsScalarFieldEnum[]
  }

  /**
   * ApiBusinessMetrics findMany
   */
  export type ApiBusinessMetricsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter, which ApiBusinessMetrics to fetch.
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiBusinessMetrics to fetch.
     */
    orderBy?: ApiBusinessMetricsOrderByWithRelationInput | ApiBusinessMetricsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiBusinessMetrics.
     */
    cursor?: ApiBusinessMetricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiBusinessMetrics from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiBusinessMetrics.
     */
    skip?: number
    distinct?: ApiBusinessMetricsScalarFieldEnum | ApiBusinessMetricsScalarFieldEnum[]
  }

  /**
   * ApiBusinessMetrics create
   */
  export type ApiBusinessMetricsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * The data needed to create a ApiBusinessMetrics.
     */
    data?: XOR<ApiBusinessMetricsCreateInput, ApiBusinessMetricsUncheckedCreateInput>
  }

  /**
   * ApiBusinessMetrics createMany
   */
  export type ApiBusinessMetricsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiBusinessMetrics.
     */
    data: ApiBusinessMetricsCreateManyInput | ApiBusinessMetricsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiBusinessMetrics createManyAndReturn
   */
  export type ApiBusinessMetricsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * The data used to create many ApiBusinessMetrics.
     */
    data: ApiBusinessMetricsCreateManyInput | ApiBusinessMetricsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiBusinessMetrics update
   */
  export type ApiBusinessMetricsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * The data needed to update a ApiBusinessMetrics.
     */
    data: XOR<ApiBusinessMetricsUpdateInput, ApiBusinessMetricsUncheckedUpdateInput>
    /**
     * Choose, which ApiBusinessMetrics to update.
     */
    where: ApiBusinessMetricsWhereUniqueInput
  }

  /**
   * ApiBusinessMetrics updateMany
   */
  export type ApiBusinessMetricsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiBusinessMetrics.
     */
    data: XOR<ApiBusinessMetricsUpdateManyMutationInput, ApiBusinessMetricsUncheckedUpdateManyInput>
    /**
     * Filter which ApiBusinessMetrics to update
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * Limit how many ApiBusinessMetrics to update.
     */
    limit?: number
  }

  /**
   * ApiBusinessMetrics updateManyAndReturn
   */
  export type ApiBusinessMetricsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * The data used to update ApiBusinessMetrics.
     */
    data: XOR<ApiBusinessMetricsUpdateManyMutationInput, ApiBusinessMetricsUncheckedUpdateManyInput>
    /**
     * Filter which ApiBusinessMetrics to update
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * Limit how many ApiBusinessMetrics to update.
     */
    limit?: number
  }

  /**
   * ApiBusinessMetrics upsert
   */
  export type ApiBusinessMetricsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * The filter to search for the ApiBusinessMetrics to update in case it exists.
     */
    where: ApiBusinessMetricsWhereUniqueInput
    /**
     * In case the ApiBusinessMetrics found by the `where` argument doesn't exist, create a new ApiBusinessMetrics with this data.
     */
    create: XOR<ApiBusinessMetricsCreateInput, ApiBusinessMetricsUncheckedCreateInput>
    /**
     * In case the ApiBusinessMetrics was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiBusinessMetricsUpdateInput, ApiBusinessMetricsUncheckedUpdateInput>
  }

  /**
   * ApiBusinessMetrics delete
   */
  export type ApiBusinessMetricsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
    /**
     * Filter which ApiBusinessMetrics to delete.
     */
    where: ApiBusinessMetricsWhereUniqueInput
  }

  /**
   * ApiBusinessMetrics deleteMany
   */
  export type ApiBusinessMetricsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiBusinessMetrics to delete
     */
    where?: ApiBusinessMetricsWhereInput
    /**
     * Limit how many ApiBusinessMetrics to delete.
     */
    limit?: number
  }

  /**
   * ApiBusinessMetrics without action
   */
  export type ApiBusinessMetricsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiBusinessMetrics
     */
    select?: ApiBusinessMetricsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiBusinessMetrics
     */
    omit?: ApiBusinessMetricsOmit<ExtArgs> | null
  }


  /**
   * Model ApiRequestLog
   */

  export type AggregateApiRequestLog = {
    _count: ApiRequestLogCountAggregateOutputType | null
    _avg: ApiRequestLogAvgAggregateOutputType | null
    _sum: ApiRequestLogSumAggregateOutputType | null
    _min: ApiRequestLogMinAggregateOutputType | null
    _max: ApiRequestLogMaxAggregateOutputType | null
  }

  export type ApiRequestLogAvgAggregateOutputType = {
    statusCode: number | null
    duration: number | null
    requestSize: number | null
    responseSize: number | null
  }

  export type ApiRequestLogSumAggregateOutputType = {
    statusCode: number | null
    duration: number | null
    requestSize: number | null
    responseSize: number | null
  }

  export type ApiRequestLogMinAggregateOutputType = {
    id: string | null
    method: string | null
    url: string | null
    statusCode: number | null
    duration: number | null
    ip: string | null
    userAgent: string | null
    timestamp: Date | null
    requestSize: number | null
    responseSize: number | null
    errorMessage: string | null
  }

  export type ApiRequestLogMaxAggregateOutputType = {
    id: string | null
    method: string | null
    url: string | null
    statusCode: number | null
    duration: number | null
    ip: string | null
    userAgent: string | null
    timestamp: Date | null
    requestSize: number | null
    responseSize: number | null
    errorMessage: string | null
  }

  export type ApiRequestLogCountAggregateOutputType = {
    id: number
    method: number
    url: number
    statusCode: number
    duration: number
    ip: number
    userAgent: number
    timestamp: number
    requestSize: number
    responseSize: number
    errorMessage: number
    _all: number
  }


  export type ApiRequestLogAvgAggregateInputType = {
    statusCode?: true
    duration?: true
    requestSize?: true
    responseSize?: true
  }

  export type ApiRequestLogSumAggregateInputType = {
    statusCode?: true
    duration?: true
    requestSize?: true
    responseSize?: true
  }

  export type ApiRequestLogMinAggregateInputType = {
    id?: true
    method?: true
    url?: true
    statusCode?: true
    duration?: true
    ip?: true
    userAgent?: true
    timestamp?: true
    requestSize?: true
    responseSize?: true
    errorMessage?: true
  }

  export type ApiRequestLogMaxAggregateInputType = {
    id?: true
    method?: true
    url?: true
    statusCode?: true
    duration?: true
    ip?: true
    userAgent?: true
    timestamp?: true
    requestSize?: true
    responseSize?: true
    errorMessage?: true
  }

  export type ApiRequestLogCountAggregateInputType = {
    id?: true
    method?: true
    url?: true
    statusCode?: true
    duration?: true
    ip?: true
    userAgent?: true
    timestamp?: true
    requestSize?: true
    responseSize?: true
    errorMessage?: true
    _all?: true
  }

  export type ApiRequestLogAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiRequestLog to aggregate.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ApiRequestLogs
    **/
    _count?: true | ApiRequestLogCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ApiRequestLogAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ApiRequestLogSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ApiRequestLogMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ApiRequestLogMaxAggregateInputType
  }

  export type GetApiRequestLogAggregateType<T extends ApiRequestLogAggregateArgs> = {
        [P in keyof T & keyof AggregateApiRequestLog]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateApiRequestLog[P]>
      : GetScalarType<T[P], AggregateApiRequestLog[P]>
  }




  export type ApiRequestLogGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ApiRequestLogWhereInput
    orderBy?: ApiRequestLogOrderByWithAggregationInput | ApiRequestLogOrderByWithAggregationInput[]
    by: ApiRequestLogScalarFieldEnum[] | ApiRequestLogScalarFieldEnum
    having?: ApiRequestLogScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ApiRequestLogCountAggregateInputType | true
    _avg?: ApiRequestLogAvgAggregateInputType
    _sum?: ApiRequestLogSumAggregateInputType
    _min?: ApiRequestLogMinAggregateInputType
    _max?: ApiRequestLogMaxAggregateInputType
  }

  export type ApiRequestLogGroupByOutputType = {
    id: string
    method: string
    url: string
    statusCode: number
    duration: number
    ip: string | null
    userAgent: string | null
    timestamp: Date
    requestSize: number | null
    responseSize: number | null
    errorMessage: string | null
    _count: ApiRequestLogCountAggregateOutputType | null
    _avg: ApiRequestLogAvgAggregateOutputType | null
    _sum: ApiRequestLogSumAggregateOutputType | null
    _min: ApiRequestLogMinAggregateOutputType | null
    _max: ApiRequestLogMaxAggregateOutputType | null
  }

  type GetApiRequestLogGroupByPayload<T extends ApiRequestLogGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ApiRequestLogGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ApiRequestLogGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ApiRequestLogGroupByOutputType[P]>
            : GetScalarType<T[P], ApiRequestLogGroupByOutputType[P]>
        }
      >
    >


  export type ApiRequestLogSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    method?: boolean
    url?: boolean
    statusCode?: boolean
    duration?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
    requestSize?: boolean
    responseSize?: boolean
    errorMessage?: boolean
  }, ExtArgs["result"]["apiRequestLog"]>

  export type ApiRequestLogSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    method?: boolean
    url?: boolean
    statusCode?: boolean
    duration?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
    requestSize?: boolean
    responseSize?: boolean
    errorMessage?: boolean
  }, ExtArgs["result"]["apiRequestLog"]>

  export type ApiRequestLogSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    method?: boolean
    url?: boolean
    statusCode?: boolean
    duration?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
    requestSize?: boolean
    responseSize?: boolean
    errorMessage?: boolean
  }, ExtArgs["result"]["apiRequestLog"]>

  export type ApiRequestLogSelectScalar = {
    id?: boolean
    method?: boolean
    url?: boolean
    statusCode?: boolean
    duration?: boolean
    ip?: boolean
    userAgent?: boolean
    timestamp?: boolean
    requestSize?: boolean
    responseSize?: boolean
    errorMessage?: boolean
  }

  export type ApiRequestLogOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "method" | "url" | "statusCode" | "duration" | "ip" | "userAgent" | "timestamp" | "requestSize" | "responseSize" | "errorMessage", ExtArgs["result"]["apiRequestLog"]>

  export type $ApiRequestLogPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ApiRequestLog"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      method: string
      url: string
      statusCode: number
      duration: number
      ip: string | null
      userAgent: string | null
      timestamp: Date
      requestSize: number | null
      responseSize: number | null
      errorMessage: string | null
    }, ExtArgs["result"]["apiRequestLog"]>
    composites: {}
  }

  type ApiRequestLogGetPayload<S extends boolean | null | undefined | ApiRequestLogDefaultArgs> = $Result.GetResult<Prisma.$ApiRequestLogPayload, S>

  type ApiRequestLogCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<ApiRequestLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: ApiRequestLogCountAggregateInputType | true
    }

  export interface ApiRequestLogDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ApiRequestLog'], meta: { name: 'ApiRequestLog' } }
    /**
     * Find zero or one ApiRequestLog that matches the filter.
     * @param {ApiRequestLogFindUniqueArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ApiRequestLogFindUniqueArgs>(args: SelectSubset<T, ApiRequestLogFindUniqueArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one ApiRequestLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {ApiRequestLogFindUniqueOrThrowArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ApiRequestLogFindUniqueOrThrowArgs>(args: SelectSubset<T, ApiRequestLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiRequestLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindFirstArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ApiRequestLogFindFirstArgs>(args?: SelectSubset<T, ApiRequestLogFindFirstArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first ApiRequestLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindFirstOrThrowArgs} args - Arguments to find a ApiRequestLog
     * @example
     * // Get one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ApiRequestLogFindFirstOrThrowArgs>(args?: SelectSubset<T, ApiRequestLogFindFirstOrThrowArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more ApiRequestLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ApiRequestLogs
     * const apiRequestLogs = await prisma.apiRequestLog.findMany()
     * 
     * // Get first 10 ApiRequestLogs
     * const apiRequestLogs = await prisma.apiRequestLog.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const apiRequestLogWithIdOnly = await prisma.apiRequestLog.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ApiRequestLogFindManyArgs>(args?: SelectSubset<T, ApiRequestLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a ApiRequestLog.
     * @param {ApiRequestLogCreateArgs} args - Arguments to create a ApiRequestLog.
     * @example
     * // Create one ApiRequestLog
     * const ApiRequestLog = await prisma.apiRequestLog.create({
     *   data: {
     *     // ... data to create a ApiRequestLog
     *   }
     * })
     * 
     */
    create<T extends ApiRequestLogCreateArgs>(args: SelectSubset<T, ApiRequestLogCreateArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many ApiRequestLogs.
     * @param {ApiRequestLogCreateManyArgs} args - Arguments to create many ApiRequestLogs.
     * @example
     * // Create many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ApiRequestLogCreateManyArgs>(args?: SelectSubset<T, ApiRequestLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ApiRequestLogs and returns the data saved in the database.
     * @param {ApiRequestLogCreateManyAndReturnArgs} args - Arguments to create many ApiRequestLogs.
     * @example
     * // Create many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ApiRequestLogs and only return the `id`
     * const apiRequestLogWithIdOnly = await prisma.apiRequestLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ApiRequestLogCreateManyAndReturnArgs>(args?: SelectSubset<T, ApiRequestLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a ApiRequestLog.
     * @param {ApiRequestLogDeleteArgs} args - Arguments to delete one ApiRequestLog.
     * @example
     * // Delete one ApiRequestLog
     * const ApiRequestLog = await prisma.apiRequestLog.delete({
     *   where: {
     *     // ... filter to delete one ApiRequestLog
     *   }
     * })
     * 
     */
    delete<T extends ApiRequestLogDeleteArgs>(args: SelectSubset<T, ApiRequestLogDeleteArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one ApiRequestLog.
     * @param {ApiRequestLogUpdateArgs} args - Arguments to update one ApiRequestLog.
     * @example
     * // Update one ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ApiRequestLogUpdateArgs>(args: SelectSubset<T, ApiRequestLogUpdateArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more ApiRequestLogs.
     * @param {ApiRequestLogDeleteManyArgs} args - Arguments to filter ApiRequestLogs to delete.
     * @example
     * // Delete a few ApiRequestLogs
     * const { count } = await prisma.apiRequestLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ApiRequestLogDeleteManyArgs>(args?: SelectSubset<T, ApiRequestLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiRequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ApiRequestLogUpdateManyArgs>(args: SelectSubset<T, ApiRequestLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ApiRequestLogs and returns the data updated in the database.
     * @param {ApiRequestLogUpdateManyAndReturnArgs} args - Arguments to update many ApiRequestLogs.
     * @example
     * // Update many ApiRequestLogs
     * const apiRequestLog = await prisma.apiRequestLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more ApiRequestLogs and only return the `id`
     * const apiRequestLogWithIdOnly = await prisma.apiRequestLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends ApiRequestLogUpdateManyAndReturnArgs>(args: SelectSubset<T, ApiRequestLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one ApiRequestLog.
     * @param {ApiRequestLogUpsertArgs} args - Arguments to update or create a ApiRequestLog.
     * @example
     * // Update or create a ApiRequestLog
     * const apiRequestLog = await prisma.apiRequestLog.upsert({
     *   create: {
     *     // ... data to create a ApiRequestLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ApiRequestLog we want to update
     *   }
     * })
     */
    upsert<T extends ApiRequestLogUpsertArgs>(args: SelectSubset<T, ApiRequestLogUpsertArgs<ExtArgs>>): Prisma__ApiRequestLogClient<$Result.GetResult<Prisma.$ApiRequestLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of ApiRequestLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogCountArgs} args - Arguments to filter ApiRequestLogs to count.
     * @example
     * // Count the number of ApiRequestLogs
     * const count = await prisma.apiRequestLog.count({
     *   where: {
     *     // ... the filter for the ApiRequestLogs we want to count
     *   }
     * })
    **/
    count<T extends ApiRequestLogCountArgs>(
      args?: Subset<T, ApiRequestLogCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ApiRequestLogCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ApiRequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ApiRequestLogAggregateArgs>(args: Subset<T, ApiRequestLogAggregateArgs>): Prisma.PrismaPromise<GetApiRequestLogAggregateType<T>>

    /**
     * Group by ApiRequestLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ApiRequestLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ApiRequestLogGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ApiRequestLogGroupByArgs['orderBy'] }
        : { orderBy?: ApiRequestLogGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ApiRequestLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetApiRequestLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ApiRequestLog model
   */
  readonly fields: ApiRequestLogFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ApiRequestLog.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ApiRequestLogClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ApiRequestLog model
   */
  interface ApiRequestLogFieldRefs {
    readonly id: FieldRef<"ApiRequestLog", 'String'>
    readonly method: FieldRef<"ApiRequestLog", 'String'>
    readonly url: FieldRef<"ApiRequestLog", 'String'>
    readonly statusCode: FieldRef<"ApiRequestLog", 'Int'>
    readonly duration: FieldRef<"ApiRequestLog", 'Int'>
    readonly ip: FieldRef<"ApiRequestLog", 'String'>
    readonly userAgent: FieldRef<"ApiRequestLog", 'String'>
    readonly timestamp: FieldRef<"ApiRequestLog", 'DateTime'>
    readonly requestSize: FieldRef<"ApiRequestLog", 'Int'>
    readonly responseSize: FieldRef<"ApiRequestLog", 'Int'>
    readonly errorMessage: FieldRef<"ApiRequestLog", 'String'>
  }
    

  // Custom InputTypes
  /**
   * ApiRequestLog findUnique
   */
  export type ApiRequestLogFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog findUniqueOrThrow
   */
  export type ApiRequestLogFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog findFirst
   */
  export type ApiRequestLogFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiRequestLogs.
     */
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog findFirstOrThrow
   */
  export type ApiRequestLogFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter, which ApiRequestLog to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ApiRequestLogs.
     */
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog findMany
   */
  export type ApiRequestLogFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter, which ApiRequestLogs to fetch.
     */
    where?: ApiRequestLogWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ApiRequestLogs to fetch.
     */
    orderBy?: ApiRequestLogOrderByWithRelationInput | ApiRequestLogOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ApiRequestLogs.
     */
    cursor?: ApiRequestLogWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ApiRequestLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ApiRequestLogs.
     */
    skip?: number
    distinct?: ApiRequestLogScalarFieldEnum | ApiRequestLogScalarFieldEnum[]
  }

  /**
   * ApiRequestLog create
   */
  export type ApiRequestLogCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * The data needed to create a ApiRequestLog.
     */
    data: XOR<ApiRequestLogCreateInput, ApiRequestLogUncheckedCreateInput>
  }

  /**
   * ApiRequestLog createMany
   */
  export type ApiRequestLogCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ApiRequestLogs.
     */
    data: ApiRequestLogCreateManyInput | ApiRequestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiRequestLog createManyAndReturn
   */
  export type ApiRequestLogCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * The data used to create many ApiRequestLogs.
     */
    data: ApiRequestLogCreateManyInput | ApiRequestLogCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ApiRequestLog update
   */
  export type ApiRequestLogUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * The data needed to update a ApiRequestLog.
     */
    data: XOR<ApiRequestLogUpdateInput, ApiRequestLogUncheckedUpdateInput>
    /**
     * Choose, which ApiRequestLog to update.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog updateMany
   */
  export type ApiRequestLogUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ApiRequestLogs.
     */
    data: XOR<ApiRequestLogUpdateManyMutationInput, ApiRequestLogUncheckedUpdateManyInput>
    /**
     * Filter which ApiRequestLogs to update
     */
    where?: ApiRequestLogWhereInput
    /**
     * Limit how many ApiRequestLogs to update.
     */
    limit?: number
  }

  /**
   * ApiRequestLog updateManyAndReturn
   */
  export type ApiRequestLogUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * The data used to update ApiRequestLogs.
     */
    data: XOR<ApiRequestLogUpdateManyMutationInput, ApiRequestLogUncheckedUpdateManyInput>
    /**
     * Filter which ApiRequestLogs to update
     */
    where?: ApiRequestLogWhereInput
    /**
     * Limit how many ApiRequestLogs to update.
     */
    limit?: number
  }

  /**
   * ApiRequestLog upsert
   */
  export type ApiRequestLogUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * The filter to search for the ApiRequestLog to update in case it exists.
     */
    where: ApiRequestLogWhereUniqueInput
    /**
     * In case the ApiRequestLog found by the `where` argument doesn't exist, create a new ApiRequestLog with this data.
     */
    create: XOR<ApiRequestLogCreateInput, ApiRequestLogUncheckedCreateInput>
    /**
     * In case the ApiRequestLog was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ApiRequestLogUpdateInput, ApiRequestLogUncheckedUpdateInput>
  }

  /**
   * ApiRequestLog delete
   */
  export type ApiRequestLogDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
    /**
     * Filter which ApiRequestLog to delete.
     */
    where: ApiRequestLogWhereUniqueInput
  }

  /**
   * ApiRequestLog deleteMany
   */
  export type ApiRequestLogDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ApiRequestLogs to delete
     */
    where?: ApiRequestLogWhereInput
    /**
     * Limit how many ApiRequestLogs to delete.
     */
    limit?: number
  }

  /**
   * ApiRequestLog without action
   */
  export type ApiRequestLogDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ApiRequestLog
     */
    select?: ApiRequestLogSelect<ExtArgs> | null
    /**
     * Omit specific fields from the ApiRequestLog
     */
    omit?: ApiRequestLogOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ApiBookingScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    ghlContactId: 'ghlContactId',
    customerName: 'customerName',
    customerEmail: 'customerEmail',
    customerPhone: 'customerPhone',
    serviceName: 'serviceName',
    serviceDescription: 'serviceDescription',
    servicePrice: 'servicePrice',
    scheduledDateTime: 'scheduledDateTime',
    duration: 'duration',
    timezone: 'timezone',
    appointmentStatus: 'appointmentStatus',
    locationType: 'locationType',
    addressStreet: 'addressStreet',
    addressCity: 'addressCity',
    addressState: 'addressState',
    addressZip: 'addressZip',
    addressFormatted: 'addressFormatted',
    locationNotes: 'locationNotes',
    paymentAmount: 'paymentAmount',
    paymentStatus: 'paymentStatus',
    paymentMethod: 'paymentMethod',
    paymentUrl: 'paymentUrl',
    paymentIntentId: 'paymentIntentId',
    paidAt: 'paidAt',
    paymentExpiresAt: 'paymentExpiresAt',
    urgencyLevel: 'urgencyLevel',
    hoursOld: 'hoursOld',
    remindersSent: 'remindersSent',
    lastReminderAt: 'lastReminderAt',
    leadSource: 'leadSource',
    campaignName: 'campaignName',
    referralCode: 'referralCode',
    ghlWorkflowId: 'ghlWorkflowId',
    triggerSource: 'triggerSource',
    notes: 'notes',
    internalNotes: 'internalNotes',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    createdBy: 'createdBy'
  };

  export type ApiBookingScalarFieldEnum = (typeof ApiBookingScalarFieldEnum)[keyof typeof ApiBookingScalarFieldEnum]


  export const ApiPaymentActionScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    actionType: 'actionType',
    reminderType: 'reminderType',
    notes: 'notes',
    timestamp: 'timestamp'
  };

  export type ApiPaymentActionScalarFieldEnum = (typeof ApiPaymentActionScalarFieldEnum)[keyof typeof ApiPaymentActionScalarFieldEnum]


  export const ApiWorkflowTriggerScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    workflowName: 'workflowName',
    status: 'status',
    triggeredAt: 'triggeredAt',
    completedAt: 'completedAt',
    errorMessage: 'errorMessage'
  };

  export type ApiWorkflowTriggerScalarFieldEnum = (typeof ApiWorkflowTriggerScalarFieldEnum)[keyof typeof ApiWorkflowTriggerScalarFieldEnum]


  export const ApiBookingDocumentScalarFieldEnum: {
    id: 'id',
    bookingId: 'bookingId',
    name: 'name',
    type: 'type',
    count: 'count'
  };

  export type ApiBookingDocumentScalarFieldEnum = (typeof ApiBookingDocumentScalarFieldEnum)[keyof typeof ApiBookingDocumentScalarFieldEnum]


  export const ApiBusinessMetricsScalarFieldEnum: {
    id: 'id',
    date: 'date',
    totalBookings: 'totalBookings',
    pendingPayments: 'pendingPayments',
    completedPayments: 'completedPayments',
    failedPayments: 'failedPayments',
    totalRevenue: 'totalRevenue',
    averageBookingValue: 'averageBookingValue',
    urgencyNew: 'urgencyNew',
    urgencyMedium: 'urgencyMedium',
    urgencyHigh: 'urgencyHigh',
    urgencyCritical: 'urgencyCritical',
    websiteBookings: 'websiteBookings',
    phoneBookings: 'phoneBookings',
    formBookings: 'formBookings',
    referralBookings: 'referralBookings',
    adBookings: 'adBookings'
  };

  export type ApiBusinessMetricsScalarFieldEnum = (typeof ApiBusinessMetricsScalarFieldEnum)[keyof typeof ApiBusinessMetricsScalarFieldEnum]


  export const ApiRequestLogScalarFieldEnum: {
    id: 'id',
    method: 'method',
    url: 'url',
    statusCode: 'statusCode',
    duration: 'duration',
    ip: 'ip',
    userAgent: 'userAgent',
    timestamp: 'timestamp',
    requestSize: 'requestSize',
    responseSize: 'responseSize',
    errorMessage: 'errorMessage'
  };

  export type ApiRequestLogScalarFieldEnum = (typeof ApiRequestLogScalarFieldEnum)[keyof typeof ApiRequestLogScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Decimal'
   */
  export type DecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal'>
    


  /**
   * Reference to a field of type 'Decimal[]'
   */
  export type ListDecimalFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Decimal[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ApiBookingWhereInput = {
    AND?: ApiBookingWhereInput | ApiBookingWhereInput[]
    OR?: ApiBookingWhereInput[]
    NOT?: ApiBookingWhereInput | ApiBookingWhereInput[]
    id?: StringFilter<"ApiBooking"> | string
    bookingId?: StringFilter<"ApiBooking"> | string
    ghlContactId?: StringFilter<"ApiBooking"> | string
    customerName?: StringFilter<"ApiBooking"> | string
    customerEmail?: StringFilter<"ApiBooking"> | string
    customerPhone?: StringFilter<"ApiBooking"> | string
    serviceName?: StringFilter<"ApiBooking"> | string
    serviceDescription?: StringNullableFilter<"ApiBooking"> | string | null
    servicePrice?: DecimalFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFilter<"ApiBooking"> | Date | string
    duration?: IntFilter<"ApiBooking"> | number
    timezone?: StringFilter<"ApiBooking"> | string
    appointmentStatus?: StringFilter<"ApiBooking"> | string
    locationType?: StringFilter<"ApiBooking"> | string
    addressStreet?: StringNullableFilter<"ApiBooking"> | string | null
    addressCity?: StringNullableFilter<"ApiBooking"> | string | null
    addressState?: StringNullableFilter<"ApiBooking"> | string | null
    addressZip?: StringNullableFilter<"ApiBooking"> | string | null
    addressFormatted?: StringNullableFilter<"ApiBooking"> | string | null
    locationNotes?: StringNullableFilter<"ApiBooking"> | string | null
    paymentAmount?: DecimalFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFilter<"ApiBooking"> | string
    paymentMethod?: StringFilter<"ApiBooking"> | string
    paymentUrl?: StringNullableFilter<"ApiBooking"> | string | null
    paymentIntentId?: StringNullableFilter<"ApiBooking"> | string | null
    paidAt?: DateTimeNullableFilter<"ApiBooking"> | Date | string | null
    paymentExpiresAt?: DateTimeFilter<"ApiBooking"> | Date | string
    urgencyLevel?: StringFilter<"ApiBooking"> | string
    hoursOld?: IntFilter<"ApiBooking"> | number
    remindersSent?: IntFilter<"ApiBooking"> | number
    lastReminderAt?: DateTimeNullableFilter<"ApiBooking"> | Date | string | null
    leadSource?: StringFilter<"ApiBooking"> | string
    campaignName?: StringNullableFilter<"ApiBooking"> | string | null
    referralCode?: StringNullableFilter<"ApiBooking"> | string | null
    ghlWorkflowId?: StringNullableFilter<"ApiBooking"> | string | null
    triggerSource?: StringNullableFilter<"ApiBooking"> | string | null
    notes?: StringNullableFilter<"ApiBooking"> | string | null
    internalNotes?: StringNullableFilter<"ApiBooking"> | string | null
    createdAt?: DateTimeFilter<"ApiBooking"> | Date | string
    updatedAt?: DateTimeFilter<"ApiBooking"> | Date | string
    createdBy?: StringFilter<"ApiBooking"> | string
    paymentActions?: ApiPaymentActionListRelationFilter
    workflowTriggers?: ApiWorkflowTriggerListRelationFilter
    documents?: ApiBookingDocumentListRelationFilter
  }

  export type ApiBookingOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    ghlContactId?: SortOrder
    customerName?: SortOrder
    customerEmail?: SortOrder
    customerPhone?: SortOrder
    serviceName?: SortOrder
    serviceDescription?: SortOrderInput | SortOrder
    servicePrice?: SortOrder
    scheduledDateTime?: SortOrder
    duration?: SortOrder
    timezone?: SortOrder
    appointmentStatus?: SortOrder
    locationType?: SortOrder
    addressStreet?: SortOrderInput | SortOrder
    addressCity?: SortOrderInput | SortOrder
    addressState?: SortOrderInput | SortOrder
    addressZip?: SortOrderInput | SortOrder
    addressFormatted?: SortOrderInput | SortOrder
    locationNotes?: SortOrderInput | SortOrder
    paymentAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentUrl?: SortOrderInput | SortOrder
    paymentIntentId?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    paymentExpiresAt?: SortOrder
    urgencyLevel?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
    lastReminderAt?: SortOrderInput | SortOrder
    leadSource?: SortOrder
    campaignName?: SortOrderInput | SortOrder
    referralCode?: SortOrderInput | SortOrder
    ghlWorkflowId?: SortOrderInput | SortOrder
    triggerSource?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    internalNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    paymentActions?: ApiPaymentActionOrderByRelationAggregateInput
    workflowTriggers?: ApiWorkflowTriggerOrderByRelationAggregateInput
    documents?: ApiBookingDocumentOrderByRelationAggregateInput
  }

  export type ApiBookingWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    bookingId?: string
    AND?: ApiBookingWhereInput | ApiBookingWhereInput[]
    OR?: ApiBookingWhereInput[]
    NOT?: ApiBookingWhereInput | ApiBookingWhereInput[]
    ghlContactId?: StringFilter<"ApiBooking"> | string
    customerName?: StringFilter<"ApiBooking"> | string
    customerEmail?: StringFilter<"ApiBooking"> | string
    customerPhone?: StringFilter<"ApiBooking"> | string
    serviceName?: StringFilter<"ApiBooking"> | string
    serviceDescription?: StringNullableFilter<"ApiBooking"> | string | null
    servicePrice?: DecimalFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFilter<"ApiBooking"> | Date | string
    duration?: IntFilter<"ApiBooking"> | number
    timezone?: StringFilter<"ApiBooking"> | string
    appointmentStatus?: StringFilter<"ApiBooking"> | string
    locationType?: StringFilter<"ApiBooking"> | string
    addressStreet?: StringNullableFilter<"ApiBooking"> | string | null
    addressCity?: StringNullableFilter<"ApiBooking"> | string | null
    addressState?: StringNullableFilter<"ApiBooking"> | string | null
    addressZip?: StringNullableFilter<"ApiBooking"> | string | null
    addressFormatted?: StringNullableFilter<"ApiBooking"> | string | null
    locationNotes?: StringNullableFilter<"ApiBooking"> | string | null
    paymentAmount?: DecimalFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFilter<"ApiBooking"> | string
    paymentMethod?: StringFilter<"ApiBooking"> | string
    paymentUrl?: StringNullableFilter<"ApiBooking"> | string | null
    paymentIntentId?: StringNullableFilter<"ApiBooking"> | string | null
    paidAt?: DateTimeNullableFilter<"ApiBooking"> | Date | string | null
    paymentExpiresAt?: DateTimeFilter<"ApiBooking"> | Date | string
    urgencyLevel?: StringFilter<"ApiBooking"> | string
    hoursOld?: IntFilter<"ApiBooking"> | number
    remindersSent?: IntFilter<"ApiBooking"> | number
    lastReminderAt?: DateTimeNullableFilter<"ApiBooking"> | Date | string | null
    leadSource?: StringFilter<"ApiBooking"> | string
    campaignName?: StringNullableFilter<"ApiBooking"> | string | null
    referralCode?: StringNullableFilter<"ApiBooking"> | string | null
    ghlWorkflowId?: StringNullableFilter<"ApiBooking"> | string | null
    triggerSource?: StringNullableFilter<"ApiBooking"> | string | null
    notes?: StringNullableFilter<"ApiBooking"> | string | null
    internalNotes?: StringNullableFilter<"ApiBooking"> | string | null
    createdAt?: DateTimeFilter<"ApiBooking"> | Date | string
    updatedAt?: DateTimeFilter<"ApiBooking"> | Date | string
    createdBy?: StringFilter<"ApiBooking"> | string
    paymentActions?: ApiPaymentActionListRelationFilter
    workflowTriggers?: ApiWorkflowTriggerListRelationFilter
    documents?: ApiBookingDocumentListRelationFilter
  }, "id" | "bookingId">

  export type ApiBookingOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    ghlContactId?: SortOrder
    customerName?: SortOrder
    customerEmail?: SortOrder
    customerPhone?: SortOrder
    serviceName?: SortOrder
    serviceDescription?: SortOrderInput | SortOrder
    servicePrice?: SortOrder
    scheduledDateTime?: SortOrder
    duration?: SortOrder
    timezone?: SortOrder
    appointmentStatus?: SortOrder
    locationType?: SortOrder
    addressStreet?: SortOrderInput | SortOrder
    addressCity?: SortOrderInput | SortOrder
    addressState?: SortOrderInput | SortOrder
    addressZip?: SortOrderInput | SortOrder
    addressFormatted?: SortOrderInput | SortOrder
    locationNotes?: SortOrderInput | SortOrder
    paymentAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentUrl?: SortOrderInput | SortOrder
    paymentIntentId?: SortOrderInput | SortOrder
    paidAt?: SortOrderInput | SortOrder
    paymentExpiresAt?: SortOrder
    urgencyLevel?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
    lastReminderAt?: SortOrderInput | SortOrder
    leadSource?: SortOrder
    campaignName?: SortOrderInput | SortOrder
    referralCode?: SortOrderInput | SortOrder
    ghlWorkflowId?: SortOrderInput | SortOrder
    triggerSource?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    internalNotes?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
    _count?: ApiBookingCountOrderByAggregateInput
    _avg?: ApiBookingAvgOrderByAggregateInput
    _max?: ApiBookingMaxOrderByAggregateInput
    _min?: ApiBookingMinOrderByAggregateInput
    _sum?: ApiBookingSumOrderByAggregateInput
  }

  export type ApiBookingScalarWhereWithAggregatesInput = {
    AND?: ApiBookingScalarWhereWithAggregatesInput | ApiBookingScalarWhereWithAggregatesInput[]
    OR?: ApiBookingScalarWhereWithAggregatesInput[]
    NOT?: ApiBookingScalarWhereWithAggregatesInput | ApiBookingScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiBooking"> | string
    bookingId?: StringWithAggregatesFilter<"ApiBooking"> | string
    ghlContactId?: StringWithAggregatesFilter<"ApiBooking"> | string
    customerName?: StringWithAggregatesFilter<"ApiBooking"> | string
    customerEmail?: StringWithAggregatesFilter<"ApiBooking"> | string
    customerPhone?: StringWithAggregatesFilter<"ApiBooking"> | string
    serviceName?: StringWithAggregatesFilter<"ApiBooking"> | string
    serviceDescription?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    servicePrice?: DecimalWithAggregatesFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeWithAggregatesFilter<"ApiBooking"> | Date | string
    duration?: IntWithAggregatesFilter<"ApiBooking"> | number
    timezone?: StringWithAggregatesFilter<"ApiBooking"> | string
    appointmentStatus?: StringWithAggregatesFilter<"ApiBooking"> | string
    locationType?: StringWithAggregatesFilter<"ApiBooking"> | string
    addressStreet?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    addressCity?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    addressState?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    addressZip?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    addressFormatted?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    locationNotes?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    paymentAmount?: DecimalWithAggregatesFilter<"ApiBooking"> | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringWithAggregatesFilter<"ApiBooking"> | string
    paymentMethod?: StringWithAggregatesFilter<"ApiBooking"> | string
    paymentUrl?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    paymentIntentId?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    paidAt?: DateTimeNullableWithAggregatesFilter<"ApiBooking"> | Date | string | null
    paymentExpiresAt?: DateTimeWithAggregatesFilter<"ApiBooking"> | Date | string
    urgencyLevel?: StringWithAggregatesFilter<"ApiBooking"> | string
    hoursOld?: IntWithAggregatesFilter<"ApiBooking"> | number
    remindersSent?: IntWithAggregatesFilter<"ApiBooking"> | number
    lastReminderAt?: DateTimeNullableWithAggregatesFilter<"ApiBooking"> | Date | string | null
    leadSource?: StringWithAggregatesFilter<"ApiBooking"> | string
    campaignName?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    referralCode?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    ghlWorkflowId?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    triggerSource?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    notes?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    internalNotes?: StringNullableWithAggregatesFilter<"ApiBooking"> | string | null
    createdAt?: DateTimeWithAggregatesFilter<"ApiBooking"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ApiBooking"> | Date | string
    createdBy?: StringWithAggregatesFilter<"ApiBooking"> | string
  }

  export type ApiPaymentActionWhereInput = {
    AND?: ApiPaymentActionWhereInput | ApiPaymentActionWhereInput[]
    OR?: ApiPaymentActionWhereInput[]
    NOT?: ApiPaymentActionWhereInput | ApiPaymentActionWhereInput[]
    id?: StringFilter<"ApiPaymentAction"> | string
    bookingId?: StringFilter<"ApiPaymentAction"> | string
    actionType?: StringFilter<"ApiPaymentAction"> | string
    reminderType?: StringNullableFilter<"ApiPaymentAction"> | string | null
    notes?: StringNullableFilter<"ApiPaymentAction"> | string | null
    timestamp?: DateTimeFilter<"ApiPaymentAction"> | Date | string
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }

  export type ApiPaymentActionOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    actionType?: SortOrder
    reminderType?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    booking?: ApiBookingOrderByWithRelationInput
  }

  export type ApiPaymentActionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiPaymentActionWhereInput | ApiPaymentActionWhereInput[]
    OR?: ApiPaymentActionWhereInput[]
    NOT?: ApiPaymentActionWhereInput | ApiPaymentActionWhereInput[]
    bookingId?: StringFilter<"ApiPaymentAction"> | string
    actionType?: StringFilter<"ApiPaymentAction"> | string
    reminderType?: StringNullableFilter<"ApiPaymentAction"> | string | null
    notes?: StringNullableFilter<"ApiPaymentAction"> | string | null
    timestamp?: DateTimeFilter<"ApiPaymentAction"> | Date | string
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }, "id">

  export type ApiPaymentActionOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    actionType?: SortOrder
    reminderType?: SortOrderInput | SortOrder
    notes?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    _count?: ApiPaymentActionCountOrderByAggregateInput
    _max?: ApiPaymentActionMaxOrderByAggregateInput
    _min?: ApiPaymentActionMinOrderByAggregateInput
  }

  export type ApiPaymentActionScalarWhereWithAggregatesInput = {
    AND?: ApiPaymentActionScalarWhereWithAggregatesInput | ApiPaymentActionScalarWhereWithAggregatesInput[]
    OR?: ApiPaymentActionScalarWhereWithAggregatesInput[]
    NOT?: ApiPaymentActionScalarWhereWithAggregatesInput | ApiPaymentActionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiPaymentAction"> | string
    bookingId?: StringWithAggregatesFilter<"ApiPaymentAction"> | string
    actionType?: StringWithAggregatesFilter<"ApiPaymentAction"> | string
    reminderType?: StringNullableWithAggregatesFilter<"ApiPaymentAction"> | string | null
    notes?: StringNullableWithAggregatesFilter<"ApiPaymentAction"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"ApiPaymentAction"> | Date | string
  }

  export type ApiWorkflowTriggerWhereInput = {
    AND?: ApiWorkflowTriggerWhereInput | ApiWorkflowTriggerWhereInput[]
    OR?: ApiWorkflowTriggerWhereInput[]
    NOT?: ApiWorkflowTriggerWhereInput | ApiWorkflowTriggerWhereInput[]
    id?: StringFilter<"ApiWorkflowTrigger"> | string
    bookingId?: StringFilter<"ApiWorkflowTrigger"> | string
    workflowName?: StringFilter<"ApiWorkflowTrigger"> | string
    status?: StringFilter<"ApiWorkflowTrigger"> | string
    triggeredAt?: DateTimeFilter<"ApiWorkflowTrigger"> | Date | string
    completedAt?: DateTimeNullableFilter<"ApiWorkflowTrigger"> | Date | string | null
    errorMessage?: StringNullableFilter<"ApiWorkflowTrigger"> | string | null
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }

  export type ApiWorkflowTriggerOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    workflowName?: SortOrder
    status?: SortOrder
    triggeredAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    booking?: ApiBookingOrderByWithRelationInput
  }

  export type ApiWorkflowTriggerWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiWorkflowTriggerWhereInput | ApiWorkflowTriggerWhereInput[]
    OR?: ApiWorkflowTriggerWhereInput[]
    NOT?: ApiWorkflowTriggerWhereInput | ApiWorkflowTriggerWhereInput[]
    bookingId?: StringFilter<"ApiWorkflowTrigger"> | string
    workflowName?: StringFilter<"ApiWorkflowTrigger"> | string
    status?: StringFilter<"ApiWorkflowTrigger"> | string
    triggeredAt?: DateTimeFilter<"ApiWorkflowTrigger"> | Date | string
    completedAt?: DateTimeNullableFilter<"ApiWorkflowTrigger"> | Date | string | null
    errorMessage?: StringNullableFilter<"ApiWorkflowTrigger"> | string | null
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }, "id">

  export type ApiWorkflowTriggerOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    workflowName?: SortOrder
    status?: SortOrder
    triggeredAt?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    _count?: ApiWorkflowTriggerCountOrderByAggregateInput
    _max?: ApiWorkflowTriggerMaxOrderByAggregateInput
    _min?: ApiWorkflowTriggerMinOrderByAggregateInput
  }

  export type ApiWorkflowTriggerScalarWhereWithAggregatesInput = {
    AND?: ApiWorkflowTriggerScalarWhereWithAggregatesInput | ApiWorkflowTriggerScalarWhereWithAggregatesInput[]
    OR?: ApiWorkflowTriggerScalarWhereWithAggregatesInput[]
    NOT?: ApiWorkflowTriggerScalarWhereWithAggregatesInput | ApiWorkflowTriggerScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiWorkflowTrigger"> | string
    bookingId?: StringWithAggregatesFilter<"ApiWorkflowTrigger"> | string
    workflowName?: StringWithAggregatesFilter<"ApiWorkflowTrigger"> | string
    status?: StringWithAggregatesFilter<"ApiWorkflowTrigger"> | string
    triggeredAt?: DateTimeWithAggregatesFilter<"ApiWorkflowTrigger"> | Date | string
    completedAt?: DateTimeNullableWithAggregatesFilter<"ApiWorkflowTrigger"> | Date | string | null
    errorMessage?: StringNullableWithAggregatesFilter<"ApiWorkflowTrigger"> | string | null
  }

  export type ApiBookingDocumentWhereInput = {
    AND?: ApiBookingDocumentWhereInput | ApiBookingDocumentWhereInput[]
    OR?: ApiBookingDocumentWhereInput[]
    NOT?: ApiBookingDocumentWhereInput | ApiBookingDocumentWhereInput[]
    id?: StringFilter<"ApiBookingDocument"> | string
    bookingId?: StringFilter<"ApiBookingDocument"> | string
    name?: StringFilter<"ApiBookingDocument"> | string
    type?: StringFilter<"ApiBookingDocument"> | string
    count?: IntFilter<"ApiBookingDocument"> | number
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }

  export type ApiBookingDocumentOrderByWithRelationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    count?: SortOrder
    booking?: ApiBookingOrderByWithRelationInput
  }

  export type ApiBookingDocumentWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiBookingDocumentWhereInput | ApiBookingDocumentWhereInput[]
    OR?: ApiBookingDocumentWhereInput[]
    NOT?: ApiBookingDocumentWhereInput | ApiBookingDocumentWhereInput[]
    bookingId?: StringFilter<"ApiBookingDocument"> | string
    name?: StringFilter<"ApiBookingDocument"> | string
    type?: StringFilter<"ApiBookingDocument"> | string
    count?: IntFilter<"ApiBookingDocument"> | number
    booking?: XOR<ApiBookingScalarRelationFilter, ApiBookingWhereInput>
  }, "id">

  export type ApiBookingDocumentOrderByWithAggregationInput = {
    id?: SortOrder
    bookingId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    count?: SortOrder
    _count?: ApiBookingDocumentCountOrderByAggregateInput
    _avg?: ApiBookingDocumentAvgOrderByAggregateInput
    _max?: ApiBookingDocumentMaxOrderByAggregateInput
    _min?: ApiBookingDocumentMinOrderByAggregateInput
    _sum?: ApiBookingDocumentSumOrderByAggregateInput
  }

  export type ApiBookingDocumentScalarWhereWithAggregatesInput = {
    AND?: ApiBookingDocumentScalarWhereWithAggregatesInput | ApiBookingDocumentScalarWhereWithAggregatesInput[]
    OR?: ApiBookingDocumentScalarWhereWithAggregatesInput[]
    NOT?: ApiBookingDocumentScalarWhereWithAggregatesInput | ApiBookingDocumentScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiBookingDocument"> | string
    bookingId?: StringWithAggregatesFilter<"ApiBookingDocument"> | string
    name?: StringWithAggregatesFilter<"ApiBookingDocument"> | string
    type?: StringWithAggregatesFilter<"ApiBookingDocument"> | string
    count?: IntWithAggregatesFilter<"ApiBookingDocument"> | number
  }

  export type ApiBusinessMetricsWhereInput = {
    AND?: ApiBusinessMetricsWhereInput | ApiBusinessMetricsWhereInput[]
    OR?: ApiBusinessMetricsWhereInput[]
    NOT?: ApiBusinessMetricsWhereInput | ApiBusinessMetricsWhereInput[]
    id?: StringFilter<"ApiBusinessMetrics"> | string
    date?: DateTimeFilter<"ApiBusinessMetrics"> | Date | string
    totalBookings?: IntFilter<"ApiBusinessMetrics"> | number
    pendingPayments?: IntFilter<"ApiBusinessMetrics"> | number
    completedPayments?: IntFilter<"ApiBusinessMetrics"> | number
    failedPayments?: IntFilter<"ApiBusinessMetrics"> | number
    totalRevenue?: DecimalFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyMedium?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyHigh?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyCritical?: IntFilter<"ApiBusinessMetrics"> | number
    websiteBookings?: IntFilter<"ApiBusinessMetrics"> | number
    phoneBookings?: IntFilter<"ApiBusinessMetrics"> | number
    formBookings?: IntFilter<"ApiBusinessMetrics"> | number
    referralBookings?: IntFilter<"ApiBusinessMetrics"> | number
    adBookings?: IntFilter<"ApiBusinessMetrics"> | number
  }

  export type ApiBusinessMetricsOrderByWithRelationInput = {
    id?: SortOrder
    date?: SortOrder
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type ApiBusinessMetricsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    date?: Date | string
    AND?: ApiBusinessMetricsWhereInput | ApiBusinessMetricsWhereInput[]
    OR?: ApiBusinessMetricsWhereInput[]
    NOT?: ApiBusinessMetricsWhereInput | ApiBusinessMetricsWhereInput[]
    totalBookings?: IntFilter<"ApiBusinessMetrics"> | number
    pendingPayments?: IntFilter<"ApiBusinessMetrics"> | number
    completedPayments?: IntFilter<"ApiBusinessMetrics"> | number
    failedPayments?: IntFilter<"ApiBusinessMetrics"> | number
    totalRevenue?: DecimalFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyMedium?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyHigh?: IntFilter<"ApiBusinessMetrics"> | number
    urgencyCritical?: IntFilter<"ApiBusinessMetrics"> | number
    websiteBookings?: IntFilter<"ApiBusinessMetrics"> | number
    phoneBookings?: IntFilter<"ApiBusinessMetrics"> | number
    formBookings?: IntFilter<"ApiBusinessMetrics"> | number
    referralBookings?: IntFilter<"ApiBusinessMetrics"> | number
    adBookings?: IntFilter<"ApiBusinessMetrics"> | number
  }, "id" | "date">

  export type ApiBusinessMetricsOrderByWithAggregationInput = {
    id?: SortOrder
    date?: SortOrder
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
    _count?: ApiBusinessMetricsCountOrderByAggregateInput
    _avg?: ApiBusinessMetricsAvgOrderByAggregateInput
    _max?: ApiBusinessMetricsMaxOrderByAggregateInput
    _min?: ApiBusinessMetricsMinOrderByAggregateInput
    _sum?: ApiBusinessMetricsSumOrderByAggregateInput
  }

  export type ApiBusinessMetricsScalarWhereWithAggregatesInput = {
    AND?: ApiBusinessMetricsScalarWhereWithAggregatesInput | ApiBusinessMetricsScalarWhereWithAggregatesInput[]
    OR?: ApiBusinessMetricsScalarWhereWithAggregatesInput[]
    NOT?: ApiBusinessMetricsScalarWhereWithAggregatesInput | ApiBusinessMetricsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiBusinessMetrics"> | string
    date?: DateTimeWithAggregatesFilter<"ApiBusinessMetrics"> | Date | string
    totalBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    pendingPayments?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    completedPayments?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    failedPayments?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    totalRevenue?: DecimalWithAggregatesFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalWithAggregatesFilter<"ApiBusinessMetrics"> | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    urgencyMedium?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    urgencyHigh?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    urgencyCritical?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    websiteBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    phoneBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    formBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    referralBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
    adBookings?: IntWithAggregatesFilter<"ApiBusinessMetrics"> | number
  }

  export type ApiRequestLogWhereInput = {
    AND?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    OR?: ApiRequestLogWhereInput[]
    NOT?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    id?: StringFilter<"ApiRequestLog"> | string
    method?: StringFilter<"ApiRequestLog"> | string
    url?: StringFilter<"ApiRequestLog"> | string
    statusCode?: IntFilter<"ApiRequestLog"> | number
    duration?: IntFilter<"ApiRequestLog"> | number
    ip?: StringNullableFilter<"ApiRequestLog"> | string | null
    userAgent?: StringNullableFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeFilter<"ApiRequestLog"> | Date | string
    requestSize?: IntNullableFilter<"ApiRequestLog"> | number | null
    responseSize?: IntNullableFilter<"ApiRequestLog"> | number | null
    errorMessage?: StringNullableFilter<"ApiRequestLog"> | string | null
  }

  export type ApiRequestLogOrderByWithRelationInput = {
    id?: SortOrder
    method?: SortOrder
    url?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    ip?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    requestSize?: SortOrderInput | SortOrder
    responseSize?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
  }

  export type ApiRequestLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    OR?: ApiRequestLogWhereInput[]
    NOT?: ApiRequestLogWhereInput | ApiRequestLogWhereInput[]
    method?: StringFilter<"ApiRequestLog"> | string
    url?: StringFilter<"ApiRequestLog"> | string
    statusCode?: IntFilter<"ApiRequestLog"> | number
    duration?: IntFilter<"ApiRequestLog"> | number
    ip?: StringNullableFilter<"ApiRequestLog"> | string | null
    userAgent?: StringNullableFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeFilter<"ApiRequestLog"> | Date | string
    requestSize?: IntNullableFilter<"ApiRequestLog"> | number | null
    responseSize?: IntNullableFilter<"ApiRequestLog"> | number | null
    errorMessage?: StringNullableFilter<"ApiRequestLog"> | string | null
  }, "id">

  export type ApiRequestLogOrderByWithAggregationInput = {
    id?: SortOrder
    method?: SortOrder
    url?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    ip?: SortOrderInput | SortOrder
    userAgent?: SortOrderInput | SortOrder
    timestamp?: SortOrder
    requestSize?: SortOrderInput | SortOrder
    responseSize?: SortOrderInput | SortOrder
    errorMessage?: SortOrderInput | SortOrder
    _count?: ApiRequestLogCountOrderByAggregateInput
    _avg?: ApiRequestLogAvgOrderByAggregateInput
    _max?: ApiRequestLogMaxOrderByAggregateInput
    _min?: ApiRequestLogMinOrderByAggregateInput
    _sum?: ApiRequestLogSumOrderByAggregateInput
  }

  export type ApiRequestLogScalarWhereWithAggregatesInput = {
    AND?: ApiRequestLogScalarWhereWithAggregatesInput | ApiRequestLogScalarWhereWithAggregatesInput[]
    OR?: ApiRequestLogScalarWhereWithAggregatesInput[]
    NOT?: ApiRequestLogScalarWhereWithAggregatesInput | ApiRequestLogScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    method?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    url?: StringWithAggregatesFilter<"ApiRequestLog"> | string
    statusCode?: IntWithAggregatesFilter<"ApiRequestLog"> | number
    duration?: IntWithAggregatesFilter<"ApiRequestLog"> | number
    ip?: StringNullableWithAggregatesFilter<"ApiRequestLog"> | string | null
    userAgent?: StringNullableWithAggregatesFilter<"ApiRequestLog"> | string | null
    timestamp?: DateTimeWithAggregatesFilter<"ApiRequestLog"> | Date | string
    requestSize?: IntNullableWithAggregatesFilter<"ApiRequestLog"> | number | null
    responseSize?: IntNullableWithAggregatesFilter<"ApiRequestLog"> | number | null
    errorMessage?: StringNullableWithAggregatesFilter<"ApiRequestLog"> | string | null
  }

  export type ApiBookingCreateInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionCreateNestedManyWithoutBookingInput
    workflowTriggers?: ApiWorkflowTriggerCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingUncheckedCreateInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionUncheckedCreateNestedManyWithoutBookingInput
    workflowTriggers?: ApiWorkflowTriggerUncheckedCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentUncheckedCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUpdateManyWithoutBookingNestedInput
    workflowTriggers?: ApiWorkflowTriggerUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUncheckedUpdateManyWithoutBookingNestedInput
    workflowTriggers?: ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingCreateManyInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
  }

  export type ApiBookingUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ApiBookingUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
  }

  export type ApiPaymentActionCreateInput = {
    id?: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
    booking: ApiBookingCreateNestedOneWithoutPaymentActionsInput
  }

  export type ApiPaymentActionUncheckedCreateInput = {
    id?: string
    bookingId: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
  }

  export type ApiPaymentActionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    booking?: ApiBookingUpdateOneRequiredWithoutPaymentActionsNestedInput
  }

  export type ApiPaymentActionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPaymentActionCreateManyInput = {
    id?: string
    bookingId: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
  }

  export type ApiPaymentActionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPaymentActionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiWorkflowTriggerCreateInput = {
    id?: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
    booking: ApiBookingCreateNestedOneWithoutWorkflowTriggersInput
  }

  export type ApiWorkflowTriggerUncheckedCreateInput = {
    id?: string
    bookingId: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
  }

  export type ApiWorkflowTriggerUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
    booking?: ApiBookingUpdateOneRequiredWithoutWorkflowTriggersNestedInput
  }

  export type ApiWorkflowTriggerUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiWorkflowTriggerCreateManyInput = {
    id?: string
    bookingId: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
  }

  export type ApiWorkflowTriggerUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiWorkflowTriggerUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiBookingDocumentCreateInput = {
    id?: string
    name: string
    type: string
    count?: number
    booking: ApiBookingCreateNestedOneWithoutDocumentsInput
  }

  export type ApiBookingDocumentUncheckedCreateInput = {
    id?: string
    bookingId: string
    name: string
    type: string
    count?: number
  }

  export type ApiBookingDocumentUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    booking?: ApiBookingUpdateOneRequiredWithoutDocumentsNestedInput
  }

  export type ApiBookingDocumentUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBookingDocumentCreateManyInput = {
    id?: string
    bookingId: string
    name: string
    type: string
    count?: number
  }

  export type ApiBookingDocumentUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBookingDocumentUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBusinessMetricsCreateInput = {
    id?: string
    date?: Date | string
    totalBookings?: number
    pendingPayments?: number
    completedPayments?: number
    failedPayments?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    averageBookingValue?: Decimal | DecimalJsLike | number | string
    urgencyNew?: number
    urgencyMedium?: number
    urgencyHigh?: number
    urgencyCritical?: number
    websiteBookings?: number
    phoneBookings?: number
    formBookings?: number
    referralBookings?: number
    adBookings?: number
  }

  export type ApiBusinessMetricsUncheckedCreateInput = {
    id?: string
    date?: Date | string
    totalBookings?: number
    pendingPayments?: number
    completedPayments?: number
    failedPayments?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    averageBookingValue?: Decimal | DecimalJsLike | number | string
    urgencyNew?: number
    urgencyMedium?: number
    urgencyHigh?: number
    urgencyCritical?: number
    websiteBookings?: number
    phoneBookings?: number
    formBookings?: number
    referralBookings?: number
    adBookings?: number
  }

  export type ApiBusinessMetricsUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalBookings?: IntFieldUpdateOperationsInput | number
    pendingPayments?: IntFieldUpdateOperationsInput | number
    completedPayments?: IntFieldUpdateOperationsInput | number
    failedPayments?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFieldUpdateOperationsInput | number
    urgencyMedium?: IntFieldUpdateOperationsInput | number
    urgencyHigh?: IntFieldUpdateOperationsInput | number
    urgencyCritical?: IntFieldUpdateOperationsInput | number
    websiteBookings?: IntFieldUpdateOperationsInput | number
    phoneBookings?: IntFieldUpdateOperationsInput | number
    formBookings?: IntFieldUpdateOperationsInput | number
    referralBookings?: IntFieldUpdateOperationsInput | number
    adBookings?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBusinessMetricsUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalBookings?: IntFieldUpdateOperationsInput | number
    pendingPayments?: IntFieldUpdateOperationsInput | number
    completedPayments?: IntFieldUpdateOperationsInput | number
    failedPayments?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFieldUpdateOperationsInput | number
    urgencyMedium?: IntFieldUpdateOperationsInput | number
    urgencyHigh?: IntFieldUpdateOperationsInput | number
    urgencyCritical?: IntFieldUpdateOperationsInput | number
    websiteBookings?: IntFieldUpdateOperationsInput | number
    phoneBookings?: IntFieldUpdateOperationsInput | number
    formBookings?: IntFieldUpdateOperationsInput | number
    referralBookings?: IntFieldUpdateOperationsInput | number
    adBookings?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBusinessMetricsCreateManyInput = {
    id?: string
    date?: Date | string
    totalBookings?: number
    pendingPayments?: number
    completedPayments?: number
    failedPayments?: number
    totalRevenue?: Decimal | DecimalJsLike | number | string
    averageBookingValue?: Decimal | DecimalJsLike | number | string
    urgencyNew?: number
    urgencyMedium?: number
    urgencyHigh?: number
    urgencyCritical?: number
    websiteBookings?: number
    phoneBookings?: number
    formBookings?: number
    referralBookings?: number
    adBookings?: number
  }

  export type ApiBusinessMetricsUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalBookings?: IntFieldUpdateOperationsInput | number
    pendingPayments?: IntFieldUpdateOperationsInput | number
    completedPayments?: IntFieldUpdateOperationsInput | number
    failedPayments?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFieldUpdateOperationsInput | number
    urgencyMedium?: IntFieldUpdateOperationsInput | number
    urgencyHigh?: IntFieldUpdateOperationsInput | number
    urgencyCritical?: IntFieldUpdateOperationsInput | number
    websiteBookings?: IntFieldUpdateOperationsInput | number
    phoneBookings?: IntFieldUpdateOperationsInput | number
    formBookings?: IntFieldUpdateOperationsInput | number
    referralBookings?: IntFieldUpdateOperationsInput | number
    adBookings?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBusinessMetricsUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    date?: DateTimeFieldUpdateOperationsInput | Date | string
    totalBookings?: IntFieldUpdateOperationsInput | number
    pendingPayments?: IntFieldUpdateOperationsInput | number
    completedPayments?: IntFieldUpdateOperationsInput | number
    failedPayments?: IntFieldUpdateOperationsInput | number
    totalRevenue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    averageBookingValue?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    urgencyNew?: IntFieldUpdateOperationsInput | number
    urgencyMedium?: IntFieldUpdateOperationsInput | number
    urgencyHigh?: IntFieldUpdateOperationsInput | number
    urgencyCritical?: IntFieldUpdateOperationsInput | number
    websiteBookings?: IntFieldUpdateOperationsInput | number
    phoneBookings?: IntFieldUpdateOperationsInput | number
    formBookings?: IntFieldUpdateOperationsInput | number
    referralBookings?: IntFieldUpdateOperationsInput | number
    adBookings?: IntFieldUpdateOperationsInput | number
  }

  export type ApiRequestLogCreateInput = {
    id?: string
    method: string
    url: string
    statusCode: number
    duration: number
    ip?: string | null
    userAgent?: string | null
    timestamp?: Date | string
    requestSize?: number | null
    responseSize?: number | null
    errorMessage?: string | null
  }

  export type ApiRequestLogUncheckedCreateInput = {
    id?: string
    method: string
    url: string
    statusCode: number
    duration: number
    ip?: string | null
    userAgent?: string | null
    timestamp?: Date | string
    requestSize?: number | null
    responseSize?: number | null
    errorMessage?: string | null
  }

  export type ApiRequestLogUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    requestSize?: NullableIntFieldUpdateOperationsInput | number | null
    responseSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiRequestLogUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    requestSize?: NullableIntFieldUpdateOperationsInput | number | null
    responseSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiRequestLogCreateManyInput = {
    id?: string
    method: string
    url: string
    statusCode: number
    duration: number
    ip?: string | null
    userAgent?: string | null
    timestamp?: Date | string
    requestSize?: number | null
    responseSize?: number | null
    errorMessage?: string | null
  }

  export type ApiRequestLogUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    requestSize?: NullableIntFieldUpdateOperationsInput | number | null
    responseSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiRequestLogUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    method?: StringFieldUpdateOperationsInput | string
    url?: StringFieldUpdateOperationsInput | string
    statusCode?: IntFieldUpdateOperationsInput | number
    duration?: IntFieldUpdateOperationsInput | number
    ip?: NullableStringFieldUpdateOperationsInput | string | null
    userAgent?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
    requestSize?: NullableIntFieldUpdateOperationsInput | number | null
    responseSize?: NullableIntFieldUpdateOperationsInput | number | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type DecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ApiPaymentActionListRelationFilter = {
    every?: ApiPaymentActionWhereInput
    some?: ApiPaymentActionWhereInput
    none?: ApiPaymentActionWhereInput
  }

  export type ApiWorkflowTriggerListRelationFilter = {
    every?: ApiWorkflowTriggerWhereInput
    some?: ApiWorkflowTriggerWhereInput
    none?: ApiWorkflowTriggerWhereInput
  }

  export type ApiBookingDocumentListRelationFilter = {
    every?: ApiBookingDocumentWhereInput
    some?: ApiBookingDocumentWhereInput
    none?: ApiBookingDocumentWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ApiPaymentActionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApiWorkflowTriggerOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApiBookingDocumentOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ApiBookingCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    ghlContactId?: SortOrder
    customerName?: SortOrder
    customerEmail?: SortOrder
    customerPhone?: SortOrder
    serviceName?: SortOrder
    serviceDescription?: SortOrder
    servicePrice?: SortOrder
    scheduledDateTime?: SortOrder
    duration?: SortOrder
    timezone?: SortOrder
    appointmentStatus?: SortOrder
    locationType?: SortOrder
    addressStreet?: SortOrder
    addressCity?: SortOrder
    addressState?: SortOrder
    addressZip?: SortOrder
    addressFormatted?: SortOrder
    locationNotes?: SortOrder
    paymentAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentUrl?: SortOrder
    paymentIntentId?: SortOrder
    paidAt?: SortOrder
    paymentExpiresAt?: SortOrder
    urgencyLevel?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
    lastReminderAt?: SortOrder
    leadSource?: SortOrder
    campaignName?: SortOrder
    referralCode?: SortOrder
    ghlWorkflowId?: SortOrder
    triggerSource?: SortOrder
    notes?: SortOrder
    internalNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ApiBookingAvgOrderByAggregateInput = {
    servicePrice?: SortOrder
    duration?: SortOrder
    paymentAmount?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
  }

  export type ApiBookingMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    ghlContactId?: SortOrder
    customerName?: SortOrder
    customerEmail?: SortOrder
    customerPhone?: SortOrder
    serviceName?: SortOrder
    serviceDescription?: SortOrder
    servicePrice?: SortOrder
    scheduledDateTime?: SortOrder
    duration?: SortOrder
    timezone?: SortOrder
    appointmentStatus?: SortOrder
    locationType?: SortOrder
    addressStreet?: SortOrder
    addressCity?: SortOrder
    addressState?: SortOrder
    addressZip?: SortOrder
    addressFormatted?: SortOrder
    locationNotes?: SortOrder
    paymentAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentUrl?: SortOrder
    paymentIntentId?: SortOrder
    paidAt?: SortOrder
    paymentExpiresAt?: SortOrder
    urgencyLevel?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
    lastReminderAt?: SortOrder
    leadSource?: SortOrder
    campaignName?: SortOrder
    referralCode?: SortOrder
    ghlWorkflowId?: SortOrder
    triggerSource?: SortOrder
    notes?: SortOrder
    internalNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ApiBookingMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    ghlContactId?: SortOrder
    customerName?: SortOrder
    customerEmail?: SortOrder
    customerPhone?: SortOrder
    serviceName?: SortOrder
    serviceDescription?: SortOrder
    servicePrice?: SortOrder
    scheduledDateTime?: SortOrder
    duration?: SortOrder
    timezone?: SortOrder
    appointmentStatus?: SortOrder
    locationType?: SortOrder
    addressStreet?: SortOrder
    addressCity?: SortOrder
    addressState?: SortOrder
    addressZip?: SortOrder
    addressFormatted?: SortOrder
    locationNotes?: SortOrder
    paymentAmount?: SortOrder
    paymentStatus?: SortOrder
    paymentMethod?: SortOrder
    paymentUrl?: SortOrder
    paymentIntentId?: SortOrder
    paidAt?: SortOrder
    paymentExpiresAt?: SortOrder
    urgencyLevel?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
    lastReminderAt?: SortOrder
    leadSource?: SortOrder
    campaignName?: SortOrder
    referralCode?: SortOrder
    ghlWorkflowId?: SortOrder
    triggerSource?: SortOrder
    notes?: SortOrder
    internalNotes?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    createdBy?: SortOrder
  }

  export type ApiBookingSumOrderByAggregateInput = {
    servicePrice?: SortOrder
    duration?: SortOrder
    paymentAmount?: SortOrder
    hoursOld?: SortOrder
    remindersSent?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type DecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ApiBookingScalarRelationFilter = {
    is?: ApiBookingWhereInput
    isNot?: ApiBookingWhereInput
  }

  export type ApiPaymentActionCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    actionType?: SortOrder
    reminderType?: SortOrder
    notes?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiPaymentActionMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    actionType?: SortOrder
    reminderType?: SortOrder
    notes?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiPaymentActionMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    actionType?: SortOrder
    reminderType?: SortOrder
    notes?: SortOrder
    timestamp?: SortOrder
  }

  export type ApiWorkflowTriggerCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    workflowName?: SortOrder
    status?: SortOrder
    triggeredAt?: SortOrder
    completedAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiWorkflowTriggerMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    workflowName?: SortOrder
    status?: SortOrder
    triggeredAt?: SortOrder
    completedAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiWorkflowTriggerMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    workflowName?: SortOrder
    status?: SortOrder
    triggeredAt?: SortOrder
    completedAt?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiBookingDocumentCountOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    count?: SortOrder
  }

  export type ApiBookingDocumentAvgOrderByAggregateInput = {
    count?: SortOrder
  }

  export type ApiBookingDocumentMaxOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    count?: SortOrder
  }

  export type ApiBookingDocumentMinOrderByAggregateInput = {
    id?: SortOrder
    bookingId?: SortOrder
    name?: SortOrder
    type?: SortOrder
    count?: SortOrder
  }

  export type ApiBookingDocumentSumOrderByAggregateInput = {
    count?: SortOrder
  }

  export type ApiBusinessMetricsCountOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type ApiBusinessMetricsAvgOrderByAggregateInput = {
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type ApiBusinessMetricsMaxOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type ApiBusinessMetricsMinOrderByAggregateInput = {
    id?: SortOrder
    date?: SortOrder
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type ApiBusinessMetricsSumOrderByAggregateInput = {
    totalBookings?: SortOrder
    pendingPayments?: SortOrder
    completedPayments?: SortOrder
    failedPayments?: SortOrder
    totalRevenue?: SortOrder
    averageBookingValue?: SortOrder
    urgencyNew?: SortOrder
    urgencyMedium?: SortOrder
    urgencyHigh?: SortOrder
    urgencyCritical?: SortOrder
    websiteBookings?: SortOrder
    phoneBookings?: SortOrder
    formBookings?: SortOrder
    referralBookings?: SortOrder
    adBookings?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type ApiRequestLogCountOrderByAggregateInput = {
    id?: SortOrder
    method?: SortOrder
    url?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
    requestSize?: SortOrder
    responseSize?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiRequestLogAvgOrderByAggregateInput = {
    statusCode?: SortOrder
    duration?: SortOrder
    requestSize?: SortOrder
    responseSize?: SortOrder
  }

  export type ApiRequestLogMaxOrderByAggregateInput = {
    id?: SortOrder
    method?: SortOrder
    url?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
    requestSize?: SortOrder
    responseSize?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiRequestLogMinOrderByAggregateInput = {
    id?: SortOrder
    method?: SortOrder
    url?: SortOrder
    statusCode?: SortOrder
    duration?: SortOrder
    ip?: SortOrder
    userAgent?: SortOrder
    timestamp?: SortOrder
    requestSize?: SortOrder
    responseSize?: SortOrder
    errorMessage?: SortOrder
  }

  export type ApiRequestLogSumOrderByAggregateInput = {
    statusCode?: SortOrder
    duration?: SortOrder
    requestSize?: SortOrder
    responseSize?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type ApiPaymentActionCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput> | ApiPaymentActionCreateWithoutBookingInput[] | ApiPaymentActionUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiPaymentActionCreateOrConnectWithoutBookingInput | ApiPaymentActionCreateOrConnectWithoutBookingInput[]
    createMany?: ApiPaymentActionCreateManyBookingInputEnvelope
    connect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
  }

  export type ApiWorkflowTriggerCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput> | ApiWorkflowTriggerCreateWithoutBookingInput[] | ApiWorkflowTriggerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiWorkflowTriggerCreateOrConnectWithoutBookingInput | ApiWorkflowTriggerCreateOrConnectWithoutBookingInput[]
    createMany?: ApiWorkflowTriggerCreateManyBookingInputEnvelope
    connect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
  }

  export type ApiBookingDocumentCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput> | ApiBookingDocumentCreateWithoutBookingInput[] | ApiBookingDocumentUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiBookingDocumentCreateOrConnectWithoutBookingInput | ApiBookingDocumentCreateOrConnectWithoutBookingInput[]
    createMany?: ApiBookingDocumentCreateManyBookingInputEnvelope
    connect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
  }

  export type ApiPaymentActionUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput> | ApiPaymentActionCreateWithoutBookingInput[] | ApiPaymentActionUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiPaymentActionCreateOrConnectWithoutBookingInput | ApiPaymentActionCreateOrConnectWithoutBookingInput[]
    createMany?: ApiPaymentActionCreateManyBookingInputEnvelope
    connect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
  }

  export type ApiWorkflowTriggerUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput> | ApiWorkflowTriggerCreateWithoutBookingInput[] | ApiWorkflowTriggerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiWorkflowTriggerCreateOrConnectWithoutBookingInput | ApiWorkflowTriggerCreateOrConnectWithoutBookingInput[]
    createMany?: ApiWorkflowTriggerCreateManyBookingInputEnvelope
    connect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
  }

  export type ApiBookingDocumentUncheckedCreateNestedManyWithoutBookingInput = {
    create?: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput> | ApiBookingDocumentCreateWithoutBookingInput[] | ApiBookingDocumentUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiBookingDocumentCreateOrConnectWithoutBookingInput | ApiBookingDocumentCreateOrConnectWithoutBookingInput[]
    createMany?: ApiBookingDocumentCreateManyBookingInputEnvelope
    connect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type DecimalFieldUpdateOperationsInput = {
    set?: Decimal | DecimalJsLike | number | string
    increment?: Decimal | DecimalJsLike | number | string
    decrement?: Decimal | DecimalJsLike | number | string
    multiply?: Decimal | DecimalJsLike | number | string
    divide?: Decimal | DecimalJsLike | number | string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ApiPaymentActionUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput> | ApiPaymentActionCreateWithoutBookingInput[] | ApiPaymentActionUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiPaymentActionCreateOrConnectWithoutBookingInput | ApiPaymentActionCreateOrConnectWithoutBookingInput[]
    upsert?: ApiPaymentActionUpsertWithWhereUniqueWithoutBookingInput | ApiPaymentActionUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiPaymentActionCreateManyBookingInputEnvelope
    set?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    disconnect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    delete?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    connect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    update?: ApiPaymentActionUpdateWithWhereUniqueWithoutBookingInput | ApiPaymentActionUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiPaymentActionUpdateManyWithWhereWithoutBookingInput | ApiPaymentActionUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiPaymentActionScalarWhereInput | ApiPaymentActionScalarWhereInput[]
  }

  export type ApiWorkflowTriggerUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput> | ApiWorkflowTriggerCreateWithoutBookingInput[] | ApiWorkflowTriggerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiWorkflowTriggerCreateOrConnectWithoutBookingInput | ApiWorkflowTriggerCreateOrConnectWithoutBookingInput[]
    upsert?: ApiWorkflowTriggerUpsertWithWhereUniqueWithoutBookingInput | ApiWorkflowTriggerUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiWorkflowTriggerCreateManyBookingInputEnvelope
    set?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    disconnect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    delete?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    connect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    update?: ApiWorkflowTriggerUpdateWithWhereUniqueWithoutBookingInput | ApiWorkflowTriggerUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiWorkflowTriggerUpdateManyWithWhereWithoutBookingInput | ApiWorkflowTriggerUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiWorkflowTriggerScalarWhereInput | ApiWorkflowTriggerScalarWhereInput[]
  }

  export type ApiBookingDocumentUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput> | ApiBookingDocumentCreateWithoutBookingInput[] | ApiBookingDocumentUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiBookingDocumentCreateOrConnectWithoutBookingInput | ApiBookingDocumentCreateOrConnectWithoutBookingInput[]
    upsert?: ApiBookingDocumentUpsertWithWhereUniqueWithoutBookingInput | ApiBookingDocumentUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiBookingDocumentCreateManyBookingInputEnvelope
    set?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    disconnect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    delete?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    connect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    update?: ApiBookingDocumentUpdateWithWhereUniqueWithoutBookingInput | ApiBookingDocumentUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiBookingDocumentUpdateManyWithWhereWithoutBookingInput | ApiBookingDocumentUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiBookingDocumentScalarWhereInput | ApiBookingDocumentScalarWhereInput[]
  }

  export type ApiPaymentActionUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput> | ApiPaymentActionCreateWithoutBookingInput[] | ApiPaymentActionUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiPaymentActionCreateOrConnectWithoutBookingInput | ApiPaymentActionCreateOrConnectWithoutBookingInput[]
    upsert?: ApiPaymentActionUpsertWithWhereUniqueWithoutBookingInput | ApiPaymentActionUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiPaymentActionCreateManyBookingInputEnvelope
    set?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    disconnect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    delete?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    connect?: ApiPaymentActionWhereUniqueInput | ApiPaymentActionWhereUniqueInput[]
    update?: ApiPaymentActionUpdateWithWhereUniqueWithoutBookingInput | ApiPaymentActionUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiPaymentActionUpdateManyWithWhereWithoutBookingInput | ApiPaymentActionUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiPaymentActionScalarWhereInput | ApiPaymentActionScalarWhereInput[]
  }

  export type ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput> | ApiWorkflowTriggerCreateWithoutBookingInput[] | ApiWorkflowTriggerUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiWorkflowTriggerCreateOrConnectWithoutBookingInput | ApiWorkflowTriggerCreateOrConnectWithoutBookingInput[]
    upsert?: ApiWorkflowTriggerUpsertWithWhereUniqueWithoutBookingInput | ApiWorkflowTriggerUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiWorkflowTriggerCreateManyBookingInputEnvelope
    set?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    disconnect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    delete?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    connect?: ApiWorkflowTriggerWhereUniqueInput | ApiWorkflowTriggerWhereUniqueInput[]
    update?: ApiWorkflowTriggerUpdateWithWhereUniqueWithoutBookingInput | ApiWorkflowTriggerUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiWorkflowTriggerUpdateManyWithWhereWithoutBookingInput | ApiWorkflowTriggerUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiWorkflowTriggerScalarWhereInput | ApiWorkflowTriggerScalarWhereInput[]
  }

  export type ApiBookingDocumentUncheckedUpdateManyWithoutBookingNestedInput = {
    create?: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput> | ApiBookingDocumentCreateWithoutBookingInput[] | ApiBookingDocumentUncheckedCreateWithoutBookingInput[]
    connectOrCreate?: ApiBookingDocumentCreateOrConnectWithoutBookingInput | ApiBookingDocumentCreateOrConnectWithoutBookingInput[]
    upsert?: ApiBookingDocumentUpsertWithWhereUniqueWithoutBookingInput | ApiBookingDocumentUpsertWithWhereUniqueWithoutBookingInput[]
    createMany?: ApiBookingDocumentCreateManyBookingInputEnvelope
    set?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    disconnect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    delete?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    connect?: ApiBookingDocumentWhereUniqueInput | ApiBookingDocumentWhereUniqueInput[]
    update?: ApiBookingDocumentUpdateWithWhereUniqueWithoutBookingInput | ApiBookingDocumentUpdateWithWhereUniqueWithoutBookingInput[]
    updateMany?: ApiBookingDocumentUpdateManyWithWhereWithoutBookingInput | ApiBookingDocumentUpdateManyWithWhereWithoutBookingInput[]
    deleteMany?: ApiBookingDocumentScalarWhereInput | ApiBookingDocumentScalarWhereInput[]
  }

  export type ApiBookingCreateNestedOneWithoutPaymentActionsInput = {
    create?: XOR<ApiBookingCreateWithoutPaymentActionsInput, ApiBookingUncheckedCreateWithoutPaymentActionsInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutPaymentActionsInput
    connect?: ApiBookingWhereUniqueInput
  }

  export type ApiBookingUpdateOneRequiredWithoutPaymentActionsNestedInput = {
    create?: XOR<ApiBookingCreateWithoutPaymentActionsInput, ApiBookingUncheckedCreateWithoutPaymentActionsInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutPaymentActionsInput
    upsert?: ApiBookingUpsertWithoutPaymentActionsInput
    connect?: ApiBookingWhereUniqueInput
    update?: XOR<XOR<ApiBookingUpdateToOneWithWhereWithoutPaymentActionsInput, ApiBookingUpdateWithoutPaymentActionsInput>, ApiBookingUncheckedUpdateWithoutPaymentActionsInput>
  }

  export type ApiBookingCreateNestedOneWithoutWorkflowTriggersInput = {
    create?: XOR<ApiBookingCreateWithoutWorkflowTriggersInput, ApiBookingUncheckedCreateWithoutWorkflowTriggersInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutWorkflowTriggersInput
    connect?: ApiBookingWhereUniqueInput
  }

  export type ApiBookingUpdateOneRequiredWithoutWorkflowTriggersNestedInput = {
    create?: XOR<ApiBookingCreateWithoutWorkflowTriggersInput, ApiBookingUncheckedCreateWithoutWorkflowTriggersInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutWorkflowTriggersInput
    upsert?: ApiBookingUpsertWithoutWorkflowTriggersInput
    connect?: ApiBookingWhereUniqueInput
    update?: XOR<XOR<ApiBookingUpdateToOneWithWhereWithoutWorkflowTriggersInput, ApiBookingUpdateWithoutWorkflowTriggersInput>, ApiBookingUncheckedUpdateWithoutWorkflowTriggersInput>
  }

  export type ApiBookingCreateNestedOneWithoutDocumentsInput = {
    create?: XOR<ApiBookingCreateWithoutDocumentsInput, ApiBookingUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutDocumentsInput
    connect?: ApiBookingWhereUniqueInput
  }

  export type ApiBookingUpdateOneRequiredWithoutDocumentsNestedInput = {
    create?: XOR<ApiBookingCreateWithoutDocumentsInput, ApiBookingUncheckedCreateWithoutDocumentsInput>
    connectOrCreate?: ApiBookingCreateOrConnectWithoutDocumentsInput
    upsert?: ApiBookingUpsertWithoutDocumentsInput
    connect?: ApiBookingWhereUniqueInput
    update?: XOR<XOR<ApiBookingUpdateToOneWithWhereWithoutDocumentsInput, ApiBookingUpdateWithoutDocumentsInput>, ApiBookingUncheckedUpdateWithoutDocumentsInput>
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedDecimalFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedDecimalWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    in?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    notIn?: Decimal[] | DecimalJsLike[] | number[] | string[] | ListDecimalFieldRefInput<$PrismaModel>
    lt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    lte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gt?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    gte?: Decimal | DecimalJsLike | number | string | DecimalFieldRefInput<$PrismaModel>
    not?: NestedDecimalWithAggregatesFilter<$PrismaModel> | Decimal | DecimalJsLike | number | string
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedDecimalFilter<$PrismaModel>
    _sum?: NestedDecimalFilter<$PrismaModel>
    _min?: NestedDecimalFilter<$PrismaModel>
    _max?: NestedDecimalFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type ApiPaymentActionCreateWithoutBookingInput = {
    id?: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
  }

  export type ApiPaymentActionUncheckedCreateWithoutBookingInput = {
    id?: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
  }

  export type ApiPaymentActionCreateOrConnectWithoutBookingInput = {
    where: ApiPaymentActionWhereUniqueInput
    create: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput>
  }

  export type ApiPaymentActionCreateManyBookingInputEnvelope = {
    data: ApiPaymentActionCreateManyBookingInput | ApiPaymentActionCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type ApiWorkflowTriggerCreateWithoutBookingInput = {
    id?: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
  }

  export type ApiWorkflowTriggerUncheckedCreateWithoutBookingInput = {
    id?: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
  }

  export type ApiWorkflowTriggerCreateOrConnectWithoutBookingInput = {
    where: ApiWorkflowTriggerWhereUniqueInput
    create: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput>
  }

  export type ApiWorkflowTriggerCreateManyBookingInputEnvelope = {
    data: ApiWorkflowTriggerCreateManyBookingInput | ApiWorkflowTriggerCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type ApiBookingDocumentCreateWithoutBookingInput = {
    id?: string
    name: string
    type: string
    count?: number
  }

  export type ApiBookingDocumentUncheckedCreateWithoutBookingInput = {
    id?: string
    name: string
    type: string
    count?: number
  }

  export type ApiBookingDocumentCreateOrConnectWithoutBookingInput = {
    where: ApiBookingDocumentWhereUniqueInput
    create: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput>
  }

  export type ApiBookingDocumentCreateManyBookingInputEnvelope = {
    data: ApiBookingDocumentCreateManyBookingInput | ApiBookingDocumentCreateManyBookingInput[]
    skipDuplicates?: boolean
  }

  export type ApiPaymentActionUpsertWithWhereUniqueWithoutBookingInput = {
    where: ApiPaymentActionWhereUniqueInput
    update: XOR<ApiPaymentActionUpdateWithoutBookingInput, ApiPaymentActionUncheckedUpdateWithoutBookingInput>
    create: XOR<ApiPaymentActionCreateWithoutBookingInput, ApiPaymentActionUncheckedCreateWithoutBookingInput>
  }

  export type ApiPaymentActionUpdateWithWhereUniqueWithoutBookingInput = {
    where: ApiPaymentActionWhereUniqueInput
    data: XOR<ApiPaymentActionUpdateWithoutBookingInput, ApiPaymentActionUncheckedUpdateWithoutBookingInput>
  }

  export type ApiPaymentActionUpdateManyWithWhereWithoutBookingInput = {
    where: ApiPaymentActionScalarWhereInput
    data: XOR<ApiPaymentActionUpdateManyMutationInput, ApiPaymentActionUncheckedUpdateManyWithoutBookingInput>
  }

  export type ApiPaymentActionScalarWhereInput = {
    AND?: ApiPaymentActionScalarWhereInput | ApiPaymentActionScalarWhereInput[]
    OR?: ApiPaymentActionScalarWhereInput[]
    NOT?: ApiPaymentActionScalarWhereInput | ApiPaymentActionScalarWhereInput[]
    id?: StringFilter<"ApiPaymentAction"> | string
    bookingId?: StringFilter<"ApiPaymentAction"> | string
    actionType?: StringFilter<"ApiPaymentAction"> | string
    reminderType?: StringNullableFilter<"ApiPaymentAction"> | string | null
    notes?: StringNullableFilter<"ApiPaymentAction"> | string | null
    timestamp?: DateTimeFilter<"ApiPaymentAction"> | Date | string
  }

  export type ApiWorkflowTriggerUpsertWithWhereUniqueWithoutBookingInput = {
    where: ApiWorkflowTriggerWhereUniqueInput
    update: XOR<ApiWorkflowTriggerUpdateWithoutBookingInput, ApiWorkflowTriggerUncheckedUpdateWithoutBookingInput>
    create: XOR<ApiWorkflowTriggerCreateWithoutBookingInput, ApiWorkflowTriggerUncheckedCreateWithoutBookingInput>
  }

  export type ApiWorkflowTriggerUpdateWithWhereUniqueWithoutBookingInput = {
    where: ApiWorkflowTriggerWhereUniqueInput
    data: XOR<ApiWorkflowTriggerUpdateWithoutBookingInput, ApiWorkflowTriggerUncheckedUpdateWithoutBookingInput>
  }

  export type ApiWorkflowTriggerUpdateManyWithWhereWithoutBookingInput = {
    where: ApiWorkflowTriggerScalarWhereInput
    data: XOR<ApiWorkflowTriggerUpdateManyMutationInput, ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingInput>
  }

  export type ApiWorkflowTriggerScalarWhereInput = {
    AND?: ApiWorkflowTriggerScalarWhereInput | ApiWorkflowTriggerScalarWhereInput[]
    OR?: ApiWorkflowTriggerScalarWhereInput[]
    NOT?: ApiWorkflowTriggerScalarWhereInput | ApiWorkflowTriggerScalarWhereInput[]
    id?: StringFilter<"ApiWorkflowTrigger"> | string
    bookingId?: StringFilter<"ApiWorkflowTrigger"> | string
    workflowName?: StringFilter<"ApiWorkflowTrigger"> | string
    status?: StringFilter<"ApiWorkflowTrigger"> | string
    triggeredAt?: DateTimeFilter<"ApiWorkflowTrigger"> | Date | string
    completedAt?: DateTimeNullableFilter<"ApiWorkflowTrigger"> | Date | string | null
    errorMessage?: StringNullableFilter<"ApiWorkflowTrigger"> | string | null
  }

  export type ApiBookingDocumentUpsertWithWhereUniqueWithoutBookingInput = {
    where: ApiBookingDocumentWhereUniqueInput
    update: XOR<ApiBookingDocumentUpdateWithoutBookingInput, ApiBookingDocumentUncheckedUpdateWithoutBookingInput>
    create: XOR<ApiBookingDocumentCreateWithoutBookingInput, ApiBookingDocumentUncheckedCreateWithoutBookingInput>
  }

  export type ApiBookingDocumentUpdateWithWhereUniqueWithoutBookingInput = {
    where: ApiBookingDocumentWhereUniqueInput
    data: XOR<ApiBookingDocumentUpdateWithoutBookingInput, ApiBookingDocumentUncheckedUpdateWithoutBookingInput>
  }

  export type ApiBookingDocumentUpdateManyWithWhereWithoutBookingInput = {
    where: ApiBookingDocumentScalarWhereInput
    data: XOR<ApiBookingDocumentUpdateManyMutationInput, ApiBookingDocumentUncheckedUpdateManyWithoutBookingInput>
  }

  export type ApiBookingDocumentScalarWhereInput = {
    AND?: ApiBookingDocumentScalarWhereInput | ApiBookingDocumentScalarWhereInput[]
    OR?: ApiBookingDocumentScalarWhereInput[]
    NOT?: ApiBookingDocumentScalarWhereInput | ApiBookingDocumentScalarWhereInput[]
    id?: StringFilter<"ApiBookingDocument"> | string
    bookingId?: StringFilter<"ApiBookingDocument"> | string
    name?: StringFilter<"ApiBookingDocument"> | string
    type?: StringFilter<"ApiBookingDocument"> | string
    count?: IntFilter<"ApiBookingDocument"> | number
  }

  export type ApiBookingCreateWithoutPaymentActionsInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    workflowTriggers?: ApiWorkflowTriggerCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingUncheckedCreateWithoutPaymentActionsInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    workflowTriggers?: ApiWorkflowTriggerUncheckedCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentUncheckedCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingCreateOrConnectWithoutPaymentActionsInput = {
    where: ApiBookingWhereUniqueInput
    create: XOR<ApiBookingCreateWithoutPaymentActionsInput, ApiBookingUncheckedCreateWithoutPaymentActionsInput>
  }

  export type ApiBookingUpsertWithoutPaymentActionsInput = {
    update: XOR<ApiBookingUpdateWithoutPaymentActionsInput, ApiBookingUncheckedUpdateWithoutPaymentActionsInput>
    create: XOR<ApiBookingCreateWithoutPaymentActionsInput, ApiBookingUncheckedCreateWithoutPaymentActionsInput>
    where?: ApiBookingWhereInput
  }

  export type ApiBookingUpdateToOneWithWhereWithoutPaymentActionsInput = {
    where?: ApiBookingWhereInput
    data: XOR<ApiBookingUpdateWithoutPaymentActionsInput, ApiBookingUncheckedUpdateWithoutPaymentActionsInput>
  }

  export type ApiBookingUpdateWithoutPaymentActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    workflowTriggers?: ApiWorkflowTriggerUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingUncheckedUpdateWithoutPaymentActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    workflowTriggers?: ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingCreateWithoutWorkflowTriggersInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingUncheckedCreateWithoutWorkflowTriggersInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionUncheckedCreateNestedManyWithoutBookingInput
    documents?: ApiBookingDocumentUncheckedCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingCreateOrConnectWithoutWorkflowTriggersInput = {
    where: ApiBookingWhereUniqueInput
    create: XOR<ApiBookingCreateWithoutWorkflowTriggersInput, ApiBookingUncheckedCreateWithoutWorkflowTriggersInput>
  }

  export type ApiBookingUpsertWithoutWorkflowTriggersInput = {
    update: XOR<ApiBookingUpdateWithoutWorkflowTriggersInput, ApiBookingUncheckedUpdateWithoutWorkflowTriggersInput>
    create: XOR<ApiBookingCreateWithoutWorkflowTriggersInput, ApiBookingUncheckedCreateWithoutWorkflowTriggersInput>
    where?: ApiBookingWhereInput
  }

  export type ApiBookingUpdateToOneWithWhereWithoutWorkflowTriggersInput = {
    where?: ApiBookingWhereInput
    data: XOR<ApiBookingUpdateWithoutWorkflowTriggersInput, ApiBookingUncheckedUpdateWithoutWorkflowTriggersInput>
  }

  export type ApiBookingUpdateWithoutWorkflowTriggersInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingUncheckedUpdateWithoutWorkflowTriggersInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUncheckedUpdateManyWithoutBookingNestedInput
    documents?: ApiBookingDocumentUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingCreateWithoutDocumentsInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionCreateNestedManyWithoutBookingInput
    workflowTriggers?: ApiWorkflowTriggerCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingUncheckedCreateWithoutDocumentsInput = {
    id?: string
    bookingId: string
    ghlContactId: string
    customerName: string
    customerEmail: string
    customerPhone: string
    serviceName: string
    serviceDescription?: string | null
    servicePrice: Decimal | DecimalJsLike | number | string
    scheduledDateTime: Date | string
    duration?: number
    timezone?: string
    appointmentStatus?: string
    locationType: string
    addressStreet?: string | null
    addressCity?: string | null
    addressState?: string | null
    addressZip?: string | null
    addressFormatted?: string | null
    locationNotes?: string | null
    paymentAmount: Decimal | DecimalJsLike | number | string
    paymentStatus?: string
    paymentMethod?: string
    paymentUrl?: string | null
    paymentIntentId?: string | null
    paidAt?: Date | string | null
    paymentExpiresAt: Date | string
    urgencyLevel?: string
    hoursOld?: number
    remindersSent?: number
    lastReminderAt?: Date | string | null
    leadSource: string
    campaignName?: string | null
    referralCode?: string | null
    ghlWorkflowId?: string | null
    triggerSource?: string | null
    notes?: string | null
    internalNotes?: string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    createdBy?: string
    paymentActions?: ApiPaymentActionUncheckedCreateNestedManyWithoutBookingInput
    workflowTriggers?: ApiWorkflowTriggerUncheckedCreateNestedManyWithoutBookingInput
  }

  export type ApiBookingCreateOrConnectWithoutDocumentsInput = {
    where: ApiBookingWhereUniqueInput
    create: XOR<ApiBookingCreateWithoutDocumentsInput, ApiBookingUncheckedCreateWithoutDocumentsInput>
  }

  export type ApiBookingUpsertWithoutDocumentsInput = {
    update: XOR<ApiBookingUpdateWithoutDocumentsInput, ApiBookingUncheckedUpdateWithoutDocumentsInput>
    create: XOR<ApiBookingCreateWithoutDocumentsInput, ApiBookingUncheckedCreateWithoutDocumentsInput>
    where?: ApiBookingWhereInput
  }

  export type ApiBookingUpdateToOneWithWhereWithoutDocumentsInput = {
    where?: ApiBookingWhereInput
    data: XOR<ApiBookingUpdateWithoutDocumentsInput, ApiBookingUncheckedUpdateWithoutDocumentsInput>
  }

  export type ApiBookingUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUpdateManyWithoutBookingNestedInput
    workflowTriggers?: ApiWorkflowTriggerUpdateManyWithoutBookingNestedInput
  }

  export type ApiBookingUncheckedUpdateWithoutDocumentsInput = {
    id?: StringFieldUpdateOperationsInput | string
    bookingId?: StringFieldUpdateOperationsInput | string
    ghlContactId?: StringFieldUpdateOperationsInput | string
    customerName?: StringFieldUpdateOperationsInput | string
    customerEmail?: StringFieldUpdateOperationsInput | string
    customerPhone?: StringFieldUpdateOperationsInput | string
    serviceName?: StringFieldUpdateOperationsInput | string
    serviceDescription?: NullableStringFieldUpdateOperationsInput | string | null
    servicePrice?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    scheduledDateTime?: DateTimeFieldUpdateOperationsInput | Date | string
    duration?: IntFieldUpdateOperationsInput | number
    timezone?: StringFieldUpdateOperationsInput | string
    appointmentStatus?: StringFieldUpdateOperationsInput | string
    locationType?: StringFieldUpdateOperationsInput | string
    addressStreet?: NullableStringFieldUpdateOperationsInput | string | null
    addressCity?: NullableStringFieldUpdateOperationsInput | string | null
    addressState?: NullableStringFieldUpdateOperationsInput | string | null
    addressZip?: NullableStringFieldUpdateOperationsInput | string | null
    addressFormatted?: NullableStringFieldUpdateOperationsInput | string | null
    locationNotes?: NullableStringFieldUpdateOperationsInput | string | null
    paymentAmount?: DecimalFieldUpdateOperationsInput | Decimal | DecimalJsLike | number | string
    paymentStatus?: StringFieldUpdateOperationsInput | string
    paymentMethod?: StringFieldUpdateOperationsInput | string
    paymentUrl?: NullableStringFieldUpdateOperationsInput | string | null
    paymentIntentId?: NullableStringFieldUpdateOperationsInput | string | null
    paidAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    paymentExpiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    urgencyLevel?: StringFieldUpdateOperationsInput | string
    hoursOld?: IntFieldUpdateOperationsInput | number
    remindersSent?: IntFieldUpdateOperationsInput | number
    lastReminderAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    leadSource?: StringFieldUpdateOperationsInput | string
    campaignName?: NullableStringFieldUpdateOperationsInput | string | null
    referralCode?: NullableStringFieldUpdateOperationsInput | string | null
    ghlWorkflowId?: NullableStringFieldUpdateOperationsInput | string | null
    triggerSource?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    internalNotes?: NullableStringFieldUpdateOperationsInput | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdBy?: StringFieldUpdateOperationsInput | string
    paymentActions?: ApiPaymentActionUncheckedUpdateManyWithoutBookingNestedInput
    workflowTriggers?: ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingNestedInput
  }

  export type ApiPaymentActionCreateManyBookingInput = {
    id?: string
    actionType: string
    reminderType?: string | null
    notes?: string | null
    timestamp?: Date | string
  }

  export type ApiWorkflowTriggerCreateManyBookingInput = {
    id?: string
    workflowName: string
    status?: string
    triggeredAt?: Date | string
    completedAt?: Date | string | null
    errorMessage?: string | null
  }

  export type ApiBookingDocumentCreateManyBookingInput = {
    id?: string
    name: string
    type: string
    count?: number
  }

  export type ApiPaymentActionUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPaymentActionUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiPaymentActionUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    actionType?: StringFieldUpdateOperationsInput | string
    reminderType?: NullableStringFieldUpdateOperationsInput | string | null
    notes?: NullableStringFieldUpdateOperationsInput | string | null
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ApiWorkflowTriggerUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiWorkflowTriggerUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiWorkflowTriggerUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    workflowName?: StringFieldUpdateOperationsInput | string
    status?: StringFieldUpdateOperationsInput | string
    triggeredAt?: DateTimeFieldUpdateOperationsInput | Date | string
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    errorMessage?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type ApiBookingDocumentUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBookingDocumentUncheckedUpdateWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }

  export type ApiBookingDocumentUncheckedUpdateManyWithoutBookingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}