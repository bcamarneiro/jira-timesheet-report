import type React from "react";
import { Link, useLocation } from "react-router-dom";

export const Navigation: React.FC = () => {
	const location = useLocation();

	const navStyle: React.CSSProperties = {
		backgroundColor: "#f8f9fa",
		padding: "1rem 0",
		borderBottom: "1px solid #dee2e6",
		marginBottom: "2rem",
	};

	const navContentStyle: React.CSSProperties = {
		maxWidth: "1200px",
		margin: "0 auto",
		padding: "0 2rem",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	};

	const linkStyle: React.CSSProperties = {
		textDecoration: "none",
		color: "#333",
		fontWeight: "500",
		padding: "0.5rem 1rem",
		borderRadius: "4px",
		transition: "background-color 0.2s",
	};

	const activeLinkStyle: React.CSSProperties = {
		...linkStyle,
		backgroundColor: "#007bff",
		color: "white",
	};

	const getLinkStyle = (path: string) => {
		return location.pathname === path ? activeLinkStyle : linkStyle;
	};

	return (
		<nav style={navStyle}>
			<div style={navContentStyle}>
				<Link to="/" style={{ textDecoration: "none", color: "#333" }}>
					<h2 style={{ margin: 0, fontSize: "1.5rem" }}>Jira Timesheet</h2>
				</Link>
				<div style={{ display: "flex", gap: "1rem" }}>
					<Link to="/" style={getLinkStyle("/")}>
						Home
					</Link>
					<Link to="/timesheet" style={getLinkStyle("/timesheet")}>
						Timesheet
					</Link>
				</div>
			</div>
		</nav>
	);
};
