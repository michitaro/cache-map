export interface Pack<K, V> {
    k: K
    v: V
    num: number
    persist: boolean
}


export class CacheMap<K, V> {
    constructor(
        private limit: number,
        private onDrop?: (v: V, k: K) => void
    ) { }

    private seq = 0
    private count = 0
    private persistCount = 0
    private oldestNum = 0
    private byKey = new Map<K, Pack<K, V>>()
    private byNum = new Map<number, Pack<K, V>>()

    set(k: K, v: V, persist = false) {
        const originlPack = this.byKey.get(k)
        if (originlPack) {
            if (this.onDrop && originlPack.v == v) {
                console.info(`CacheMap[${k}] is assigned twice to same value. This may cause unexpected onDrop callback.`)
            }
            this.deleteByPack(originlPack)
        }
        const newPack = { k, v, num: this.seq++, persist }
        this.byKey.set(k, newPack)
        this.byNum.set(newPack.num, newPack)
        this.count++
        persist && this.persistCount++
        this.deleteOldItems()
    }

    peek(k: K) {
        const p = this.byKey.get(k)
        return p ? p.v : undefined
    }

    get(k: K) {
        const pack = this.byKey.get(k)
        if (pack) {
            this.byNum.get(pack.num)
            this.byNum.delete(pack.num)
            this.byNum.set(pack.num = this.seq++, pack)
            return pack.v
        }
    }

    clear() {
        const packs: Pack<K, V>[] = []
        this.byNum.forEach(pack => packs.push(pack))
        for (const pack of packs) {
            this.deleteByPack(pack)
        }
    }

    delete(k: K) {
        const pack = this.byKey.get(k)
        if (pack) {
            this.deleteByPack(pack)
            return true
        }
        return false
    }

    setLimit(limit: number) {
        this.limit = limit
        this.deleteOldItems()
    }

    private deleteOldItems() {
        const totalLimit = this.limit + this.persistCount
        while (this.count > totalLimit) {
            const pack = this.byNum.get(this.oldestNum++)
            pack && !pack.persist && this.deleteByPack(pack)
        }
    }

    private deleteByPack(pack: Pack<K, V>) {
        this.byKey.delete(pack.k)
        this.byNum.delete(pack.num)
        this.onDrop && this.onDrop(pack.v, pack.k)
        this.count--
        pack.persist && this.persistCount--
    }

    get size() {
        return this.byNum.size
    }
}