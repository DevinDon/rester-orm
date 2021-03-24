import { Column, Entity, getEntity, MongoEntity, ResterORM } from '../main';

interface ABC {
  test: string;
  time: Date;
}

@Entity({ name: 'abc' })
class ABCEntity extends MongoEntity<ABC> implements ABC {

  @Column({ index: true, unique: true })
  test: string;

  @Column({ index: true })
  time: Date;

  findOneWhichTestIsAlice() {
    return this.collection.findOne({ test: 'Alice' });
  }

}


(async () => {
  const orm = new ResterORM([
    {
      host: 'localhost',
      username: 'username',
      password: 'password',
      database: 'database',
      entities: [ABCEntity],
    },
  ]);
  const databases = await orm.bootstrap();
  const entity: ABCEntity = getEntity(ABCEntity);
  const collection = entity.collection;
  const result = await collection.insertOne({ test: 'Alice', time: new Date() });
  const found = await collection.findOne({ test: 'Alice' });
  const customFound = await entity.findOneWhichTestIsAlice();
})();
