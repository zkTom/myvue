/**
*将给定的options编译到给定的对象上。
*
*/
var util = require("./util");
var CompilerProto = Compiler.prototype；

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
        : makeHash()
    compiler.rootCompiler = parent
        ? getRoot(parent)
        : compiler
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