import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../AuthContext";
import { BASE_URL } from "../../api/baseUrl";

export default function MyScrapList() {
    const { loginToken } = useContext(AuthContext);
    const [scraps, setScraps] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${BASE_URL}:8888/myPage/myScrap`, {
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
                        {post.title}
                        <span style={{color:"#888"}}> ({post.createdAt?.slice(0, 10)})</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
