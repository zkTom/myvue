var util = {
	// 仅仅是浅拷贝
	// obj Object 要追加的对象
	// ext  Object 预备的扩展的对象
	// protective Boolean 保护原有属性不被覆盖
	extend: function (obj, ext, protective){
		for (var key in ext) {
			if (protective && obj[key]) continue;
			obj[key] = ext[key];
		}
	},
	defProtected: function (obj, key, val, enumerable, configurable){
		//该方法会忽略掉那些从原型链上继承到的属性。
		if (obj.hasOwnProperty(key)) return;
		Object.defineProperty(obj, key, {
            value        : val,
            enumerable   : !!enumerable,
            configurable : !!configurable
        })
	},
	// el DOM Object  Dom节点
	// type String    属性名字
	// isRemove  Boolean 是否移除该属性
	attr: function (el,type,isRemove){
		//TODO
	}
}
export default util;