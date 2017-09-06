function Vue(options) {
    var self = this;
    this.data = options.data; //添加data属性
    this.methods = options.methods; //添加methods属性

    Object.keys(this.data).forEach(function(key) {
        self.proxyKeys(key);
    });

    observe(this.data); //数据监听器,劫持数据状态
    options.created.call(this); // 编译前执行created函数
    new Compile(options.el, this); //解析器,解析模板指令，并替换模板数据，初始化视图
    options.mounted.call(this); // 编译后执行mounted函数
}

//代理,将vue对象的get set指向vue.data中  即   vue.xxx  <===>  vue.data.xxx
Vue.prototype = {
    proxyKeys: function(key) {
        var self = this;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function getter() {
                return self.data[key];
            },
            set: function setter(newVal) {
                self.data[key] = newVal;
            }
        });
    }
}