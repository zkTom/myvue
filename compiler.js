/**
*将给定的options编译到给定的对象上。
*
*/
var util = require("./util"),
	DepsParser = require('./deps-parser'),
	Emitter = require('./emitter'),
	makeHash = util.makeHash,
	Binding = require('./binding'),
	TextParser = require('./text-parser'),
	// cache deps ob 
	depsOb = DepsParser.observer;
var CompilerProto = Compiler.prototype;

// vm is reffering to the vue instance
function Compiler(vm, options) {
	var compiler = this;
	// 使得创建的对象更加简洁，不附带多余的属性。
	options = options || Object.create(null);
	// init DOM节点
	var el = compiler.setupEle(options);
	// copy scope prop to vm
	var scope = options.scope;
	if (scope) util.extend(vm, scope, true);
	
	compiler.vm = vm;
	def(vm, '$',Object.create(null));
    def(vm, '$el', el)
    def(vm, '$compiler', compiler)
	
	compiler.exps = []
	compiler.childCompilers = [] // keep track of child compilers
	var observables = compiler.observables = [];
	
	// prototypal inheritance of bindings
    var parent = compiler.parentCompiler
    compiler.bindings = parent
        ? Object.create(parent.bindings)
        : Object.create(null)
    compiler.rootCompiler = parent
        ? getRoot(parent)
		: compiler
	
    // set parent VM
	// and register child id on parent
	
	// setup observer
	compiler.setupObserver()
	for (var key in vm) {
		compiler.createBinding(key);
	}
    // for repeated items, create an index binding
	// which should be inenumerable but configurable
	//TODO

	//Compile a DOM node (recursive)
	CompilerProto.compile = function (node, root) {
		var compiler = this;
		// 区分属性节点和文本节点
		if (node.nodeType === 1) {
			// finally, only normal directives left!
			// compiler.compileNode(node)
		} else if (node.nodeType === 3) {
			compiler.compileTextNode(node)
		}
	}
}
/**
 * Compile a normal node
 * TODO
 */
CompilerProto.compileNode = function (node) {
    var i, j, attrs = node.attributes
    // parse if has attributes
    if (attrs && attrs.length) {
        var attr, valid, exps, exp
        // loop through all attributes
        i = attrs.length
        while (i--) {
            attr = attrs[i]
            valid = false
            exps = [attr.value];
            // loop through clauses (separated by ",")
            // inside each attribute
            j = exps.length
            while (j--) {
                exp = exps[j]
                var directive = Directive.parse(attr.name, exp, this, node)
                if (directive) {
                    valid = true
                    this.bindDirective(directive)
                }
            }
            if (valid) node.removeAttribute(attr.name)
        }
    }
    // recursively compile childNodes
    if (node.childNodes.length) {
        var nodes = slice.call(node.childNodes)
        for (i = 0, j = nodes.length; i < j; i++) {
            this.compile(nodes[i])
        }
    }
}
/**
 *  Compile a text node
 */
CompilerProto.compileTextNode = function (node) {
    var tokens = TextParser.parse(node.nodeValue)
	if (!tokens) return
	var dirname = '',
	el, token, directive;

	for(var i = 0,l = tokens.length; i < l; i++) {
		token = tokens[i]
		if (token.key) {
			// todo
		}
	}
}
// 首先把DOM节点绑定到vm对象上
// @Return el {DOM Object} 实际的Dom节点
CompilerProto.setupEle = function (options) {
	//find the dom firstly by options.el
	var el = this.el = document.querySelector(options.el)
	var template = options.template;	
	if (template) { // 把template模板添加到el(DOM节点里)
		el.innerHTML = "";
		el.appendChild(template.cloneNode(true));
	}
	// apply element options
    if (options.id) el.id = options.id
    if (options.className) el.className = options.className
    var attrs = options.attributes
    if (attrs) {
        for (var attr in attrs) {
            el.setAttribute(attr, attrs[attr])
        }
    }

    return el
}
// 装配observer。
// 该observer会监听到get/set/mutate 事件在所有的values/objects 
CompilerProto.setupObserver = function (){
	var compiler = this,
	bindings = compiler.bindings,
	observer = compiler.observer = new Emitter()

	// a hash to hold event proxies for each root level key
	// so they can be referenced and removed later
	observer.proxies = makeHash()

    // add own listeners which trigger binding updates
    observer
	.on('get', function (key) {
		check(key)
		depsOb.emit('get', bindings[key])
	})
	.on('set', function (key, val) {
		observer.emit('change:' + key, val)
		check(key)
		bindings[key].update(val)
	})
	.on('mutate', function (key, val, mutation) {
		observer.emit('change:' + key, val, mutation)
		check(key)
		bindings[key].pub()
	})

	function check (key) {
		if (!bindings[key]) {
			compiler.createBinding(key)
		}
	}
}
// 为一个key绑定getter/setter 在一个vue实例上（vm）
CompilerProto.createBinding = function (key,isExp) {
	var compiler = this,
	bindings = compiler.bindings,
	binding = new Binding(compiler,key,isExp);

	bindings[key] = binding
	if (binding.root) {
		// this is a root level binding. we need to define getter/setters for it.
		compiler.define(key, binding)
	} else {
		var parentKey = key.slice(0, key.lastIndexOf('.'))
		if (!hasOwn.call(bindings, parentKey)) {
			// this is a nested value binding, but the binding for its parent
			// has not been created yet. We better create that one too.
			compiler.createBinding(parentKey)
		}
	}
	return binding;
}
// 为什么单独对根节点的绑定定义一下
CompilerProto.define = function (key, binding) {
	var compiler = this,
		vm = compiler.vm,
		ob = compiler.observer,
		value = binding.value = vm[key];
	
	Object.defineProperty(vm,key, {
		enumerable: true,
		get: function(){
			var value = binding.value;
			ob.emit('get',key);
			return value;
		},
		set: function(newVal){
			var value = binding.value;
			binding.value = newVal;
			ob.emit('set', key, newVal);
		}
	});
}
// 对于根编译器的快照
function getRoot (compiler) {
    return compiler;
}