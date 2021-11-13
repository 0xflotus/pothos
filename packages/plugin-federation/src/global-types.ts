import { GraphQLSchema } from 'graphql';
import {
  FieldNullability,
  InputFieldMap,
  InterfaceParam,
  ObjectParam,
  OutputShape,
  ParentShape,
  Resolver,
  SchemaTypes,
  ShapeFromTypeParam,
  TypeParam,
} from '@giraphql/core';
import { EntityObjectOptions } from './types';
import {
  ExternalEntityOptions,
  GiraphQLFederationPlugin,
  Selection,
  SelectionFromShape,
  selectionShapeKey,
} from '.';

declare global {
  export namespace GiraphQLSchemaTypes {
    export interface Plugins<Types extends SchemaTypes> {
      federation: GiraphQLFederationPlugin<Types>;
    }

    export interface GiraphQLKindToGraphQLType {
      ExtendedEntity: 'Object';
      ExternalEntity: 'Object';
      EntityObject: 'Object';
    }

    export interface FieldOptionsByKind<
      Types extends SchemaTypes,
      ParentShape,
      Type extends TypeParam<Types>,
      Nullable extends FieldNullability<Type>,
      Args extends InputFieldMap,
      ResolveShape,
      ResolveReturnShape,
    > {
      ExtendedEntity: ObjectFieldOptions<
        Types,
        ParentShape & ResolveShape,
        Type,
        Nullable,
        Args,
        ResolveReturnShape
      > & {
        requires?: Selection<ResolveShape & object>;
      };
      ExternalEntity: Omit<
        ObjectFieldOptions<Types, ParentShape, Type, Nullable, Args, ResolveReturnShape>,
        'resolve'
      >;
      EntityObject: Omit<
        ObjectFieldOptions<Types, ParentShape, Type, Nullable, Args, ResolveReturnShape>,
        'resolve'
      > & {
        provides?: Selection<ResolveShape & object>;
        resolve: Resolver<
          ParentShape,
          Args,
          Types['Context'],
          Type extends [unknown]
            ? ((ShapeFromTypeParam<Types, Type, false> & unknown[])[number] & ResolveShape)[]
            : ResolveShape & ShapeFromTypeParam<Types, Type, false>,
          ResolveReturnShape
        >;
      };
    }

    export interface SchemaBuilder<Types extends SchemaTypes> {
      entity: <
        Interfaces extends InterfaceParam<Types>[],
        Param extends ObjectParam<Types>,
        KeySelection extends Selection<object>,
      >(
        param: Param,
        options: EntityObjectOptions<Types, Param, Interfaces, KeySelection>,
      ) => ObjectRef<OutputShape<Types, Param>, ParentShape<Types, Param>>;

      externalEntity: <
        Name extends string,
        KeySelection extends Selection<object>,
        Shape extends object = KeySelection[typeof selectionShapeKey],
      >(
        name: Name,
        options: ExternalEntityOptions<Types, KeySelection, Shape>,
      ) => ObjectRef<
        KeySelection[typeof selectionShapeKey] & { __typename: Name },
        Shape & { __typename: Name }
      >;

      selection: <Shape extends object>(selection: SelectionFromShape<Shape>) => Selection<Shape>;

      toSubGraphSchema: (options: BuildSchemaOptions<Types>) => GraphQLSchema;
    }
  }
}
