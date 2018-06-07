import { CacheMap } from "../src"
import * as _ from 'lodash'


const assert = (test: boolean) => console.assert(test)


!(function withoutPersistentItem() {
    const dropLog: number[] = []
    const cm = new CacheMap<string, number>(3, v => dropLog.push(v))

    cm.set('one', 1)
    cm.set('two', 2)
    cm.set('three', 3)

    assert(cm.get('one') == 1)
    assert(cm.get('two') == 2)
    assert(cm.get('three') == 3)

    cm.set('four', 4)
    assert(cm.get('four') == 4)
    assert(cm.get('one') == undefined)

    assert(cm.get('two') == 2)
    cm.set('five', 5)
    assert(cm.peek('two') == 2)
    assert(cm.peek('three') == undefined)

    assert(cm.size == 3)
    assert(_.isEqual(dropLog, [1, 3]))

    cm.clear()
    assert(cm.size == 0)
    assert(_.isEqual(dropLog, [1, 3, 4, 2, 5]))

    cm.set('one', 1)
    cm.set('two', 2)

    assert(_.isEqual(cm.keys().sort(), ['one', 'two'].sort()))
    
    cm.delete('one')
    assert(cm.get('one') == undefined)
    assert(cm.size == 1)
    assert(_.isEqual(cm.keys(), ['two']))
})()


!(function test2() {
    const dropLog: number[] = []
    const cm = new CacheMap<string, number>(3, v => dropLog.push(v))

    cm.set('one', 1, true)
    cm.set('two', 2)
    cm.set('three', 3, true)
    cm.set('four', 4)
    cm.set('five', 5)
    cm.set('six', 6)
    cm.set('seven', 7)
    assert(cm.peek('one') == 1)
    assert(cm.peek('two') == undefined)
    assert(cm.peek('three') == 3)
    assert(cm.peek('four') == undefined)
    assert(cm.size == 5)
    assert(_.isEqual(dropLog, [2, 4]))
})()