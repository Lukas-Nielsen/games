import { lazy, useEffect } from "react";
import { HashRouter, Route, Routes, useNavigate } from "react-router-dom";

import { Layout } from "./Layout";

const PageSwitch = lazy(() => import("./PageSwitch"));

const Redirect = ({ to }: { to: string }) => {
	const navigate = useNavigate();

	useEffect(() => {
		if (to) {
			void navigate(to, { replace: true });
		}
	}, [to]);

	return null;
};

const Main = () => {
	return (
		<HashRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Redirect to="/kniffel" />} />
					<Route path=":game" element={<PageSwitch />} />
				</Route>
			</Routes>
		</HashRouter>
	);
};

export default Main;
