type V2 = [ number, number ]

interface ILeaf<T> { leaf: true, position: V2 }
interface IRegion<T> { leaf: false, children: QT<T>[] }
type QT<T> = ILeaf<T> | IRegion<T>

function insert ( qt: QT<T>, 
