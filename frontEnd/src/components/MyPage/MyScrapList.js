import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";

export default function MyScrapList() {
	const { loginToken } = useContext(AuthContext);
	const [scraps, setScraps] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch(`${BASE_URL}/myPage/myScrap`, {
			headers: { Authorization: `Bearer ${loginToken}` }
		})
		.then(res => res.json())
		.then(setScraps)
		.finally(() => setLoading(false));
	}, [loginToken]);

	if (loading) return <div>불러오는 중...</div>;
	if (!scraps.length) return <div>스크랩한 글이 없습니다.</div>;

	return (
		<div>
			<h3>스크랩한 글</h3>
			<ul>
				{scraps.map(post => (
					<li key={post.id}>
						<button
							className="list-row"
							onClick={() => { /* 원문 이동 */ }}
							aria-label={`${post.title} 상세 이동`}
						>
							<span className="list-title">{post.title}</span>
							<span className="list-meta">{(post.createdAt || "").slice(0, 10)}</span>
						</button>
					</li>
				))}
			</ul>
		</div>
	);
}
