import { SwiperCell } from "./module";

import { processComponentName } from "./common/helpers/util";

const components = [
	SwiperCell
]

function install(Vue) {
	if (install.installed) {
		return;
	}
	install.installed = true;
	components.forEach(Component => {
		Component.install(Vue);
	});
}

const Tao = {
	/* eslint-disable no-undef */
	version: "1.0.0",
	install
};

components.forEach(Component => {
	const name = processComponentName(Component, {
		firstUpperCase: true
	});
	Tao[name] = Component;
});

if (typeof window !== "undefined" && window.Vue) {
	window.Vue.use(install);
}

export default Tao.SwiperCell;
