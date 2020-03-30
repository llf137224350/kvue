class KVue {
	constructor(options) {
		this.$options = options;
		// 数据响应式处理
		this.$data = options.data;
		// 对data数据进行观察
		this.observe(this.$data);

		// 测试
		// new Watcher(this, 'msg');
		// console.log(this.msg);
		// new Watcher(this, 'node.title');
		// console.log(this.node.title);

		new  Compile(options.el, this);

		options.created && options.created.call(this);
	}

	// 观察数据
	observe(data) {
		// 没有传入data 或者 data不是个对象
		if (!data || typeof data !== 'object') {
			return;
		}
		Object.keys(data).forEach((key) => {
			this.defineReactive(data, key, data[key]);
			// 代理data
			this.proxyData(key);
		})
	}

	// 定义响应式
	defineReactive(obj, key, value) {
		this.observe(value);
		// 创建对应的dep
		const dep = new Dep();
		// 数据拦截
		Object.defineProperty(obj, key, {
			get() {
				Dep.target && dep.addWatch(Dep.target);
				return value;
			},
			set(newValue) {
				if (newValue === value) return;
				// 更新
				value = newValue;
				// 通知
				dep.notify();
			}
		})
	}

	// data属性代理
	proxyData(key) {
		Object.defineProperty(this, key, {
			get() {
				return this.$data[key];
			},
			set(v) {
				this.$data[key] = v;
			}
		})
	}
}

class Dep {
	constructor() {
		// 监听者数组
		this.watchers = [];
	}

	// 添加
	addWatch(watcher) {
		// 添加监听者
		this.watchers.push(watcher);
	}

	// 通知更新
	notify() {
		// 遍历更新
		this.watchers.forEach((watcher) => {
			watcher.update();
		});
	}
}

// 监听器
class Watcher {
	// vm为kvue实例 key为实例data中的key
	constructor(vm, key, cb) {

		this.vm = vm;
		this.key = key;
		this.cb = cb;
		Dep.target = this;
		this.vm[this.key]; // 读取触发收集

		Dep.target = null;
	}

	update() {
		console.log(this.key + ' = 更新了');
		this.cb && this.cb.call(this.vm, this.vm[this.key]);
	}
}
