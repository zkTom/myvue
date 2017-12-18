var BINDING_RE = /\{\{(.+?)\}\}/

module.exports = {

    /**
     *  Parse a piece of text, return an array of tokens
     */
    // 编译文本节点的时候，[我们{{hello}}好] => ['我们',{{hello}},'好'];
    // 也就是说会保留多余的未编译文本 
    parse: function (text) {
        if (!BINDING_RE.test(text)) return null
        var m, i, tokens = []

        while (m = text.match(BINDING_RE)) {
            i = m.index
			
            if (i > 0) tokens.push(text.slice(0, i))
            tokens.push({ key: m[1].trim() })
            text = text.slice(i + m[0].length)
        }
        if (text.length) tokens.push(text)
        return tokens
    }
    
}