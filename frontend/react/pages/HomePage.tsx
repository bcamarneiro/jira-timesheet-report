import type React from "react";
import { Link } from "react-router-dom";

export const HomePage: React.FC = () => {
	return (
		<div
			style={{
				fontFamily: "sans-serif",
				maxWidth: "800px",
				margin: "0 auto",
				padding: "2rem",
				textAlign: "center",
			}}
		>
			<h1
				style={{
					fontSize: "3rem",
					marginBottom: "1rem",
					color: "#333",
				}}
			>
				Jira Timesheet Report
			</h1>

			<p
				style={{
					fontSize: "1.2rem",
					marginBottom: "2rem",
					color: "#666",
					lineHeight: "1.6",
				}}
			>
				Track and manage your team's time tracking data from Jira with ease.
				View timesheets, export reports, and analyze work patterns.
			</p>

			<div
				style={{
					display: "flex",
					gap: "1rem",
					justifyContent: "center",
					flexWrap: "wrap",
				}}
			>
				<Link
					to="/timesheet"
					style={{
						display: "inline-block",
						padding: "1rem 2rem",
						backgroundColor: "#007bff",
						color: "white",
						textDecoration: "none",
						borderRadius: "8px",
						fontSize: "1.1rem",
						fontWeight: "bold",
						transition: "background-color 0.2s",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.backgroundColor = "#0056b3";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.backgroundColor = "#007bff";
					}}
				>
					View Timesheet
				</Link>
			</div>

			<div
				style={{
					marginTop: "3rem",
					padding: "2rem",
					backgroundColor: "#f8f9fa",
					borderRadius: "8px",
					textAlign: "left",
				}}
			>
				<h2 style={{ marginBottom: "1rem", color: "#333" }}>Features</h2>
				<ul
					style={{
						listStyle: "none",
						padding: 0,
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
						gap: "1rem",
					}}
				>
					<li
						style={{
							padding: "1rem",
							backgroundColor: "white",
							borderRadius: "4px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<strong>📊 Timesheet View</strong>
						<br />
						Visual calendar interface for tracking work logs
					</li>
					<li
						style={{
							padding: "1rem",
							backgroundColor: "white",
							borderRadius: "4px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<strong>👥 Team Management</strong>
						<br />
						Select and view different team members
					</li>
					<li
						style={{
							padding: "1rem",
							backgroundColor: "white",
							borderRadius: "4px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<strong>📈 Export Reports</strong>
						<br />
						Download CSV reports for analysis
					</li>
					<li
						style={{
							padding: "1rem",
							backgroundColor: "white",
							borderRadius: "4px",
							boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
						}}
					>
						<strong>🔗 Jira Integration</strong>
						<br />
						Direct links to Jira issues and work logs
					</li>
				</ul>
			</div>
		</div>
	);
};
