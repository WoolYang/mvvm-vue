function Observer(data) {
    this.data = data;
    this.walk(data);
}

Observer.prototype = {
    walk: function(data) {
        var self = this;
        Object.keys(data).forEach(function(key) {
            self.defineReactive(data, key, data[key]); //为每个data中属性添加get set方法,劫持数据状态
        });
    },
    defineReactive: function(data, key, val) {
        var dep = new Dep(); //创建订阅器
        var childObj = observe(val);
        Object.defineProperty(data, key, {
            enumerable: true,
            configurable: true,
            get: function getter() {
                if (Dep.target) { //如果监听属性存在，将该对象放入订阅器
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: function setter(newVal) {
                if (newVal === val) { //更新属性值时触发更新操作，通知订阅器触发watcher更新视图
                    return;
                }
                val = newVal;
                dep.notify();
            }
        });
    }
};

function observe(value, vm) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};

function Dep() {
    this.subs = []; //属性订阅器队列
}
Dep.prototype = {
    addSub: function(sub) { //将属性条件到订阅器
        this.subs.push(sub);
    },
    notify: function() { //订阅器更新属性
        this.subs.forEach(function(sub) {
            sub.update();
        });
    }
};
Dep.target = null;