class Compile {
	constructor(el, vm) {
		this.$vm = vm;
		this.$el = document.querySelector(el);

		// 1 先把些的模板 移动到fragment中，更新完成后追加回去
		this.$fragment = this.node2Fragment(this.$el);
		//2 进行编译
		this.compile(this.$fragment);
		// 结果追加到界面
		this.$el.appendChild(this.$fragment);
	}

	node2Fragment(el) {
		let fragment = document.createDocumentFragment();
		let child;
		while (child = el.firstChild) {
			fragment.appendChild(child)
		}
		console.log(fragment);
		return fragment;
	}

	// 编译
	compile(el) {
		const childNodes = el.childNodes;
		Array.from(childNodes).forEach((node) => {
			if (node.nodeType === 1) {
				// 元素节点
				console.log('元素节点：' + node.nodeName);
				this.compileElement(node);
			} else if (this.isInter(node)) {
				// {{}} 1.43
				console.log('插值文本：' + node.textContent);
				this.compileText(node);
			}
			// 递归子节点
			if (node.childNodes && node.childNodes.length > 0) {
				this.compile(node)
			}
		})
	}

	isInter(node) {
		return node.nodeType === 3 && /\{\{(.*)\}\}/ig.test(node.textContent)
	}
	// 编译元素节点
	compileElement(node) {
		// 获取节点上所有属性
		let nodeAttrs = node.attributes;
		Array.from(nodeAttrs).forEach((attr) => {
			// k-text=yyy k-html='<p>12</p>' @click
			let name = attr.name; // 属性名
			let value = attr.value; // 属性值
			// 判断指令
			if (name.indexOf('k-') === 0) {
				let dir = name.substring(2);
				this[dir] && this[dir](node, value); // text html v-model
			} else if (name.indexOf('@') === 0) {
				let eventName = name.substring(1);
				console.log(eventName)
				this.addEvent(node, eventName, value);
			}
		})
	}
	// 编译文本节点
	compileText(node) {
		let reg = RegExp.$1;
		console.log(reg);
		// 调用统一更新方法
		this.update(node, reg, 'text');
	}

	update(node, exp, dir) {
		let updator = this[dir + 'Updator'];
		// 首次初始化时会执行
		updator && updator(node, this.$vm[exp]);
		// 创建watcher
		new Watcher(this.$vm, exp, function (value) {
			updator && updator(node, value);
		})
	}


	// 更新text指令
	text(node, value) {
		// 调用之前文本更新函数
		this.update(node, value, 'text');
	}
	// 更新文本
	textUpdator(node, value) {
		node.textContent = value;
	}


	// 更新html指令
	html(node, value) {
		// 调用之前文本更新函数
		this.update(node, value, 'html');
	}

	// 更新html
	htmlUpdator(node, value) {
		node.innerHTML = value;
	}

	// v-model
	model(node, value) {
		this.update(node, value, 'model');
		const that = this;
		node.addEventListener('input', function (e) {
			that.$vm[value] = e.target.value;
			console.log(that.$vm.name);
		});
	}
	// 更新model
	modelUpdator(node, value) {
		node.value = value;

	}

	// 添加事件
	addEvent(node, eventName, eventCallBack) {
		const fn = this.$vm.$options.methods && this.$vm.$options.methods[eventCallBack];
		node.addEventListener(eventName, fn.bind(this.$vm));
	}
}
