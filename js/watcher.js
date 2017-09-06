function Watcher(vm, exp, cb) {
    this.cb = cb;
    this.vm = vm;
    this.exp = exp;
    this.value = this.get(); // 将自己添加到订阅器的操作,获取value值为当前属性值
}

Watcher.prototype = {
    update: function() { //更新订阅器
        this.run();
    },
    run: function() { //更新状态，执行回调
        var value = this.vm.data[this.exp]; //获取data中属性值
        var oldVal = this.value; //获取订阅器中属性值
        if (value !== oldVal) { //属性值改变时执行回调，更新视图
            this.value = value;
            this.cb.call(this.vm, value, oldVal);
        }
    },
    get: function() {
        Dep.target = this; // 缓存自己，即每个属性创建的watcher对象
        var value = this.vm.data[this.exp] // 强制执行监听器里的get函数，劫持状态将watcher对象添加到订阅器
        Dep.target = null; // 释放自己
        return value;
    }
};