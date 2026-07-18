import { ComponentType, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

type PageMap = {
	[key: string]: () => Promise<{ default: ComponentType<any> }>;
};

const pageMap: PageMap = {
	kniffel: () => import("./pages/Kniffel"),
};

export const PageSwitch = () => {
	const { game } = useParams<{ game?: string }>();
	const [Component, setComponent] = useState<ComponentType<any> | null>(null);

	useEffect(() => {
		if (!game) {
			setComponent(null);
			return;
		}
		const loader = pageMap[game];
		if (!loader) {
			setComponent(null);
			return;
		}
		let cancelled = false;
		void loader().then((mod) => {
			if (!cancelled) setComponent(() => mod.default);
		});
		return () => {
			cancelled = true;
		};
	}, [game]);

	return Component ? <Component /> : null;
};

export default PageSwitch;
