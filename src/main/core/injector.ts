import { BaseEntity } from './base.entity';

export class EntityInjector {

  private static storage: Map<typeof BaseEntity, any> = new Map();

  public static inject(target: typeof BaseEntity) {
    if (!EntityInjector.storage.has(target)) {
      EntityInjector.storage.set(target, new target());
    }
    return EntityInjector.storage.get(target)!;
  }

}

export const getEntity = <TEntity extends typeof BaseEntity>(target: TEntity) =>
  EntityInjector.inject(target);
