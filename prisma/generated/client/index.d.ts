
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
 * Model UserConferenceLogs
 * 
 */
export type UserConferenceLogs = $Result.DefaultSelection<Prisma.$UserConferenceLogsPayload>
/**
 * Model UserInteractLogs
 * 
 */
export type UserInteractLogs = $Result.DefaultSelection<Prisma.$UserInteractLogsPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more UserConferenceLogs
 * const userConferenceLogs = await prisma.userConferenceLogs.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
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
   * // Fetch zero or more UserConferenceLogs
   * const userConferenceLogs = await prisma.userConferenceLogs.findMany()
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
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P]): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number }): $Utils.JsPromise<R>

  /**
   * Executes a raw MongoDB command and returns the result of it.
   * @example
   * ```
   * const user = await prisma.$runCommandRaw({
   *   aggregate: 'User',
   *   pipeline: [{ $match: { name: 'Bob' } }, { $project: { email: true, _id: false } }],
   *   explain: false,
   * })
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $runCommandRaw(command: Prisma.InputJsonObject): Prisma.PrismaPromise<Prisma.JsonObject>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.userConferenceLogs`: Exposes CRUD operations for the **UserConferenceLogs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserConferenceLogs
    * const userConferenceLogs = await prisma.userConferenceLogs.findMany()
    * ```
    */
  get userConferenceLogs(): Prisma.UserConferenceLogsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userInteractLogs`: Exposes CRUD operations for the **UserInteractLogs** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserInteractLogs
    * const userInteractLogs = await prisma.userInteractLogs.findMany()
    * ```
    */
  get userInteractLogs(): Prisma.UserInteractLogsDelegate<ExtArgs, ClientOptions>;
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
   * Prisma Client JS version: 6.14.0
   * Query Engine version: 717184b7b35ea05dfa71a3236b7af656013e1e49
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
    UserConferenceLogs: 'UserConferenceLogs',
    UserInteractLogs: 'UserInteractLogs'
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
      modelProps: "userConferenceLogs" | "userInteractLogs"
      txIsolationLevel: never
    }
    model: {
      UserConferenceLogs: {
        payload: Prisma.$UserConferenceLogsPayload<ExtArgs>
        fields: Prisma.UserConferenceLogsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserConferenceLogsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserConferenceLogsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          findFirst: {
            args: Prisma.UserConferenceLogsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserConferenceLogsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          findMany: {
            args: Prisma.UserConferenceLogsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>[]
          }
          create: {
            args: Prisma.UserConferenceLogsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          createMany: {
            args: Prisma.UserConferenceLogsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserConferenceLogsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          update: {
            args: Prisma.UserConferenceLogsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          deleteMany: {
            args: Prisma.UserConferenceLogsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserConferenceLogsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserConferenceLogsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserConferenceLogsPayload>
          }
          aggregate: {
            args: Prisma.UserConferenceLogsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserConferenceLogs>
          }
          groupBy: {
            args: Prisma.UserConferenceLogsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserConferenceLogsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserConferenceLogsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserConferenceLogsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserConferenceLogsCountArgs<ExtArgs>
            result: $Utils.Optional<UserConferenceLogsCountAggregateOutputType> | number
          }
        }
      }
      UserInteractLogs: {
        payload: Prisma.$UserInteractLogsPayload<ExtArgs>
        fields: Prisma.UserInteractLogsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserInteractLogsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserInteractLogsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          findFirst: {
            args: Prisma.UserInteractLogsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserInteractLogsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          findMany: {
            args: Prisma.UserInteractLogsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>[]
          }
          create: {
            args: Prisma.UserInteractLogsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          createMany: {
            args: Prisma.UserInteractLogsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          delete: {
            args: Prisma.UserInteractLogsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          update: {
            args: Prisma.UserInteractLogsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          deleteMany: {
            args: Prisma.UserInteractLogsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserInteractLogsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.UserInteractLogsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserInteractLogsPayload>
          }
          aggregate: {
            args: Prisma.UserInteractLogsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserInteractLogs>
          }
          groupBy: {
            args: Prisma.UserInteractLogsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserInteractLogsGroupByOutputType>[]
          }
          findRaw: {
            args: Prisma.UserInteractLogsFindRawArgs<ExtArgs>
            result: JsonObject
          }
          aggregateRaw: {
            args: Prisma.UserInteractLogsAggregateRawArgs<ExtArgs>
            result: JsonObject
          }
          count: {
            args: Prisma.UserInteractLogsCountArgs<ExtArgs>
            result: $Utils.Optional<UserInteractLogsCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $runCommandRaw: {
          args: Prisma.InputJsonObject,
          result: Prisma.JsonObject
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
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
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
    userConferenceLogs?: UserConferenceLogsOmit
    userInteractLogs?: UserInteractLogsOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

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
   * Models
   */

  /**
   * Model UserConferenceLogs
   */

  export type AggregateUserConferenceLogs = {
    _count: UserConferenceLogsCountAggregateOutputType | null
    _avg: UserConferenceLogsAvgAggregateOutputType | null
    _sum: UserConferenceLogsSumAggregateOutputType | null
    _min: UserConferenceLogsMinAggregateOutputType | null
    _max: UserConferenceLogsMaxAggregateOutputType | null
  }

  export type UserConferenceLogsAvgAggregateOutputType = {
    trustCredit: number | null
  }

  export type UserConferenceLogsSumAggregateOutputType = {
    trustCredit: number | null
  }

  export type UserConferenceLogsMinAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    conferenceId: string | null
    trustCredit: number | null
    timestamp: Date | null
  }

  export type UserConferenceLogsMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    conferenceId: string | null
    trustCredit: number | null
    timestamp: Date | null
  }

  export type UserConferenceLogsCountAggregateOutputType = {
    id: number
    userId: number
    action: number
    conferenceId: number
    trustCredit: number
    timestamp: number
    _all: number
  }


  export type UserConferenceLogsAvgAggregateInputType = {
    trustCredit?: true
  }

  export type UserConferenceLogsSumAggregateInputType = {
    trustCredit?: true
  }

  export type UserConferenceLogsMinAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    conferenceId?: true
    trustCredit?: true
    timestamp?: true
  }

  export type UserConferenceLogsMaxAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    conferenceId?: true
    trustCredit?: true
    timestamp?: true
  }

  export type UserConferenceLogsCountAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    conferenceId?: true
    trustCredit?: true
    timestamp?: true
    _all?: true
  }

  export type UserConferenceLogsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserConferenceLogs to aggregate.
     */
    where?: UserConferenceLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserConferenceLogs to fetch.
     */
    orderBy?: UserConferenceLogsOrderByWithRelationInput | UserConferenceLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserConferenceLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserConferenceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserConferenceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserConferenceLogs
    **/
    _count?: true | UserConferenceLogsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserConferenceLogsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserConferenceLogsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserConferenceLogsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserConferenceLogsMaxAggregateInputType
  }

  export type GetUserConferenceLogsAggregateType<T extends UserConferenceLogsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserConferenceLogs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserConferenceLogs[P]>
      : GetScalarType<T[P], AggregateUserConferenceLogs[P]>
  }




  export type UserConferenceLogsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserConferenceLogsWhereInput
    orderBy?: UserConferenceLogsOrderByWithAggregationInput | UserConferenceLogsOrderByWithAggregationInput[]
    by: UserConferenceLogsScalarFieldEnum[] | UserConferenceLogsScalarFieldEnum
    having?: UserConferenceLogsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserConferenceLogsCountAggregateInputType | true
    _avg?: UserConferenceLogsAvgAggregateInputType
    _sum?: UserConferenceLogsSumAggregateInputType
    _min?: UserConferenceLogsMinAggregateInputType
    _max?: UserConferenceLogsMaxAggregateInputType
  }

  export type UserConferenceLogsGroupByOutputType = {
    id: string
    userId: string
    action: string
    conferenceId: string
    trustCredit: number
    timestamp: Date
    _count: UserConferenceLogsCountAggregateOutputType | null
    _avg: UserConferenceLogsAvgAggregateOutputType | null
    _sum: UserConferenceLogsSumAggregateOutputType | null
    _min: UserConferenceLogsMinAggregateOutputType | null
    _max: UserConferenceLogsMaxAggregateOutputType | null
  }

  type GetUserConferenceLogsGroupByPayload<T extends UserConferenceLogsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserConferenceLogsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserConferenceLogsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserConferenceLogsGroupByOutputType[P]>
            : GetScalarType<T[P], UserConferenceLogsGroupByOutputType[P]>
        }
      >
    >


  export type UserConferenceLogsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    conferenceId?: boolean
    trustCredit?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["userConferenceLogs"]>



  export type UserConferenceLogsSelectScalar = {
    id?: boolean
    userId?: boolean
    action?: boolean
    conferenceId?: boolean
    trustCredit?: boolean
    timestamp?: boolean
  }

  export type UserConferenceLogsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "action" | "conferenceId" | "trustCredit" | "timestamp", ExtArgs["result"]["userConferenceLogs"]>

  export type $UserConferenceLogsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserConferenceLogs"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      action: string
      conferenceId: string
      trustCredit: number
      timestamp: Date
    }, ExtArgs["result"]["userConferenceLogs"]>
    composites: {}
  }

  type UserConferenceLogsGetPayload<S extends boolean | null | undefined | UserConferenceLogsDefaultArgs> = $Result.GetResult<Prisma.$UserConferenceLogsPayload, S>

  type UserConferenceLogsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserConferenceLogsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserConferenceLogsCountAggregateInputType | true
    }

  export interface UserConferenceLogsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserConferenceLogs'], meta: { name: 'UserConferenceLogs' } }
    /**
     * Find zero or one UserConferenceLogs that matches the filter.
     * @param {UserConferenceLogsFindUniqueArgs} args - Arguments to find a UserConferenceLogs
     * @example
     * // Get one UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserConferenceLogsFindUniqueArgs>(args: SelectSubset<T, UserConferenceLogsFindUniqueArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserConferenceLogs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserConferenceLogsFindUniqueOrThrowArgs} args - Arguments to find a UserConferenceLogs
     * @example
     * // Get one UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserConferenceLogsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserConferenceLogsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserConferenceLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsFindFirstArgs} args - Arguments to find a UserConferenceLogs
     * @example
     * // Get one UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserConferenceLogsFindFirstArgs>(args?: SelectSubset<T, UserConferenceLogsFindFirstArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserConferenceLogs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsFindFirstOrThrowArgs} args - Arguments to find a UserConferenceLogs
     * @example
     * // Get one UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserConferenceLogsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserConferenceLogsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserConferenceLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findMany()
     * 
     * // Get first 10 UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userConferenceLogsWithIdOnly = await prisma.userConferenceLogs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserConferenceLogsFindManyArgs>(args?: SelectSubset<T, UserConferenceLogsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserConferenceLogs.
     * @param {UserConferenceLogsCreateArgs} args - Arguments to create a UserConferenceLogs.
     * @example
     * // Create one UserConferenceLogs
     * const UserConferenceLogs = await prisma.userConferenceLogs.create({
     *   data: {
     *     // ... data to create a UserConferenceLogs
     *   }
     * })
     * 
     */
    create<T extends UserConferenceLogsCreateArgs>(args: SelectSubset<T, UserConferenceLogsCreateArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserConferenceLogs.
     * @param {UserConferenceLogsCreateManyArgs} args - Arguments to create many UserConferenceLogs.
     * @example
     * // Create many UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserConferenceLogsCreateManyArgs>(args?: SelectSubset<T, UserConferenceLogsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserConferenceLogs.
     * @param {UserConferenceLogsDeleteArgs} args - Arguments to delete one UserConferenceLogs.
     * @example
     * // Delete one UserConferenceLogs
     * const UserConferenceLogs = await prisma.userConferenceLogs.delete({
     *   where: {
     *     // ... filter to delete one UserConferenceLogs
     *   }
     * })
     * 
     */
    delete<T extends UserConferenceLogsDeleteArgs>(args: SelectSubset<T, UserConferenceLogsDeleteArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserConferenceLogs.
     * @param {UserConferenceLogsUpdateArgs} args - Arguments to update one UserConferenceLogs.
     * @example
     * // Update one UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserConferenceLogsUpdateArgs>(args: SelectSubset<T, UserConferenceLogsUpdateArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserConferenceLogs.
     * @param {UserConferenceLogsDeleteManyArgs} args - Arguments to filter UserConferenceLogs to delete.
     * @example
     * // Delete a few UserConferenceLogs
     * const { count } = await prisma.userConferenceLogs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserConferenceLogsDeleteManyArgs>(args?: SelectSubset<T, UserConferenceLogsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserConferenceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserConferenceLogsUpdateManyArgs>(args: SelectSubset<T, UserConferenceLogsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserConferenceLogs.
     * @param {UserConferenceLogsUpsertArgs} args - Arguments to update or create a UserConferenceLogs.
     * @example
     * // Update or create a UserConferenceLogs
     * const userConferenceLogs = await prisma.userConferenceLogs.upsert({
     *   create: {
     *     // ... data to create a UserConferenceLogs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserConferenceLogs we want to update
     *   }
     * })
     */
    upsert<T extends UserConferenceLogsUpsertArgs>(args: SelectSubset<T, UserConferenceLogsUpsertArgs<ExtArgs>>): Prisma__UserConferenceLogsClient<$Result.GetResult<Prisma.$UserConferenceLogsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserConferenceLogs that matches the filter.
     * @param {UserConferenceLogsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const userConferenceLogs = await prisma.userConferenceLogs.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: UserConferenceLogsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a UserConferenceLogs.
     * @param {UserConferenceLogsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const userConferenceLogs = await prisma.userConferenceLogs.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserConferenceLogsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of UserConferenceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsCountArgs} args - Arguments to filter UserConferenceLogs to count.
     * @example
     * // Count the number of UserConferenceLogs
     * const count = await prisma.userConferenceLogs.count({
     *   where: {
     *     // ... the filter for the UserConferenceLogs we want to count
     *   }
     * })
    **/
    count<T extends UserConferenceLogsCountArgs>(
      args?: Subset<T, UserConferenceLogsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserConferenceLogsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserConferenceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserConferenceLogsAggregateArgs>(args: Subset<T, UserConferenceLogsAggregateArgs>): Prisma.PrismaPromise<GetUserConferenceLogsAggregateType<T>>

    /**
     * Group by UserConferenceLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserConferenceLogsGroupByArgs} args - Group by arguments.
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
      T extends UserConferenceLogsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserConferenceLogsGroupByArgs['orderBy'] }
        : { orderBy?: UserConferenceLogsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserConferenceLogsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserConferenceLogsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserConferenceLogs model
   */
  readonly fields: UserConferenceLogsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserConferenceLogs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserConferenceLogsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserConferenceLogs model
   */
  interface UserConferenceLogsFieldRefs {
    readonly id: FieldRef<"UserConferenceLogs", 'String'>
    readonly userId: FieldRef<"UserConferenceLogs", 'String'>
    readonly action: FieldRef<"UserConferenceLogs", 'String'>
    readonly conferenceId: FieldRef<"UserConferenceLogs", 'String'>
    readonly trustCredit: FieldRef<"UserConferenceLogs", 'Int'>
    readonly timestamp: FieldRef<"UserConferenceLogs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserConferenceLogs findUnique
   */
  export type UserConferenceLogsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserConferenceLogs to fetch.
     */
    where: UserConferenceLogsWhereUniqueInput
  }

  /**
   * UserConferenceLogs findUniqueOrThrow
   */
  export type UserConferenceLogsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserConferenceLogs to fetch.
     */
    where: UserConferenceLogsWhereUniqueInput
  }

  /**
   * UserConferenceLogs findFirst
   */
  export type UserConferenceLogsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserConferenceLogs to fetch.
     */
    where?: UserConferenceLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserConferenceLogs to fetch.
     */
    orderBy?: UserConferenceLogsOrderByWithRelationInput | UserConferenceLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserConferenceLogs.
     */
    cursor?: UserConferenceLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserConferenceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserConferenceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserConferenceLogs.
     */
    distinct?: UserConferenceLogsScalarFieldEnum | UserConferenceLogsScalarFieldEnum[]
  }

  /**
   * UserConferenceLogs findFirstOrThrow
   */
  export type UserConferenceLogsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserConferenceLogs to fetch.
     */
    where?: UserConferenceLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserConferenceLogs to fetch.
     */
    orderBy?: UserConferenceLogsOrderByWithRelationInput | UserConferenceLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserConferenceLogs.
     */
    cursor?: UserConferenceLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserConferenceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserConferenceLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserConferenceLogs.
     */
    distinct?: UserConferenceLogsScalarFieldEnum | UserConferenceLogsScalarFieldEnum[]
  }

  /**
   * UserConferenceLogs findMany
   */
  export type UserConferenceLogsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserConferenceLogs to fetch.
     */
    where?: UserConferenceLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserConferenceLogs to fetch.
     */
    orderBy?: UserConferenceLogsOrderByWithRelationInput | UserConferenceLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserConferenceLogs.
     */
    cursor?: UserConferenceLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserConferenceLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserConferenceLogs.
     */
    skip?: number
    distinct?: UserConferenceLogsScalarFieldEnum | UserConferenceLogsScalarFieldEnum[]
  }

  /**
   * UserConferenceLogs create
   */
  export type UserConferenceLogsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * The data needed to create a UserConferenceLogs.
     */
    data: XOR<UserConferenceLogsCreateInput, UserConferenceLogsUncheckedCreateInput>
  }

  /**
   * UserConferenceLogs createMany
   */
  export type UserConferenceLogsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserConferenceLogs.
     */
    data: UserConferenceLogsCreateManyInput | UserConferenceLogsCreateManyInput[]
  }

  /**
   * UserConferenceLogs update
   */
  export type UserConferenceLogsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * The data needed to update a UserConferenceLogs.
     */
    data: XOR<UserConferenceLogsUpdateInput, UserConferenceLogsUncheckedUpdateInput>
    /**
     * Choose, which UserConferenceLogs to update.
     */
    where: UserConferenceLogsWhereUniqueInput
  }

  /**
   * UserConferenceLogs updateMany
   */
  export type UserConferenceLogsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserConferenceLogs.
     */
    data: XOR<UserConferenceLogsUpdateManyMutationInput, UserConferenceLogsUncheckedUpdateManyInput>
    /**
     * Filter which UserConferenceLogs to update
     */
    where?: UserConferenceLogsWhereInput
    /**
     * Limit how many UserConferenceLogs to update.
     */
    limit?: number
  }

  /**
   * UserConferenceLogs upsert
   */
  export type UserConferenceLogsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * The filter to search for the UserConferenceLogs to update in case it exists.
     */
    where: UserConferenceLogsWhereUniqueInput
    /**
     * In case the UserConferenceLogs found by the `where` argument doesn't exist, create a new UserConferenceLogs with this data.
     */
    create: XOR<UserConferenceLogsCreateInput, UserConferenceLogsUncheckedCreateInput>
    /**
     * In case the UserConferenceLogs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserConferenceLogsUpdateInput, UserConferenceLogsUncheckedUpdateInput>
  }

  /**
   * UserConferenceLogs delete
   */
  export type UserConferenceLogsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
    /**
     * Filter which UserConferenceLogs to delete.
     */
    where: UserConferenceLogsWhereUniqueInput
  }

  /**
   * UserConferenceLogs deleteMany
   */
  export type UserConferenceLogsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserConferenceLogs to delete
     */
    where?: UserConferenceLogsWhereInput
    /**
     * Limit how many UserConferenceLogs to delete.
     */
    limit?: number
  }

  /**
   * UserConferenceLogs findRaw
   */
  export type UserConferenceLogsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserConferenceLogs aggregateRaw
   */
  export type UserConferenceLogsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserConferenceLogs without action
   */
  export type UserConferenceLogsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserConferenceLogs
     */
    select?: UserConferenceLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserConferenceLogs
     */
    omit?: UserConferenceLogsOmit<ExtArgs> | null
  }


  /**
   * Model UserInteractLogs
   */

  export type AggregateUserInteractLogs = {
    _count: UserInteractLogsCountAggregateOutputType | null
    _avg: UserInteractLogsAvgAggregateOutputType | null
    _sum: UserInteractLogsSumAggregateOutputType | null
    _min: UserInteractLogsMinAggregateOutputType | null
    _max: UserInteractLogsMaxAggregateOutputType | null
  }

  export type UserInteractLogsAvgAggregateOutputType = {
    trustCredit: number | null
  }

  export type UserInteractLogsSumAggregateOutputType = {
    trustCredit: number | null
  }

  export type UserInteractLogsMinAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    content: string | null
    trustCredit: number | null
    timestamp: Date | null
  }

  export type UserInteractLogsMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    action: string | null
    content: string | null
    trustCredit: number | null
    timestamp: Date | null
  }

  export type UserInteractLogsCountAggregateOutputType = {
    id: number
    userId: number
    action: number
    content: number
    trustCredit: number
    timestamp: number
    _all: number
  }


  export type UserInteractLogsAvgAggregateInputType = {
    trustCredit?: true
  }

  export type UserInteractLogsSumAggregateInputType = {
    trustCredit?: true
  }

  export type UserInteractLogsMinAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    content?: true
    trustCredit?: true
    timestamp?: true
  }

  export type UserInteractLogsMaxAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    content?: true
    trustCredit?: true
    timestamp?: true
  }

  export type UserInteractLogsCountAggregateInputType = {
    id?: true
    userId?: true
    action?: true
    content?: true
    trustCredit?: true
    timestamp?: true
    _all?: true
  }

  export type UserInteractLogsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserInteractLogs to aggregate.
     */
    where?: UserInteractLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInteractLogs to fetch.
     */
    orderBy?: UserInteractLogsOrderByWithRelationInput | UserInteractLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserInteractLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInteractLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInteractLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserInteractLogs
    **/
    _count?: true | UserInteractLogsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserInteractLogsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserInteractLogsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserInteractLogsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserInteractLogsMaxAggregateInputType
  }

  export type GetUserInteractLogsAggregateType<T extends UserInteractLogsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserInteractLogs]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserInteractLogs[P]>
      : GetScalarType<T[P], AggregateUserInteractLogs[P]>
  }




  export type UserInteractLogsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserInteractLogsWhereInput
    orderBy?: UserInteractLogsOrderByWithAggregationInput | UserInteractLogsOrderByWithAggregationInput[]
    by: UserInteractLogsScalarFieldEnum[] | UserInteractLogsScalarFieldEnum
    having?: UserInteractLogsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserInteractLogsCountAggregateInputType | true
    _avg?: UserInteractLogsAvgAggregateInputType
    _sum?: UserInteractLogsSumAggregateInputType
    _min?: UserInteractLogsMinAggregateInputType
    _max?: UserInteractLogsMaxAggregateInputType
  }

  export type UserInteractLogsGroupByOutputType = {
    id: string
    userId: string
    action: string
    content: string
    trustCredit: number
    timestamp: Date
    _count: UserInteractLogsCountAggregateOutputType | null
    _avg: UserInteractLogsAvgAggregateOutputType | null
    _sum: UserInteractLogsSumAggregateOutputType | null
    _min: UserInteractLogsMinAggregateOutputType | null
    _max: UserInteractLogsMaxAggregateOutputType | null
  }

  type GetUserInteractLogsGroupByPayload<T extends UserInteractLogsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserInteractLogsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserInteractLogsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserInteractLogsGroupByOutputType[P]>
            : GetScalarType<T[P], UserInteractLogsGroupByOutputType[P]>
        }
      >
    >


  export type UserInteractLogsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    action?: boolean
    content?: boolean
    trustCredit?: boolean
    timestamp?: boolean
  }, ExtArgs["result"]["userInteractLogs"]>



  export type UserInteractLogsSelectScalar = {
    id?: boolean
    userId?: boolean
    action?: boolean
    content?: boolean
    trustCredit?: boolean
    timestamp?: boolean
  }

  export type UserInteractLogsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "action" | "content" | "trustCredit" | "timestamp", ExtArgs["result"]["userInteractLogs"]>

  export type $UserInteractLogsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserInteractLogs"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      action: string
      content: string
      trustCredit: number
      timestamp: Date
    }, ExtArgs["result"]["userInteractLogs"]>
    composites: {}
  }

  type UserInteractLogsGetPayload<S extends boolean | null | undefined | UserInteractLogsDefaultArgs> = $Result.GetResult<Prisma.$UserInteractLogsPayload, S>

  type UserInteractLogsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserInteractLogsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserInteractLogsCountAggregateInputType | true
    }

  export interface UserInteractLogsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserInteractLogs'], meta: { name: 'UserInteractLogs' } }
    /**
     * Find zero or one UserInteractLogs that matches the filter.
     * @param {UserInteractLogsFindUniqueArgs} args - Arguments to find a UserInteractLogs
     * @example
     * // Get one UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserInteractLogsFindUniqueArgs>(args: SelectSubset<T, UserInteractLogsFindUniqueArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserInteractLogs that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserInteractLogsFindUniqueOrThrowArgs} args - Arguments to find a UserInteractLogs
     * @example
     * // Get one UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserInteractLogsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserInteractLogsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserInteractLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsFindFirstArgs} args - Arguments to find a UserInteractLogs
     * @example
     * // Get one UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserInteractLogsFindFirstArgs>(args?: SelectSubset<T, UserInteractLogsFindFirstArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserInteractLogs that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsFindFirstOrThrowArgs} args - Arguments to find a UserInteractLogs
     * @example
     * // Get one UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserInteractLogsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserInteractLogsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserInteractLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findMany()
     * 
     * // Get first 10 UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userInteractLogsWithIdOnly = await prisma.userInteractLogs.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserInteractLogsFindManyArgs>(args?: SelectSubset<T, UserInteractLogsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserInteractLogs.
     * @param {UserInteractLogsCreateArgs} args - Arguments to create a UserInteractLogs.
     * @example
     * // Create one UserInteractLogs
     * const UserInteractLogs = await prisma.userInteractLogs.create({
     *   data: {
     *     // ... data to create a UserInteractLogs
     *   }
     * })
     * 
     */
    create<T extends UserInteractLogsCreateArgs>(args: SelectSubset<T, UserInteractLogsCreateArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserInteractLogs.
     * @param {UserInteractLogsCreateManyArgs} args - Arguments to create many UserInteractLogs.
     * @example
     * // Create many UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserInteractLogsCreateManyArgs>(args?: SelectSubset<T, UserInteractLogsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Delete a UserInteractLogs.
     * @param {UserInteractLogsDeleteArgs} args - Arguments to delete one UserInteractLogs.
     * @example
     * // Delete one UserInteractLogs
     * const UserInteractLogs = await prisma.userInteractLogs.delete({
     *   where: {
     *     // ... filter to delete one UserInteractLogs
     *   }
     * })
     * 
     */
    delete<T extends UserInteractLogsDeleteArgs>(args: SelectSubset<T, UserInteractLogsDeleteArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserInteractLogs.
     * @param {UserInteractLogsUpdateArgs} args - Arguments to update one UserInteractLogs.
     * @example
     * // Update one UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserInteractLogsUpdateArgs>(args: SelectSubset<T, UserInteractLogsUpdateArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserInteractLogs.
     * @param {UserInteractLogsDeleteManyArgs} args - Arguments to filter UserInteractLogs to delete.
     * @example
     * // Delete a few UserInteractLogs
     * const { count } = await prisma.userInteractLogs.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserInteractLogsDeleteManyArgs>(args?: SelectSubset<T, UserInteractLogsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserInteractLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserInteractLogsUpdateManyArgs>(args: SelectSubset<T, UserInteractLogsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one UserInteractLogs.
     * @param {UserInteractLogsUpsertArgs} args - Arguments to update or create a UserInteractLogs.
     * @example
     * // Update or create a UserInteractLogs
     * const userInteractLogs = await prisma.userInteractLogs.upsert({
     *   create: {
     *     // ... data to create a UserInteractLogs
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserInteractLogs we want to update
     *   }
     * })
     */
    upsert<T extends UserInteractLogsUpsertArgs>(args: SelectSubset<T, UserInteractLogsUpsertArgs<ExtArgs>>): Prisma__UserInteractLogsClient<$Result.GetResult<Prisma.$UserInteractLogsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserInteractLogs that matches the filter.
     * @param {UserInteractLogsFindRawArgs} args - Select which filters you would like to apply.
     * @example
     * const userInteractLogs = await prisma.userInteractLogs.findRaw({
     *   filter: { age: { $gt: 25 } }
     * })
     */
    findRaw(args?: UserInteractLogsFindRawArgs): Prisma.PrismaPromise<JsonObject>

    /**
     * Perform aggregation operations on a UserInteractLogs.
     * @param {UserInteractLogsAggregateRawArgs} args - Select which aggregations you would like to apply.
     * @example
     * const userInteractLogs = await prisma.userInteractLogs.aggregateRaw({
     *   pipeline: [
     *     { $match: { status: "registered" } },
     *     { $group: { _id: "$country", total: { $sum: 1 } } }
     *   ]
     * })
     */
    aggregateRaw(args?: UserInteractLogsAggregateRawArgs): Prisma.PrismaPromise<JsonObject>


    /**
     * Count the number of UserInteractLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsCountArgs} args - Arguments to filter UserInteractLogs to count.
     * @example
     * // Count the number of UserInteractLogs
     * const count = await prisma.userInteractLogs.count({
     *   where: {
     *     // ... the filter for the UserInteractLogs we want to count
     *   }
     * })
    **/
    count<T extends UserInteractLogsCountArgs>(
      args?: Subset<T, UserInteractLogsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserInteractLogsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserInteractLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
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
    aggregate<T extends UserInteractLogsAggregateArgs>(args: Subset<T, UserInteractLogsAggregateArgs>): Prisma.PrismaPromise<GetUserInteractLogsAggregateType<T>>

    /**
     * Group by UserInteractLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserInteractLogsGroupByArgs} args - Group by arguments.
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
      T extends UserInteractLogsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserInteractLogsGroupByArgs['orderBy'] }
        : { orderBy?: UserInteractLogsGroupByArgs['orderBy'] },
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
    >(args: SubsetIntersection<T, UserInteractLogsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserInteractLogsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserInteractLogs model
   */
  readonly fields: UserInteractLogsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserInteractLogs.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserInteractLogsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
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
   * Fields of the UserInteractLogs model
   */
  interface UserInteractLogsFieldRefs {
    readonly id: FieldRef<"UserInteractLogs", 'String'>
    readonly userId: FieldRef<"UserInteractLogs", 'String'>
    readonly action: FieldRef<"UserInteractLogs", 'String'>
    readonly content: FieldRef<"UserInteractLogs", 'String'>
    readonly trustCredit: FieldRef<"UserInteractLogs", 'Int'>
    readonly timestamp: FieldRef<"UserInteractLogs", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * UserInteractLogs findUnique
   */
  export type UserInteractLogsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserInteractLogs to fetch.
     */
    where: UserInteractLogsWhereUniqueInput
  }

  /**
   * UserInteractLogs findUniqueOrThrow
   */
  export type UserInteractLogsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserInteractLogs to fetch.
     */
    where: UserInteractLogsWhereUniqueInput
  }

  /**
   * UserInteractLogs findFirst
   */
  export type UserInteractLogsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserInteractLogs to fetch.
     */
    where?: UserInteractLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInteractLogs to fetch.
     */
    orderBy?: UserInteractLogsOrderByWithRelationInput | UserInteractLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserInteractLogs.
     */
    cursor?: UserInteractLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInteractLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInteractLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserInteractLogs.
     */
    distinct?: UserInteractLogsScalarFieldEnum | UserInteractLogsScalarFieldEnum[]
  }

  /**
   * UserInteractLogs findFirstOrThrow
   */
  export type UserInteractLogsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserInteractLogs to fetch.
     */
    where?: UserInteractLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInteractLogs to fetch.
     */
    orderBy?: UserInteractLogsOrderByWithRelationInput | UserInteractLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserInteractLogs.
     */
    cursor?: UserInteractLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInteractLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInteractLogs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserInteractLogs.
     */
    distinct?: UserInteractLogsScalarFieldEnum | UserInteractLogsScalarFieldEnum[]
  }

  /**
   * UserInteractLogs findMany
   */
  export type UserInteractLogsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter, which UserInteractLogs to fetch.
     */
    where?: UserInteractLogsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserInteractLogs to fetch.
     */
    orderBy?: UserInteractLogsOrderByWithRelationInput | UserInteractLogsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserInteractLogs.
     */
    cursor?: UserInteractLogsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserInteractLogs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserInteractLogs.
     */
    skip?: number
    distinct?: UserInteractLogsScalarFieldEnum | UserInteractLogsScalarFieldEnum[]
  }

  /**
   * UserInteractLogs create
   */
  export type UserInteractLogsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * The data needed to create a UserInteractLogs.
     */
    data: XOR<UserInteractLogsCreateInput, UserInteractLogsUncheckedCreateInput>
  }

  /**
   * UserInteractLogs createMany
   */
  export type UserInteractLogsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserInteractLogs.
     */
    data: UserInteractLogsCreateManyInput | UserInteractLogsCreateManyInput[]
  }

  /**
   * UserInteractLogs update
   */
  export type UserInteractLogsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * The data needed to update a UserInteractLogs.
     */
    data: XOR<UserInteractLogsUpdateInput, UserInteractLogsUncheckedUpdateInput>
    /**
     * Choose, which UserInteractLogs to update.
     */
    where: UserInteractLogsWhereUniqueInput
  }

  /**
   * UserInteractLogs updateMany
   */
  export type UserInteractLogsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserInteractLogs.
     */
    data: XOR<UserInteractLogsUpdateManyMutationInput, UserInteractLogsUncheckedUpdateManyInput>
    /**
     * Filter which UserInteractLogs to update
     */
    where?: UserInteractLogsWhereInput
    /**
     * Limit how many UserInteractLogs to update.
     */
    limit?: number
  }

  /**
   * UserInteractLogs upsert
   */
  export type UserInteractLogsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * The filter to search for the UserInteractLogs to update in case it exists.
     */
    where: UserInteractLogsWhereUniqueInput
    /**
     * In case the UserInteractLogs found by the `where` argument doesn't exist, create a new UserInteractLogs with this data.
     */
    create: XOR<UserInteractLogsCreateInput, UserInteractLogsUncheckedCreateInput>
    /**
     * In case the UserInteractLogs was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserInteractLogsUpdateInput, UserInteractLogsUncheckedUpdateInput>
  }

  /**
   * UserInteractLogs delete
   */
  export type UserInteractLogsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
    /**
     * Filter which UserInteractLogs to delete.
     */
    where: UserInteractLogsWhereUniqueInput
  }

  /**
   * UserInteractLogs deleteMany
   */
  export type UserInteractLogsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserInteractLogs to delete
     */
    where?: UserInteractLogsWhereInput
    /**
     * Limit how many UserInteractLogs to delete.
     */
    limit?: number
  }

  /**
   * UserInteractLogs findRaw
   */
  export type UserInteractLogsFindRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The query predicate filter. If unspecified, then all documents in the collection will match the predicate. ${@link https://docs.mongodb.com/manual/reference/operator/query MongoDB Docs}.
     */
    filter?: InputJsonValue
    /**
     * Additional options to pass to the `find` command ${@link https://docs.mongodb.com/manual/reference/command/find/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserInteractLogs aggregateRaw
   */
  export type UserInteractLogsAggregateRawArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * An array of aggregation stages to process and transform the document stream via the aggregation pipeline. ${@link https://docs.mongodb.com/manual/reference/operator/aggregation-pipeline MongoDB Docs}.
     */
    pipeline?: InputJsonValue[]
    /**
     * Additional options to pass to the `aggregate` command ${@link https://docs.mongodb.com/manual/reference/command/aggregate/#command-fields MongoDB Docs}.
     */
    options?: InputJsonValue
  }

  /**
   * UserInteractLogs without action
   */
  export type UserInteractLogsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserInteractLogs
     */
    select?: UserInteractLogsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserInteractLogs
     */
    omit?: UserInteractLogsOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const UserConferenceLogsScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    action: 'action',
    conferenceId: 'conferenceId',
    trustCredit: 'trustCredit',
    timestamp: 'timestamp'
  };

  export type UserConferenceLogsScalarFieldEnum = (typeof UserConferenceLogsScalarFieldEnum)[keyof typeof UserConferenceLogsScalarFieldEnum]


  export const UserInteractLogsScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    action: 'action',
    content: 'content',
    trustCredit: 'trustCredit',
    timestamp: 'timestamp'
  };

  export type UserInteractLogsScalarFieldEnum = (typeof UserInteractLogsScalarFieldEnum)[keyof typeof UserInteractLogsScalarFieldEnum]


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
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


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


  export type UserConferenceLogsWhereInput = {
    AND?: UserConferenceLogsWhereInput | UserConferenceLogsWhereInput[]
    OR?: UserConferenceLogsWhereInput[]
    NOT?: UserConferenceLogsWhereInput | UserConferenceLogsWhereInput[]
    id?: StringFilter<"UserConferenceLogs"> | string
    userId?: StringFilter<"UserConferenceLogs"> | string
    action?: StringFilter<"UserConferenceLogs"> | string
    conferenceId?: StringFilter<"UserConferenceLogs"> | string
    trustCredit?: IntFilter<"UserConferenceLogs"> | number
    timestamp?: DateTimeFilter<"UserConferenceLogs"> | Date | string
  }

  export type UserConferenceLogsOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    conferenceId?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserConferenceLogsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserConferenceLogsWhereInput | UserConferenceLogsWhereInput[]
    OR?: UserConferenceLogsWhereInput[]
    NOT?: UserConferenceLogsWhereInput | UserConferenceLogsWhereInput[]
    userId?: StringFilter<"UserConferenceLogs"> | string
    action?: StringFilter<"UserConferenceLogs"> | string
    conferenceId?: StringFilter<"UserConferenceLogs"> | string
    trustCredit?: IntFilter<"UserConferenceLogs"> | number
    timestamp?: DateTimeFilter<"UserConferenceLogs"> | Date | string
  }, "id">

  export type UserConferenceLogsOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    conferenceId?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
    _count?: UserConferenceLogsCountOrderByAggregateInput
    _avg?: UserConferenceLogsAvgOrderByAggregateInput
    _max?: UserConferenceLogsMaxOrderByAggregateInput
    _min?: UserConferenceLogsMinOrderByAggregateInput
    _sum?: UserConferenceLogsSumOrderByAggregateInput
  }

  export type UserConferenceLogsScalarWhereWithAggregatesInput = {
    AND?: UserConferenceLogsScalarWhereWithAggregatesInput | UserConferenceLogsScalarWhereWithAggregatesInput[]
    OR?: UserConferenceLogsScalarWhereWithAggregatesInput[]
    NOT?: UserConferenceLogsScalarWhereWithAggregatesInput | UserConferenceLogsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserConferenceLogs"> | string
    userId?: StringWithAggregatesFilter<"UserConferenceLogs"> | string
    action?: StringWithAggregatesFilter<"UserConferenceLogs"> | string
    conferenceId?: StringWithAggregatesFilter<"UserConferenceLogs"> | string
    trustCredit?: IntWithAggregatesFilter<"UserConferenceLogs"> | number
    timestamp?: DateTimeWithAggregatesFilter<"UserConferenceLogs"> | Date | string
  }

  export type UserInteractLogsWhereInput = {
    AND?: UserInteractLogsWhereInput | UserInteractLogsWhereInput[]
    OR?: UserInteractLogsWhereInput[]
    NOT?: UserInteractLogsWhereInput | UserInteractLogsWhereInput[]
    id?: StringFilter<"UserInteractLogs"> | string
    userId?: StringFilter<"UserInteractLogs"> | string
    action?: StringFilter<"UserInteractLogs"> | string
    content?: StringFilter<"UserInteractLogs"> | string
    trustCredit?: IntFilter<"UserInteractLogs"> | number
    timestamp?: DateTimeFilter<"UserInteractLogs"> | Date | string
  }

  export type UserInteractLogsOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    content?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserInteractLogsWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: UserInteractLogsWhereInput | UserInteractLogsWhereInput[]
    OR?: UserInteractLogsWhereInput[]
    NOT?: UserInteractLogsWhereInput | UserInteractLogsWhereInput[]
    userId?: StringFilter<"UserInteractLogs"> | string
    action?: StringFilter<"UserInteractLogs"> | string
    content?: StringFilter<"UserInteractLogs"> | string
    trustCredit?: IntFilter<"UserInteractLogs"> | number
    timestamp?: DateTimeFilter<"UserInteractLogs"> | Date | string
  }, "id">

  export type UserInteractLogsOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    content?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
    _count?: UserInteractLogsCountOrderByAggregateInput
    _avg?: UserInteractLogsAvgOrderByAggregateInput
    _max?: UserInteractLogsMaxOrderByAggregateInput
    _min?: UserInteractLogsMinOrderByAggregateInput
    _sum?: UserInteractLogsSumOrderByAggregateInput
  }

  export type UserInteractLogsScalarWhereWithAggregatesInput = {
    AND?: UserInteractLogsScalarWhereWithAggregatesInput | UserInteractLogsScalarWhereWithAggregatesInput[]
    OR?: UserInteractLogsScalarWhereWithAggregatesInput[]
    NOT?: UserInteractLogsScalarWhereWithAggregatesInput | UserInteractLogsScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserInteractLogs"> | string
    userId?: StringWithAggregatesFilter<"UserInteractLogs"> | string
    action?: StringWithAggregatesFilter<"UserInteractLogs"> | string
    content?: StringWithAggregatesFilter<"UserInteractLogs"> | string
    trustCredit?: IntWithAggregatesFilter<"UserInteractLogs"> | number
    timestamp?: DateTimeWithAggregatesFilter<"UserInteractLogs"> | Date | string
  }

  export type UserConferenceLogsCreateInput = {
    id?: string
    userId: string
    action: string
    conferenceId: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserConferenceLogsUncheckedCreateInput = {
    id?: string
    userId: string
    action: string
    conferenceId: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserConferenceLogsUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    conferenceId?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserConferenceLogsUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    conferenceId?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserConferenceLogsCreateManyInput = {
    id?: string
    userId: string
    action: string
    conferenceId: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserConferenceLogsUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    conferenceId?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserConferenceLogsUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    conferenceId?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserInteractLogsCreateInput = {
    id?: string
    userId: string
    action: string
    content: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserInteractLogsUncheckedCreateInput = {
    id?: string
    userId: string
    action: string
    content: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserInteractLogsUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserInteractLogsUncheckedUpdateInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserInteractLogsCreateManyInput = {
    id?: string
    userId: string
    action: string
    content: string
    trustCredit: number
    timestamp?: Date | string
  }

  export type UserInteractLogsUpdateManyMutationInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserInteractLogsUncheckedUpdateManyInput = {
    userId?: StringFieldUpdateOperationsInput | string
    action?: StringFieldUpdateOperationsInput | string
    content?: StringFieldUpdateOperationsInput | string
    trustCredit?: IntFieldUpdateOperationsInput | number
    timestamp?: DateTimeFieldUpdateOperationsInput | Date | string
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

  export type UserConferenceLogsCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    conferenceId?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserConferenceLogsAvgOrderByAggregateInput = {
    trustCredit?: SortOrder
  }

  export type UserConferenceLogsMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    conferenceId?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserConferenceLogsMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    conferenceId?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserConferenceLogsSumOrderByAggregateInput = {
    trustCredit?: SortOrder
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

  export type UserInteractLogsCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    content?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserInteractLogsAvgOrderByAggregateInput = {
    trustCredit?: SortOrder
  }

  export type UserInteractLogsMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    content?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserInteractLogsMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    action?: SortOrder
    content?: SortOrder
    trustCredit?: SortOrder
    timestamp?: SortOrder
  }

  export type UserInteractLogsSumOrderByAggregateInput = {
    trustCredit?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
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