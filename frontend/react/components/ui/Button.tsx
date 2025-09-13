import type React from "react";

type Props = {
	children: React.ReactNode;
	onClick?: () => void;
	type?: "button" | "submit" | "reset";
	variant?: "primary" | "secondary";
	style?: React.CSSProperties;
};

export const Button: React.FC<Props> = ({
	children,
	onClick,
	type = "button",
	variant = "primary",
	style = {},
}) => {
	const baseStyle: React.CSSProperties = {
		padding: "0.5em 1em",
		border: "1px solid #ccc",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "14px",
		fontWeight: "500",
		...style,
	};

	const variantStyles: Record<string, React.CSSProperties> = {
		primary: {
			backgroundColor: "#007bff",
			color: "white",
			borderColor: "#007bff",
		},
		secondary: {
			backgroundColor: "#f8f9fa",
			color: "#333",
			borderColor: "#ccc",
		},
	};

	return (
		<button
			type={type}
			onClick={onClick}
			style={{ ...baseStyle, ...variantStyles[variant] }}
		>
			{children}
		</button>
	);
};

