import { Collection } from "discord.js";
import * as Database from "./classes/database";

class __CacheSystem {
    databaseUsers: Collection<string, Database.User>;
    roomStats: Collection<
        string,
        {
            room: string;
            sections: {
                section: string;
                occupied: boolean;
                occupier: string;
            }[];
        }[]
    >;

    constructor() {
        this.databaseUsers = new Collection<string, Database.User>();
        this.roomStats = new Collection<
            string,
            {
                room: string;
                sections: {
                    section: string;
                    occupied: boolean;
                    occupier: string;
                }[];
            }[]
        >();
    }
}

let __CacheSys = new __CacheSystem();

export class Cache {
    constructor() {}

    static get collections() {
        return {
            databaseUsers: this.getCollection<Database.User>(0),
            roomStats: this.getCollection<
                {
                    room: string;
                    sections: {
                        section: string;
                        occupied: boolean;
                        occupier: string;
                    }[];
                }[]
            >(1),
        };
    }

    private static getCollection<
        T extends
            | Database.User
            | {
                  room: string;
                  sections: {
                      section: string;
                      occupied: boolean;
                      occupier: string;
                  }[];
              }[]
    >(collection: number) {
        return new JaneCacheCollection<T>(collection);
    }
}

class JaneCacheCollection<
    T extends
        | Database.User
        | {
              room: string;
              sections: {
                  section: string;
                  occupied: boolean;
                  occupier: string;
              }[];
          }[]
> {
    collectionName: string;

    constructor(collection: number) {
        this.collectionName = "";
        if (collection === 0) this.collectionName = "databaseUsers";
        if (collection === 1) this.collectionName = "roomStats";
    }

    set(k: string, v: T) {
        if (!(this.collectionName in __CacheSys)) throw new Error();
        __CacheSys[this.collectionName as keyof typeof __CacheSys].set(
            k,
            v as any
        );
    }

    get(k: string): T {
        if (!(this.collectionName in __CacheSys)) throw new Error();
        return __CacheSys[this.collectionName as keyof typeof __CacheSys].get(
            k
        ) as T;
    }

    has(k: string) {
        return __CacheSys[this.collectionName as keyof typeof __CacheSys].has(
            k
        );
    }
}
