/**
*将给定的options编译到给定的对象上。
*
*/
var CompilerProto = Compiler.prototype；

function Compiler(vm, options) {
	var compiler = this;
	// 使得创建的对象更加简洁，不附带多余的属性。
	options = options || Object.create(null);
	// init DOM节点
	var el = compiler.setupEle(options);
	
}
// 首先把DOM节点绑定到vm对象上
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