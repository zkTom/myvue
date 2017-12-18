// 每一个属性都绑定在vue实例上，并且有一个对应的binding 对象
function Binding(compiler,key,isExp) {
  this.value = undefined;
  this.isExp = !!isExp; //双重否定，避免隐式转化，造成误解
  this.compiler = compiler;
  this.key = key;
  this.instances = []
  this.subs = []
  this.deps = []
}

var BindingProto = Binding.prototype

/**
 *  Process the value, then trigger updates on all dependents
 */
BindingProto.update = function (value) {
    this.value = value
    var i = this.instances.length
    while (i--) {
        this.instances[i].update(value)
    }
    this.pub()
}

/**
 *  仅仅用于计算属性 
 *  让所有的实例来重新计算本身的值
 */
BindingProto.refresh = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].refresh()
    }
    this.pub()
}

/**
 * 让所有依赖于binding对象的值进行更新
 */
BindingProto.pub = function () {
    var i = this.subs.length
    while (i--) {
        this.subs[i].refresh()
    }
}

/**
 *  Unbind the binding, remove itself from all of its dependencies
 */
BindingProto.unbind = function () {
    var i = this.instances.length
    while (i--) {
        this.instances[i].unbind()
    }
    i = this.deps.length
    var subs
    while (i--) {
        subs = this.deps[i].subs
        subs.splice(subs.indexOf(this), 1)
    }
}

module.exports = Binding