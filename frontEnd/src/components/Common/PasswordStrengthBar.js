import zxcvbn from "zxcvbn";

const LABELS = ["매우 약함", "약함", "보통", "강함", "매우 강함"];
const WIDTHS = ["20%", "40%", "60%", "80%", "100%"];

export default function PasswordStrengthBar({ password }) {
	const result = zxcvbn(password ?? "");
	const score = result.score; // 0~4

	return (
		<div style={{ marginTop: 8 }}>
			<div style={{ height: 8, background: "#eee", borderRadius: 4 }}>
				<div
					style={{
						height: 8,
						width: WIDTHS[score],
						transition: "width 0.3s ease",
						background: score < 2 ? "#e74c3c" : score === 2 ? "#f1c40f" : "#2ecc71",
						borderRadius: 4
					}}
				/>
			</div>
			<small style={{ display: "block", marginTop: 4, color: "#666" }}>
				{LABELS[score]}
			</small>
		</div>
	);
}
