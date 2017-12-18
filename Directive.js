// regex to split multiple directive expressions
// split by commas, but ignore commas within quotes, parens and escapes.
var SPLIT_RE = /(?:['"](?:\\.|[^'"])*['"]|\((?:\\.|[^\)])*\)|\\.|[^,])+/g;


function Directive (definition, expression, rawKey, compiler, node) {

}

    /**
 *  split a unquoted-comma separated expression into
 *  multiple clauses
 */
Directive.split = function (exp) {
  return exp.indexOf(',') > -1
      ? exp.match(SPLIT_RE) || ['']
      : [exp]
}
/**
 * 确保创建实例前指令和表达式是有效的
 */
Directive.parse = function (dirname,expression,compiler,node){
  
}