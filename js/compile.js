/*
    el:option id属性
    vm: selfvue对象
 */
function Compile(el, vm) {
    this.vm = vm;
    this.el = document.querySelector(el);
    this.fragment = null;
    this.init();
}

Compile.prototype = {
    init: function() {
        if (this.el) {
            this.fragment = this.nodeToFragment(this.el);
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
        } else {
            console.log('Dom元素不存在');
        }
    },
    nodeToFragment: function(el) { //dom节点移动到fragment(该方法在vue,react源码中同样使用)
        var fragment = document.createDocumentFragment();
        var child;
        while (child = el.firstChild) {
            fragment.appendChild(child); //将Dom元素移入fragment中
            child = el.firstChild
        }
        return fragment;
    },
    compileElement: function(el) {
        var childNodes = el.childNodes;
        var self = this;
        [].slice.call(childNodes).forEach(function(node) {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;

            if (self.isElementNode(node)) {
                self.compile(node);
            } else if (self.isTextNode(node) && reg.test(text)) { // 判断是否是符合这种形式{{}}的指令
                self.compileText(node, reg.exec(text)[1]);
            }

            if (node.childNodes && node.childNodes.length) {
                self.compileElement(node); //继续递归遍历子节点
            }
        });
    },
    compile: function(node) { //解析元素节点
        var nodeAttrs = node.attributes;
        var self = this;
        Array.prototype.forEach.call(nodeAttrs, function(attr) {
            var attrName = attr.name;
            if (self.isDirective(attrName)) {
                var exp = attr.value;
                var dir = attrName.substring(2);
                if (self.isEventDirective(dir)) { // 事件指令
                    self.compileEvent(node, self.vm, exp, dir);
                } else { // v-model 指令
                    self.compileModel(node, self.vm, exp, dir);
                }
                node.removeAttribute(attrName);
            }
        });
    },
    compileText: function(node, exp) { //解析文本节点
        var self = this;
        var initText = this.vm[exp];
        this.updateText(node, initText); // 将初始化的数据初始化到视图中
        new Watcher(this.vm, exp, function(value) {
            self.updateText(node, value); // 生成订阅器并绑定更新函数
        });
    },
    compileEvent: function(node, vm, exp, dir) { //获取事件名称，绑定事件
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[exp];

        if (eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false);
        }
    },
    compileModel: function(node, vm, exp, dir) { //获取input名称，绑定input
        var self = this;
        var val = this.vm[exp];
        this.modelUpdater(node, val);
        new Watcher(this.vm, exp, function(value) {
            self.modelUpdater(node, value);
        });

        node.addEventListener('input', function(e) {
            var newValue = e.target.value;
            if (val === newValue) {
                return;
            }
            self.vm[exp] = newValue;
            val = newValue;
        });
    },
    updateText: function(node, value) { //更新文本内容
        node.textContent = typeof value == 'undefined' ? '' : value;
    },
    modelUpdater: function(node, value, oldValue) { //更新model绑定内容
        node.value = typeof value == 'undefined' ? '' : value;
    },
    isDirective: function(attr) { //查询'v-'绑定指令
        return attr.indexOf('v-') == 0;
    },
    isEventDirective: function(dir) { //查询'on:'事件指令
        return dir.indexOf('on:') === 0;
    },
    isElementNode: function(node) { //判断是否为元素节点
        return node.nodeType == 1;
    },
    isTextNode: function(node) { //判断是否为文本节点
        return node.nodeType == 3;
    }
}